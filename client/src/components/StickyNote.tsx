import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { MessageSquare } from 'lucide-react';

interface StickyNoteProps {
    x: number;
    y: number;
    text: string;
    onSave?: (text: string) => void;
    onClose?: () => void;
}

export const StickyNote: React.FC<StickyNoteProps> = ({
    x,
    y,
    text,
    onSave,
    onClose
}) => {
    const [isOpen, setIsOpen] = useState(!text);
    const [value, setValue] = useState(text);

    const handleSave = () => {
        if (value.trim() && onSave) {
            onSave(value);
        }
        setIsOpen(false);
    };

    const handleClose = () => {
        setIsOpen(false);
        if (onClose && !value.trim()) onClose();
    };

    return (
        <>
            {/* Small Icon Marker */}
            <div
                className="absolute transform -translate-x-1/2 -translate-y-1/2 z-40 cursor-pointer group"
                style={{ left: x, top: y }}
                onClick={(e) => {
                    e.stopPropagation();
                    setIsOpen(true);
                }}
            >
                <div className="w-8 h-8 rounded-full bg-yellow-200 border-2 border-yellow-400 flex items-center justify-center shadow-md transition-transform group-hover:scale-110">
                    <MessageSquare className="w-4 h-4 text-yellow-700" />
                </div>
                {text && (
                    <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-blue-500 rounded-full border-2 border-white"></div>
                )}
            </div>

            {/* Dialog */}
            <Dialog open={isOpen} onOpenChange={setIsOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <MessageSquare className="w-5 h-5" />
                            Note
                        </DialogTitle>
                    </DialogHeader>

                    <div className="space-y-4">
                        <textarea
                            className="w-full p-3 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary resize-none bg-background text-foreground"
                            rows={6}
                            value={value}
                            onChange={(e) => setValue(e.target.value)}
                            placeholder="Type your note here..."
                            autoFocus
                        />
                    </div>

                    <div className="flex justify-end gap-2">
                        <Button
                            variant="outline"
                            onClick={handleClose}
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleSave}
                        >
                            Save Note
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
};
