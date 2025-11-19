import React, { useState, useEffect } from 'react';
import { MessageSquare } from 'lucide-react';

interface NoteMarkerProps {
    id: string;
    x: number;
    y: number;
    index: number;
    onMove?: (x: number, y: number) => void;
}

export const NoteMarker: React.FC<NoteMarkerProps> = ({ id, x, y, index, onMove }) => {
    const [isDragging, setIsDragging] = useState(false);
    const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

    const handleMouseDown = (e: React.MouseEvent) => {
        e.stopPropagation();
        setIsDragging(true);
        setDragOffset({
            x: e.clientX - x,
            y: e.clientY - y
        });
    };

    const handleMouseMove = (e: MouseEvent) => {
        if (isDragging && onMove) {
            onMove(e.clientX - dragOffset.x, e.clientY - dragOffset.y);
        }
    };

    const handleMouseUp = () => {
        setIsDragging(false);
    };

    useEffect(() => {
        if (isDragging) {
            window.addEventListener('mousemove', handleMouseMove);
            window.addEventListener('mouseup', handleMouseUp);
            return () => {
                window.removeEventListener('mousemove', handleMouseMove);
                window.removeEventListener('mouseup', handleMouseUp);
            };
        }
    }, [isDragging, dragOffset]);

    return (
        <div
            className="absolute transform -translate-x-1/2 -translate-y-1/2 z-40 group"
            style={{
                left: x,
                top: y,
                cursor: isDragging ? 'grabbing' : 'grab'
            }}
            onMouseDown={handleMouseDown}
        >
            <div className="relative">
                <div className="w-8 h-8 rounded-full bg-yellow-200 border-2 border-yellow-400 flex items-center justify-center shadow-md transition-transform group-hover:scale-110">
                    <MessageSquare className="w-4 h-4 text-yellow-700" />
                </div>
                <div className="absolute -top-1 -right-1 w-5 h-5 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold border-2 border-white">
                    {index}
                </div>
            </div>
        </div>
    );
};
