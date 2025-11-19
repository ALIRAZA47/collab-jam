import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { UserCircle } from 'lucide-react';

interface UsernameDialogProps {
    open: boolean;
    onSubmit: (name: string) => void;
}

export const UsernameDialog: React.FC<UsernameDialogProps> = ({ open, onSubmit }) => {
    const [name, setName] = useState('');

    const handleSubmit = () => {
        if (name.trim()) {
            onSubmit(name.trim());
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && name.trim()) {
            handleSubmit();
        }
    };

    return (
        <Dialog open={open} onOpenChange={() => { }}>
            <DialogContent className="sm:max-w-md" hideClose>
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <UserCircle className="w-5 h-5" />
                        Welcome to Collab Jam!
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-4">
                    <p className="text-sm text-muted-foreground">
                        Enter your name to join this board
                    </p>

                    <input
                        type="text"
                        className="w-full px-4 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                        placeholder="Your name..."
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        onKeyPress={handleKeyPress}
                        autoFocus
                        maxLength={20}
                    />
                </div>

                <div className="flex justify-end mt-4">
                    <Button onClick={handleSubmit} disabled={!name.trim()}>
                        Join Board
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
};
