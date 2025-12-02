// CreateRoomForm.jsx
import React, { useState } from 'react'
import { createDocumentRoom } from "../services/textEditorApi"

const CreateRoomForm = ({ teamId, onRoomCreated, existingRooms }) => {
    const [newRoomName, setNewRoomName] = useState("")
    const [isCreating, setIsCreating] = useState(false)
    const [createError, setCreateError] = useState("")

    const handleCreateRoom = async (e) => {
        e.preventDefault();
        
        if (!newRoomName.trim()) {
            setCreateError("Room name cannot be empty");
            return;
        }

        if (existingRooms.some(room => room.roomName === newRoomName.trim())) {
            setCreateError("Room name already exists");
            return;
        }

        setIsCreating(true);
        setCreateError("");

        try {
            await createDocumentRoom(teamId, newRoomName.trim());
            setNewRoomName("");
            onRoomCreated(newRoomName.trim());
            
        } catch (error) {
            console.error("Error creating room:", error);
            setCreateError(error.message || "Failed to create room");
        } finally {
            setIsCreating(false);
        }
    };

    return (
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
            <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-emerald-500 rounded-lg flex items-center justify-center">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                </div>
                <h3 className="text-lg font-bold text-gray-800">Create New Room</h3>
            </div>
            
            <form onSubmit={handleCreateRoom} className="space-y-3">
                <div>
                    <input
                        type="text"
                        value={newRoomName}
                        onChange={(e) => {
                            setNewRoomName(e.target.value);
                            setCreateError("");
                        }}
                        placeholder="Enter room name..."
                        disabled={isCreating}
                        className={`w-full px-4 py-3 rounded-lg border-2 transition-all ${
                            createError 
                                ? 'border-red-300 focus:border-red-500 focus:ring-red-200' 
                                : 'border-gray-200 focus:border-blue-500 focus:ring-blue-200'
                        } focus:ring-4 focus:outline-none disabled:bg-gray-100`}
                    />
                    {createError && (
                        <div className="mt-2 flex items-center gap-2 text-red-600 text-sm font-medium">
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                            {createError}
                        </div>
                    )}
                </div>
                
                <button
                    type="submit"
                    disabled={isCreating || !newRoomName.trim()}
                    className={`w-full px-6 py-3 rounded-lg font-semibold text-white transition-all ${
                        isCreating || !newRoomName.trim()
                            ? 'bg-gray-300 cursor-not-allowed'
                            : 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 hover:shadow-lg'
                    }`}
                >
                    {isCreating ? "Creating..." : "Create Room"}
                </button>
            </form>
        </div>
    );
};

export default CreateRoomForm;
