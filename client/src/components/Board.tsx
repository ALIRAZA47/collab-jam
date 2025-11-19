import React, { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import { fabric } from 'fabric';
import { useSocket } from '../hooks/useSocket';
import { Toolbar } from './Toolbar';
import { NotesPanel } from './NotesPanel';
import { NoteMarker } from './NoteMarker';
import { UsernameDialog } from './UsernameDialog';
import type { Tool, Cursor } from '../types';

export const Board: React.FC = () => {
    const { roomId } = useParams<{ roomId: string }>();
    const { socket } = useSocket();
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const fabricCanvas = useRef<fabric.Canvas | null>(null);
    const [activeTool, setActiveTool] = useState<Tool>('select');
    const [cursors, setCursors] = useState<Cursor[]>([]);
    const [notes, setNotes] = useState<{ id: string, x: number, y: number, text: string, author?: string, timestamp?: number }[]>([]);
    const [username, setUsername] = useState<string>(localStorage.getItem('username') || '');
    const [showUsernameDialog, setShowUsernameDialog] = useState(!localStorage.getItem('username'));
    const [notesPanelOpen, setNotesPanelOpen] = useState(false);

    useEffect(() => {
        if (!canvasRef.current) return;

        const canvas = new fabric.Canvas(canvasRef.current, {
            width: window.innerWidth,
            height: window.innerHeight,
            backgroundColor: '#ffffff',
            isDrawingMode: false,
        });

        fabricCanvas.current = canvas;

        const handleResize = () => {
            canvas.setDimensions({
                width: window.innerWidth,
                height: window.innerHeight,
            });
        };
        window.addEventListener('resize', handleResize);

        if (socket && roomId) {
            socket.emit('join-room', roomId);

            socket.on('server-state', (state: { fabricObjects: any[], notes: any[] }) => {
                // Load fabric objects
                if (state.fabricObjects && state.fabricObjects.length > 0) {
                    fabric.util.enlivenObjects(state.fabricObjects, (objs: any[]) => {
                        objs.forEach(o => canvas.add(o));
                        canvas.renderAll();
                    }, 'fabric');
                }

                // Load notes
                if (state.notes && state.notes.length > 0) {
                    setNotes(state.notes);
                }
            });

            socket.on('draw-action', (data: { action: string, object: any }) => {
                if (data.action === 'add') {
                    fabric.util.enlivenObjects([data.object], (objs: any[]) => {
                        objs.forEach(o => canvas.add(o));
                        canvas.renderAll();
                    }, 'fabric');
                } else if (data.action === 'modify') {
                    // Find and update the modified object
                    const objects = canvas.getObjects();
                    const targetObj = objects.find((obj: any) => obj.id === data.object.id);
                    if (targetObj) {
                        targetObj.set({
                            left: data.object.left,
                            top: data.object.top,
                            scaleX: data.object.scaleX,
                            scaleY: data.object.scaleY,
                            angle: data.object.angle,
                        });
                        canvas.renderAll();
                    }
                } else if (data.action === 'add-note') {
                    setNotes(prev => {
                        const exists = prev.find(n => n.id === data.object.id);
                        if (exists) {
                            return prev.map(n => n.id === data.object.id ? data.object : n);
                        }
                        return [...prev, data.object];
                    });
                }
            });

            socket.on('cursor-move', (data: Cursor) => {
                setCursors(prev => {
                    const filtered = prev.filter(c => c.userId !== data.userId);
                    return [...filtered, data];
                });
            });

            canvas.on('path:created', (e: any) => {
                const json = e.path.toJSON();
                socket.emit('draw-action', { roomId, action: 'add', object: json });
            });

            // Sync object modifications (moving, resizing, etc.)
            canvas.on('object:modified', (e: any) => {
                if (e.target) {
                    const json = e.target.toJSON(['id']);
                    socket.emit('draw-action', { roomId, action: 'modify', object: json });
                }
            });

            canvas.on('mouse:move', (e) => {
                if (!e.pointer) return;
                socket.emit('cursor-move', {
                    roomId,
                    x: e.pointer.x,
                    y: e.pointer.y,
                    color: '#1a73e8',
                    username: username || 'Anonymous'
                });
            });
        }

        return () => {
            window.removeEventListener('resize', handleResize);
            canvas.dispose();
            socket?.off('draw-action');
            socket?.off('cursor-move');
        };
    }, [socket, roomId]);

    useEffect(() => {
        if (!fabricCanvas.current) return;
        const canvas = fabricCanvas.current;

        canvas.isDrawingMode = activeTool === 'pencil';
        if (activeTool === 'pencil') {
            canvas.freeDrawingBrush.width = 3;
            canvas.freeDrawingBrush.color = '#000000';
        } else {
            canvas.off('mouse:down');
            canvas.on('mouse:down', (o) => {
                if (activeTool === 'select' || activeTool === 'pencil') return;

                const pointer = canvas.getPointer(o.e);

                if (activeTool === 'note') {
                    const id = Math.random().toString(36).substr(2, 9);
                    const newNote = {
                        id,
                        x: pointer.x,
                        y: pointer.y,
                        text: '',
                        author: username || 'Anonymous',
                        timestamp: Date.now()
                    };
                    setNotes(prev => [...prev, newNote]);
                    setActiveTool('select');
                    return;
                }

                let object: any;
                const id = Math.random().toString(36).substr(2, 9);

                if (activeTool === 'rect') {
                    object = new fabric.Rect({
                        left: pointer.x,
                        top: pointer.y,
                        width: 150,
                        height: 100,
                        fill: 'transparent',
                        stroke: '#1a73e8',
                        strokeWidth: 3,
                        rx: 8,
                        ry: 8,
                    });
                } else if (activeTool === 'circle') {
                    object = new fabric.Circle({
                        left: pointer.x,
                        top: pointer.y,
                        radius: 60,
                        fill: 'transparent',
                        stroke: '#1a73e8',
                        strokeWidth: 3,
                    });
                } else if (activeTool === 'text') {
                    object = new fabric.IText('Type here', {
                        left: pointer.x,
                        top: pointer.y,
                        fontFamily: 'Google Sans, Arial',
                        fontSize: 18,
                        fill: '#202124',
                    });
                }

                if (object) {
                    object.set({ id });
                    canvas.add(object);
                    socket?.emit('draw-action', { roomId, action: 'add', object: object.toJSON(['id']) });
                    setActiveTool('select');
                }
            });
        }

        return () => {
            canvas.off('mouse:down');
        };
    }, [activeTool, roomId, socket]);

    const handleExport = () => {
        if (!fabricCanvas.current) return;
        const url = fabricCanvas.current.toDataURL({ format: 'png' });
        const link = document.createElement('a');
        link.href = url;
        link.download = `jam-${roomId}.png`;
        link.click();
    };

    return (
        <div className="relative w-full h-full overflow-hidden bg-white">
            <Toolbar
                activeTool={activeTool}
                setActiveTool={setActiveTool}
                onExport={handleExport}
                onToggleNotes={() => setNotesPanelOpen(!notesPanelOpen)}
                notesPanelOpen={notesPanelOpen}
            />
            <canvas ref={canvasRef} />

            {notesPanelOpen && (
                <NotesPanel
                    notes={notes}
                    username={username}
                    onAddNote={(text) => {
                        // Find the last note with empty text or create a new one
                        const emptyNote = notes.find(n => !n.text);
                        if (emptyNote) {
                            const updated = { ...emptyNote, text, author: username };
                            setNotes(prev => prev.map(n => n.id === emptyNote.id ? updated : n));
                            socket?.emit('draw-action', { roomId, action: 'add-note', object: updated });
                        } else {
                            // Create a centered note if no marker exists
                            const newNote = {
                                id: Math.random().toString(36).substr(2, 9),
                                x: window.innerWidth / 2,
                                y: window.innerHeight / 2,
                                text,
                                author: username,
                                timestamp: Date.now()
                            };
                            setNotes(prev => [...prev, newNote]);
                            socket?.emit('draw-action', { roomId, action: 'add-note', object: newNote });
                        }
                    }}
                    onClose={() => setNotesPanelOpen(false)}
                />
            )}

            {notes.map((note, index) => (
                <NoteMarker
                    key={note.id}
                    id={note.id}
                    x={note.x}
                    y={note.y}
                    index={index + 1}
                    onMove={(x, y) => {
                        const updated = { ...note, x, y };
                        setNotes(prev => prev.map(n => n.id === note.id ? updated : n));
                        socket?.emit('draw-action', { roomId, action: 'add-note', object: updated });
                    }}
                />
            ))}
            <UsernameDialog
                open={showUsernameDialog}
                onSubmit={(name) => {
                    setUsername(name);
                    setShowUsernameDialog(false);
                    localStorage.setItem('username', name);
                }}
            />

            <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
                {cursors.map(cursor => (
                    <div key={cursor.userId}
                        className="absolute"
                        style={{
                            left: cursor.x,
                            top: cursor.y,
                            transform: 'translate(-2px, -2px)'
                        }}
                    >
                        <svg width="20" height="20" viewBox="0 0 20 20">
                            <path d="M0 0 L0 16 L6 11 L9 18 L11 17 L8 10 L14 10 Z" fill={cursor.color || '#1a73e8'} />
                        </svg>
                        <span className="absolute top-5 left-5 text-xs bg-white px-2 py-1 rounded shadow text-gray-700 border border-border">
                            {cursor.username || 'Anonymous'}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
};
