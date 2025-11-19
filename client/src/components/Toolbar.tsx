import React from 'react';
import { MousePointer, Pencil, Square, Circle, Type, Share2, Download, Sun, Moon, ArrowRight, Minus, Triangle, Eraser, Star, Diamond, Hexagon, Image, Trash2 } from 'lucide-react';
import type { Tool } from '../types';
import { useTheme } from './ThemeProvider';

interface ToolbarProps {
    activeTool: Tool;
    setActiveTool: (tool: Tool) => void;
    onExport: () => void;
    onImageUpload: () => void;
    onClear: () => void;
}

export const Toolbar: React.FC<ToolbarProps> = ({ activeTool, setActiveTool, onExport, onImageUpload, onClear }) => {
    const { theme, toggleTheme } = useTheme();

    const tools: { id: Tool; label: string; icon: React.ReactNode }[] = [
        { id: 'select', label: 'Select', icon: <MousePointer className="w-5 h-5" /> },
        { id: 'pencil', label: 'Pen', icon: <Pencil className="w-5 h-5" /> },
        { id: 'eraser', label: 'Eraser', icon: <Eraser className="w-5 h-5" /> },
        { id: 'line', label: 'Line', icon: <Minus className="w-5 h-5" /> },
        { id: 'arrow', label: 'Arrow', icon: <ArrowRight className="w-5 h-5" /> },
        { id: 'rect', label: 'Rectangle', icon: <Square className="w-5 h-5" /> },
        { id: 'circle', label: 'Circle', icon: <Circle className="w-5 h-5" /> },
        { id: 'triangle', label: 'Triangle', icon: <Triangle className="w-5 h-5" /> },
        { id: 'diamond', label: 'Diamond', icon: <Diamond className="w-5 h-5" /> },
        { id: 'star', label: 'Star', icon: <Star className="w-5 h-5" /> },
        { id: 'hexagon', label: 'Hexagon', icon: <Hexagon className="w-5 h-5" /> },
        { id: 'text', label: 'Text', icon: <Type className="w-5 h-5" /> },
    ];

    const handleShare = () => {
        navigator.clipboard.writeText(window.location.href);
        alert('Link copied! Share it with your team.');
    };

    return (
        <div className="fixed left-4 top-1/2 -translate-y-1/2 z-[100]">
            <div className="relative max-h-[80vh] bg-background rounded-2xl shadow-lg border border-border p-2 flex flex-col gap-1">
                {/* Scroll indicator - top */}
                <div className="absolute -top-2 left-1/2 -translate-x-1/2 opacity-50 pointer-events-none">
                    <div className="w-6 h-1 bg-primary rounded-full animate-pulse"></div>
                </div>

                {/* Scrollable content */}
                <div className="toolbar-scroll overflow-y-auto flex flex-col gap-1 px-1">
                    {tools.map((tool) => (
                        <button
                            key={tool.id}
                            className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all ${activeTool === tool.id
                                ? 'bg-primary text-primary-foreground shadow-md'
                                : 'text-foreground hover:bg-accent'
                                }`}
                            onClick={() => setActiveTool(tool.id)}
                            title={tool.label}
                        >
                            {tool.icon}
                        </button>
                    ))}

                    <div className="h-px bg-border my-1"></div>
                    {/* 
                    <button
                        className="w-12 h-12 rounded-xl flex items-center justify-center transition-all text-foreground hover:bg-accent"
                        onClick={onImageUpload}
                        title="Upload Image"
                    >
                        <Image className="w-5 h-5" />
                    </button>

                    <button
                        className="w-12 h-12 rounded-xl flex items-center justify-center transition-all text-foreground hover:bg-accent"
                        onClick={onClear}
                        title="Clear Canvas"
                    >
                        <Trash2 className="w-5 h-5" />
                    </button>

                    <div className="h-px bg-border my-1"></div> */}

                    <button
                        className="w-12 h-12 rounded-xl flex items-center justify-center text-foreground hover:bg-accent transition-all"
                        onClick={toggleTheme}
                        title={theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
                    >
                        {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                    </button>

                    <button
                        className="w-12 h-12 rounded-xl flex items-center justify-center text-foreground hover:bg-accent transition-all"
                        onClick={handleShare}
                        title="Share"
                    >
                        <Share2 className="w-5 h-5" />
                    </button>

                    <button
                        className="w-12 h-12 rounded-xl flex items-center justify-center text-foreground hover:bg-accent transition-all"
                        onClick={onExport}
                        title="Export"
                    >
                        <Download className="w-5 h-5" />
                    </button>
                </div>

                {/* Scroll indicator - bottom */}
                <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 opacity-50 pointer-events-none">
                    <div className="w-6 h-1 bg-primary rounded-full animate-pulse"></div>
                </div>
            </div>
        </div>
    );
};
