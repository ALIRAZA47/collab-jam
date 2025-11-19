import React from 'react';
import { MousePointer, Pencil, Square, Circle, Type, StickyNote, Share2, Download, Sun, Moon } from 'lucide-react';
import type { Tool } from '../types';
import { useTheme } from './ThemeProvider';

interface ToolbarProps {
    activeTool: Tool;
    setActiveTool: (tool: Tool) => void;
    onExport: () => void;
    onToggleNotes: () => void;
    notesPanelOpen: boolean;
}

export const Toolbar: React.FC<ToolbarProps> = ({ activeTool, setActiveTool, onExport, onToggleNotes, notesPanelOpen }) => {
    const { theme, toggleTheme } = useTheme();

    const tools: { id: Tool; label: string; icon: React.ReactNode }[] = [
        { id: 'select', label: 'Select', icon: <MousePointer className="w-5 h-5" /> },
        { id: 'pencil', label: 'Pen', icon: <Pencil className="w-5 h-5" /> },
        { id: 'rect', label: 'Rectangle', icon: <Square className="w-5 h-5" /> },
        { id: 'circle', label: 'Circle', icon: <Circle className="w-5 h-5" /> },
        { id: 'text', label: 'Text', icon: <Type className="w-5 h-5" /> },
        { id: 'note', label: 'Sticky Note', icon: <StickyNote className="w-5 h-5" /> },
    ];

    const handleShare = () => {
        navigator.clipboard.writeText(window.location.href);
        alert('Link copied! Share it with your team.');
    };

    return (
        <div className="fixed left-4 top-1/2 -translate-y-1/2 bg-background rounded-2xl shadow-lg border border-border p-2 flex flex-col gap-1 z-[100]">
            {tools.filter(t => t.id !== 'note').map((tool) => (
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

            {/* Note button - toggles panel instead */}
            <button
                className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all ${notesPanelOpen
                    ? 'bg-primary text-primary-foreground shadow-md'
                    : 'text-foreground hover:bg-accent'
                    }`}
                onClick={onToggleNotes}
                title="Notes"
            >
                <StickyNote className="w-5 h-5" />
            </button>

            <div className="h-px bg-border my-1"></div>

            <button
                className="w-12 h-12 rounded-xl flex items-center justify-center text-foreground hover:bg-accent transition-all"
                onClick={toggleTheme}
                title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
            >
                {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
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
    );
};
