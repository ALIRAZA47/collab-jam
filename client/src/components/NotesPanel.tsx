import React, { useState } from 'react';
import { MessageSquare, Send } from 'lucide-react';
import { Button } from './ui/button';

interface Note {
    id: string;
    x: number;
    y: number;
    text: string;
    author?: string;
    timestamp?: number;
}

interface NotesPanelProps {
    notes: Note[];
    username: string;
    onAddNote: (text: string) => void;
    onClose?: () => void;
}

export const NotesPanel: React.FC<NotesPanelProps> = ({ notes, username, onAddNote, onClose }) => {
    const [inputText, setInputText] = useState('');
    const [isOpen, setIsOpen] = useState(true);

    const handleSend = () => {
        if (inputText.trim()) {
            onAddNote(inputText.trim());
            setInputText('');
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    return (
        <div className="fixed right-4 top-4 bottom-4 w-80 bg-background border border-border rounded-lg shadow-2xl flex flex-col z-40">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-border">
                <div className="flex items-center gap-2">
                    <MessageSquare className="w-5 h-5" />
                    <h3 className="font-semibold">Notes</h3>
                    <span className="text-xs text-muted-foreground">({notes.length})</span>
                </div>
                <button
                    onClick={() => {
                        setIsOpen(!isOpen);
                        if (onClose && isOpen) onClose();
                    }}
                    className="text-xs text-muted-foreground hover:text-foreground"
                >
                    {isOpen ? 'Hide' : 'Show'}
                </button>
            </div>

            {isOpen && (
                <>
                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-3">
                        {notes.length === 0 ? (
                            <div className="text-center text-muted-foreground text-sm py-8">
                                No notes yet. Add one below!
                            </div>
                        ) : (
                            notes.map((note, index) => (
                                <div key={note.id} className="flex flex-col gap-1">
                                    <div className="flex items-center gap-2">
                                        <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-xs">
                                            {(note.author || username || 'A')[0].toUpperCase()}
                                        </div>
                                        <span className="text-sm font-medium">{note.author || username || 'Anonymous'}</span>
                                        <span className="text-xs text-muted-foreground">#{index + 1}</span>
                                    </div>
                                    <div className="ml-8 bg-muted rounded-lg p-3">
                                        <p className="text-sm whitespace-pre-wrap break-words">{note.text}</p>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    {/* Input */}
                    <div className="p-4 border-t border-border">
                        <div className="flex gap-2">
                            <textarea
                                value={inputText}
                                onChange={(e) => setInputText(e.target.value)}
                                onKeyPress={handleKeyPress}
                                placeholder="Type a note..."
                                className="flex-1 p-2 text-sm border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary resize-none bg-background"
                                rows={2}
                            />
                            <Button
                                onClick={handleSend}
                                disabled={!inputText.trim()}
                                size="icon"
                                className="self-end"
                            >
                                <Send className="w-4 h-4" />
                            </Button>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};
