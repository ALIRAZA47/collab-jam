import { Server, Socket } from 'socket.io';

interface BoardState {
    fabricObjects: any[];
    notes: any[];
}

const rooms = new Map<string, BoardState>();

export const setupSocket = (io: Server) => {
    io.on('connection', (socket: Socket) => {
        console.log('User connected:', socket.id);

        socket.on('join-room', (roomId: string) => {
            socket.join(roomId);
            console.log(`User ${socket.id} joined room ${roomId}`);

            // Initialize room if it doesn't exist
            if (!rooms.has(roomId)) {
                rooms.set(roomId, { fabricObjects: [], notes: [] });
            }

            // Send existing state to the new user
            const roomState = rooms.get(roomId)!;
            socket.emit('server-state', roomState);
        });

        socket.on('draw-action', (data: { roomId: string, action: string, object: any }) => {
            const { roomId, action, object } = data;
            const roomState = rooms.get(roomId);

            if (!roomState) return;

            if (action === 'add') {
                // Add fabric object
                roomState.fabricObjects.push(object);
                socket.to(roomId).emit('draw-action', data);
            } else if (action === 'modify') {
                // Update existing fabric object
                const existingIndex = roomState.fabricObjects.findIndex((obj: any) => obj.id === object.id);
                if (existingIndex >= 0) {
                    roomState.fabricObjects[existingIndex] = object;
                }
                socket.to(roomId).emit('draw-action', data);
            } else if (action === 'add-note') {
                // Add/update note
                const existingIndex = roomState.notes.findIndex((n: any) => n.id === object.id);
                if (existingIndex >= 0) {
                    roomState.notes[existingIndex] = object;
                } else {
                    roomState.notes.push(object);
                }
                socket.to(roomId).emit('draw-action', data);
            }

            rooms.set(roomId, roomState);
        });

        socket.on('cursor-move', (data: any) => {
            socket.to(data.roomId).emit('cursor-move', { ...data, userId: socket.id });
        });

        socket.on('disconnect', () => {
            console.log('User disconnected:', socket.id);
        });
    });
};
