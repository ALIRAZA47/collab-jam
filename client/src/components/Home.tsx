import React from 'react';
import { useNavigate } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';

export const Home: React.FC = () => {
    const navigate = useNavigate();

    const createBoard = () => {
        const roomId = uuidv4();
        navigate(`/${roomId}`);
    };

    return (
        <div className="flex items-center justify-center h-screen bg-gradient-to-br from-blue-50 to-white">
            <div className="text-center p-12 max-w-2xl">
                <div className="mb-8">
                    <h1 className="text-6xl font-bold mb-4 text-gray-900">
                        Collab Jam
                    </h1>
                    <p className="text-xl text-gray-600">
                        A modern collaborative whiteboard for teams
                    </p>
                </div>

                <button
                    className="bg-primary text-white px-8 py-4 text-lg font-medium rounded-full transition-all duration-200 hover:bg-primary-hover hover:shadow-lg"
                    onClick={createBoard}
                >
                    Create New Jam
                </button>

                <div className="mt-12 grid grid-cols-3 gap-6 text-sm text-gray-600">
                    <div className="flex flex-col items-center">
                        <div className="text-3xl mb-2">✏️</div>
                        <div>Free drawing</div>
                    </div>
                    <div className="flex flex-col items-center">
                        <div className="text-3xl mb-2">📝</div>
                        <div>Sticky notes</div>
                    </div>
                    <div className="flex flex-col items-center">
                        <div className="text-3xl mb-2">👥</div>
                        <div>Real-time collab</div>
                    </div>
                </div>
            </div>
        </div>
    );
};
