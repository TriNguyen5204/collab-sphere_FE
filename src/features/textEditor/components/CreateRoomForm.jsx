// CreateRoomForm.jsx - Microsoft Word Style
import React, { useState } from 'react'
import { createDocumentRoom } from "../services/textEditorApi"
import { Plus, AlertCircle } from "lucide-react"

const CreateRoomForm = ({ teamId, onRoomCreated, existingRooms }) => {
    const [newRoomName, setNewRoomName] = useState("")
    const [isCreating, setIsCreating] = useState(false)
    const [createError, setCreateError] = useState("")

    const handleCreateRoom = async (e) => {
        e.preventDefault();
        
        if (!newRoomName.trim()) {
            setCreateError("Document name cannot be empty");
            return;
        }

        if (existingRooms.some(room => room.roomName === newRoomName.trim())) {
            setCreateError("Document name already exists");
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
            setCreateError(error.message || "Failed to create document");
        } finally {
            setIsCreating(false);
        }
    };

    return (
        <div className="bg-white border-b border-gray-200">
            {/* Header */}
            <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
                <div className="flex items-center gap-2">
                    <Plus className="w-5 h-5 text-gray-600" />
                    <h3 className="font-semibold text-gray-800">New Document</h3>
                </div>
            </div>
            
            {/* Form */}
            <form onSubmit={handleCreateRoom} className="p-4">
                <div className="space-y-3">
                    {/* Input */}
                    <div>
                        <input
                            type="text"
                            value={newRoomName}
                            onChange={(e) => {
                                setNewRoomName(e.target.value);
                                setCreateError("");
                            }}
                            placeholder="Enter document name..."
                            disabled={isCreating}
                            className={`
                                w-full px-3 py-2 text-sm border rounded
                                focus:outline-none focus:ring-2 transition-all
                                ${createError 
                                    ? 'border-red-300 focus:ring-red-200 focus:border-red-400' 
                                    : 'border-gray-300 focus:ring-blue-200 focus:border-blue-400'
                                }
                                ${isCreating ? 'bg-gray-50 cursor-not-allowed' : 'bg-white'}
                            `}
                        />
                        
                        {/* Error Message */}
                        {createError && (
                            <div className="mt-2 flex items-start gap-2 text-red-600 text-xs">
                                <AlertCircle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
                                <span>{createError}</span>
                            </div>
                        )}
                    </div>
                    
                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={isCreating || !newRoomName.trim()}
                        className={`
                            w-full px-4 py-2 rounded text-sm font-medium transition-all
                            flex items-center justify-center gap-2
                            ${isCreating || !newRoomName.trim()
                                ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                : 'bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800'
                            }
                        `}
                    >
                        {isCreating ? (
                            <>
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                <span>Creating...</span>
                            </>
                        ) : (
                            <>
                                <Plus className="w-4 h-4" />
                                <span>Create Document</span>
                            </>
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default CreateRoomForm;