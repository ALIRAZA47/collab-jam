import React, { useState } from 'react';

interface CommentMarkerProps {
    x: number;
    y: number;
    text: string;
    author?: string;
    onSave?: (text: string) => void;
}

export const CommentMarker: React.FC<CommentMarkerProps> = ({ x, y, text, author = 'User', onSave }) => {
    const [isHovered, setIsHovered] = useState(false);
    const [isEditing, setIsEditing] = useState(!text);
    const [value, setValue] = useState(text);

    const handleSave = () => {
        if (value.trim() && onSave) {
            onSave(value);
            setIsEditing(false);
        }
    };

    return (
        <div
            className="absolute z-50"
            style={{ left: x, top: y }}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            {/* Avatar/Marker */}
            <div className={`w-8 h-8 rounded-full bg-yellow-400 border-2 border-white shadow-lg flex items-center justify-center cursor-pointer transition-transform hover:scale-110 ${isHovered || isEditing ? 'scale-110' : ''}`}>
                <span className="text-black font-bold text-xs">💬</span>
            </div>

            {/* Popover */}
            {(isHovered || isEditing) && (
                <div className="absolute top-10 left-0 bg-white rounded-lg shadow-xl p-3 w-64 animate-fade-in">
                    <div className="flex items-center gap-2 mb-2">
                        <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-xs text-gray-600">
                            {author[0]}
                        </div>
                        <span className="text-sm font-semibold text-gray-800">{author}</span>
                    </div>

                    {isEditing ? (
                        <div className="flex flex-col gap-2">
                            <textarea
                                className="w-full p-2 text-sm border rounded bg-gray-50 text-gray-800 focus:outline-none focus:ring-2 focus:ring-accent"
                                rows={3}
                                value={value}
                                onChange={(e) => setValue(e.target.value)}
                                placeholder="Type your comment..."
                                autoFocus
                            />
                            <button
                                className="self-end px-3 py-1 bg-accent text-white text-sm rounded hover:bg-accent-hover"
                                onClick={handleSave}
                            >
                                Post
                            </button>
                        </div>
                    ) : (
                        <p className="text-sm text-gray-600">{text}</p>
                    )}
                </div>
            )}
        </div>
    );
};
