import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { fabric } from 'fabric';
import { useSocket } from '../hooks/useSocket';
import { Toolbar } from './Toolbar';
import { UsernameDialog } from './UsernameDialog';
import type { Tool, Cursor } from '../types';
import { db } from '../lib/firebase';
import { doc, setDoc, getDoc } from 'firebase/firestore';

export const Board: React.FC = () => {
    const { roomId } = useParams<{ roomId: string }>();
    const { socket } = useSocket();
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const fabricCanvas = useRef<fabric.Canvas | null>(null);
    const [activeTool, setActiveTool] = useState<Tool>('select');
    const [cursors, setCursors] = useState<Cursor[]>([]);
    const [username, setUsername] = useState<string>(localStorage.getItem('username') || '');
    const [showUsernameDialog, setShowUsernameDialog] = useState(!localStorage.getItem('username'));
    const [lastSaved, setLastSaved] = useState<Date | null>(null);
    const saveTimerRef = useRef<NodeJS.Timeout | null>(null);

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

            socket.on('server-state', (state: { fabricObjects: any[] }) => {
                // Load fabric objects
                if (state.fabricObjects && state.fabricObjects.length > 0) {
                    fabric.util.enlivenObjects(state.fabricObjects, (objs: any[]) => {
                        objs.forEach(o => canvas.add(o));
                        canvas.renderAll();
                    }, 'fabric');
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
                }
            });

            socket.on('clear-canvas', () => {
                if (fabricCanvas.current) {
                    fabricCanvas.current.clear();
                    fabricCanvas.current.backgroundColor = '#ffffff';
                    fabricCanvas.current.renderAll();
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
    }, [socket, roomId, username]);

    useEffect(() => {
        if (!fabricCanvas.current) return;
        const canvas = fabricCanvas.current;

        // Handle drawing and eraser modes
        canvas.isDrawingMode = activeTool === 'pencil';
        if (activeTool === 'pencil') {
            canvas.freeDrawingBrush.width = 3;
            canvas.freeDrawingBrush.color = '#000000';
        } else if (activeTool === 'eraser') {
            canvas.isDrawingMode = true;
            canvas.freeDrawingBrush.width = 20;
            canvas.freeDrawingBrush.color = '#ffffff'; // White to erase on white canvas
        } else {
            canvas.off('mouse:down');
            canvas.on('mouse:down', (o) => {
                if (activeTool === 'select') return;

                const pointer = canvas.getPointer(o.e);

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
                } else if (activeTool === 'triangle') {
                    object = new fabric.Triangle({
                        left: pointer.x,
                        top: pointer.y,
                        width: 100,
                        height: 100,
                        fill: 'transparent',
                        stroke: '#1a73e8',
                        strokeWidth: 3,
                    });
                } else if (activeTool === 'line') {
                    object = new fabric.Line([pointer.x, pointer.y, pointer.x + 150, pointer.y], {
                        stroke: '#1a73e8',
                        strokeWidth: 3,
                    });
                } else if (activeTool === 'arrow') {
                    // Create arrow using line and triangle
                    const line = new fabric.Line([pointer.x, pointer.y, pointer.x + 150, pointer.y], {
                        stroke: '#1a73e8',
                        strokeWidth: 3,
                    });
                    const triangle = new fabric.Triangle({
                        left: pointer.x + 150,
                        top: pointer.y,
                        width: 15,
                        height: 15,
                        fill: '#1a73e8',
                        angle: 90,
                        originX: 'center',
                        originY: 'center',
                    });
                    object = new fabric.Group([line, triangle], {
                        left: pointer.x,
                        top: pointer.y,
                    });
                } else if (activeTool === 'star') {
                    // Create a star shape using polygon
                    const points = [];
                    const outerRadius = 50;
                    const innerRadius = 25;
                    const spikes = 5;
                    for (let i = 0; i < spikes * 2; i++) {
                        const radius = i % 2 === 0 ? outerRadius : innerRadius;
                        const angle = (i * Math.PI) / spikes;
                        points.push({
                            x: radius * Math.sin(angle),
                            y: -radius * Math.cos(angle)
                        });
                    }
                    object = new fabric.Polygon(points, {
                        left: pointer.x,
                        top: pointer.y,
                        fill: 'transparent',
                        stroke: '#1a73e8',
                        strokeWidth: 3,
                    });
                } else if (activeTool === 'diamond') {
                    // Create diamond using polygon
                    const size = 60;
                    const points = [
                        { x: 0, y: -size },
                        { x: size, y: 0 },
                        { x: 0, y: size },
                        { x: -size, y: 0 }
                    ];
                    object = new fabric.Polygon(points, {
                        left: pointer.x,
                        top: pointer.y,
                        fill: 'transparent',
                        stroke: '#1a73e8',
                        strokeWidth: 3,
                    });
                } else if (activeTool === 'hexagon') {
                    // Create hexagon using polygon
                    const points = [];
                    const radius = 50;
                    for (let i = 0; i < 6; i++) {
                        const angle = (i * Math.PI) / 3;
                        points.push({
                            x: radius * Math.cos(angle),
                            y: radius * Math.sin(angle)
                        });
                    }
                    object = new fabric.Polygon(points, {
                        left: pointer.x,
                        top: pointer.y,
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

    // Save canvas to Firebase
    const saveToFirebase = useCallback(async () => {
        if (!fabricCanvas.current || !roomId) return;

        try {
            const canvas = fabricCanvas.current;
            const canvasData = {
                objects: canvas.toJSON(['id']).objects,
                version: Date.now(),
                lastModified: new Date().toISOString(),
            };

            await setDoc(doc(db, 'canvases', roomId), canvasData);
            setLastSaved(new Date());
            console.log('Canvas saved to Firebase');
        } catch (error) {
            console.error('Error saving to Firebase:', error);
        }
    }, [roomId]);

    // Load canvas from Firebase
    const loadFromFirebase = useCallback(async () => {
        if (!fabricCanvas.current || !roomId) return;

        try {
            const docRef = doc(db, 'canvases', roomId);
            const docSnap = await getDoc(docRef);

            if (docSnap.exists()) {
                const data = docSnap.data();
                const canvas = fabricCanvas.current;

                canvas.clear();
                if (data.objects && data.objects.length > 0) {
                    fabric.util.enlivenObjects(data.objects, (objs: any[]) => {
                        objs.forEach(o => canvas.add(o));
                        canvas.renderAll();
                    }, 'fabric');
                }
                console.log('Canvas loaded from Firebase');
            }
        } catch (error) {
            console.error('Error loading from Firebase:', error);
        }
    }, [roomId]);

    // Auto-save every 10 seconds
    useEffect(() => {
        if (!fabricCanvas.current || !roomId) return;

        // Initial load from Firebase
        loadFromFirebase();

        // Setup auto-save
        saveTimerRef.current = setInterval(() => {
            saveToFirebase();
        }, 10000); // 10 seconds

        return () => {
            if (saveTimerRef.current) {
                clearInterval(saveTimerRef.current);
            }
        };
    }, [roomId, loadFromFirebase, saveToFirebase]);

    // Keyboard shortcut for save (Cmd+S / Ctrl+S)
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.metaKey || e.ctrlKey) && e.key === 's') {
                e.preventDefault();
                saveToFirebase();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [saveToFirebase]);

    // Save when canvas changes
    useEffect(() => {
        if (!fabricCanvas.current) return;

        const canvas = fabricCanvas.current;
        const handleObjectChange = () => {
            // Debounce save on changes
            if (saveTimerRef.current) {
                clearInterval(saveTimerRef.current);
            }
            saveTimerRef.current = setInterval(() => {
                saveToFirebase();
            }, 10000);
        };

        canvas.on('object:added', handleObjectChange);
        canvas.on('object:modified', handleObjectChange);
        canvas.on('object:removed', handleObjectChange);

        return () => {
            canvas.off('object:added', handleObjectChange);
            canvas.off('object:modified', handleObjectChange);
            canvas.off('object:removed', handleObjectChange);
        };
    }, [saveToFirebase]);

    const handleExport = () => {
        if (!fabricCanvas.current) return;
        const canvas = fabricCanvas.current;
        const link = document.createElement('a');
        link.href = canvas.toDataURL({ format: 'png', quality: 1 });
        link.download = `jam-${roomId}.png`;
        link.click();
    };

    const handleImageUpload = () => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        input.onchange = (e: any) => {
            const file = e.target.files[0];
            if (file && fabricCanvas.current) {
                const reader = new FileReader();
                reader.onload = (event: any) => {
                    fabric.Image.fromURL(event.target.result, (img: any) => {
                        if (!fabricCanvas.current) return;
                        img.scale(0.5);
                        img.set({ left: 100, top: 100 });
                        const id = Math.random().toString(36).substr(2, 9);
                        img.set({ id });
                        fabricCanvas.current.add(img);
                        socket?.emit('draw-action', {
                            roomId,
                            action: 'add',
                            object: img.toJSON(['id'])
                        });
                    });
                };
                reader.readAsDataURL(file);
            }
        };
        input.click();
    };

    const handleClear = () => {
        if (!fabricCanvas.current) return;
        if (window.confirm('Are you sure you want to clear the entire canvas? This cannot be undone.')) {
            fabricCanvas.current.clear();
            fabricCanvas.current.backgroundColor = '#ffffff';
            fabricCanvas.current.renderAll();
            // Notify other users to clear their canvas
            socket?.emit('clear-canvas', { roomId });
        }
    };

    return (
        <div className="relative w-full h-full overflow-hidden bg-white">
            <Toolbar
                activeTool={activeTool}
                setActiveTool={setActiveTool}
                onExport={handleExport}
                onImageUpload={handleImageUpload}
                onClear={handleClear}
            />
            <canvas ref={canvasRef} />

            <UsernameDialog
                open={showUsernameDialog}
                onSubmit={(name) => {
                    setUsername(name);
                    localStorage.setItem('username', name);
                    setShowUsernameDialog(false);
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
