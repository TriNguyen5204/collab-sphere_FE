// RoomList.jsx - Microsoft Word Style
import React, { useState } from 'react'
import { deleteDocumentRoom } from "../services/textEditorApi"
import { Folder, Clock, Trash2, FileText, AlertCircle } from "lucide-react"

const RoomList = ({ rooms, currentRoomName, onRoomSelect, onRoomDeleted, teamId }) => {
    const [deletingRoom, setDeletingRoom] = useState(null);

    const handleDeleteRoom = async (roomName, e) => {
        e.stopPropagation();
        
        if (!window.confirm(`Delete "${roomName}"?\n\nThis action cannot be undone.`)) {
            return;
        }

        setDeletingRoom(roomName);

        try {
            await deleteDocumentRoom(teamId, roomName);
            onRoomDeleted(roomName);
        } catch (error) {
            console.error("Error deleting room:", error);
            alert("Failed to delete room. Please try again.");
        } finally {
            setDeletingRoom(null);
        }
    };

    const convertToVietnamTime = (utcString) => {
        const d = new Date(utcString);
        return d.toLocaleString('vi-VN', {
            year: 'numeric',
            month: 'short',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getRelativeTime = (utcString) => {
        const date = new Date(utcString);
        const now = new Date();
        const diffMs = now - date;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffHours < 24) return `${diffHours}h ago`;
        if (diffDays < 7) return `${diffDays}d ago`;
        return convertToVietnamTime(utcString);
    };

    return (
        <div className="bg-white border-b border-gray-200">
            {/* Header */}
            <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Folder className="w-5 h-5 text-gray-600" />
                        <h3 className="font-semibold text-gray-800">Documents</h3>
                    </div>
                    <span className="text-xs text-gray-500 bg-white px-2 py-1 rounded-full border border-gray-200">
                        {rooms.length} {rooms.length === 1 ? 'room' : 'rooms'}
                    </span>
                </div>
            </div>

            {/* Room List */}
            <div className="max-h-[calc(100vh-400px)] overflow-y-auto">
                {rooms.length === 0 ? (
                    <div className="text-center py-12 px-4">
                        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
                            <FileText className="w-8 h-8 text-gray-400" />
                        </div>
                        <p className="text-sm font-medium text-gray-600 mb-1">No documents yet</p>
                        <p className="text-xs text-gray-500">Create your first room to start collaborating</p>
                    </div>
                ) : (
                    <div className="divide-y divide-gray-100">
                        {rooms.map((room, index) => {
                            const isActive = currentRoomName === room.roomName;
                            const isDeleting = deletingRoom === room.roomName;

                            return (
                                <div
                                    key={index}
                                    onClick={() => !isDeleting && onRoomSelect(room.roomName)}
                                    className={`
                                        group relative px-4 py-3 cursor-pointer transition-all
                                        ${isActive 
                                            ? 'bg-blue-50 border-l-4 border-blue-500' 
                                            : 'hover:bg-gray-50 border-l-4 border-transparent'
                                        }
                                        ${isDeleting ? 'opacity-50 cursor-not-allowed' : ''}
                                    `}
                                >
                                    <div className="flex items-center gap-3">
                                        {/* Icon */}
                                        <div className={`
                                            w-8 h-8 rounded flex items-center justify-center flex-shrink-0
                                            ${isActive ? 'bg-blue-100' : 'bg-gray-100'}
                                        `}>
                                            <FileText className={`w-4 h-4 ${isActive ? 'text-blue-600' : 'text-gray-600'}`} />
                                        </div>

                                        {/* Content */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-0.5">
                                                <h4 className={`
                                                    text-sm font-medium truncate
                                                    ${isActive ? 'text-blue-700' : 'text-gray-800'}
                                                `}>
                                                    {room.roomName}
                                                </h4>
                                                {isActive && (
                                                    <span className="flex items-center gap-1 px-1.5 py-0.5 text-xs font-medium text-blue-600 bg-blue-100 rounded">
                                                        <div className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-pulse" />
                                                        Active
                                                    </span>
                                                )}
                                            </div>
                                            <div className="flex items-center gap-1 text-xs text-gray-500">
                                                <Clock className="w-3 h-3" />
                                                <span>{getRelativeTime(room.createdAt)}</span>
                                            </div>
                                        </div>

                                        {/* Delete Button */}
                                        <button
                                            onClick={(e) => handleDeleteRoom(room.roomName, e)}
                                            disabled={isDeleting}
                                            className={`
                                                p-1.5 rounded transition-all flex-shrink-0
                                                ${isDeleting
                                                    ? 'bg-gray-100 cursor-not-allowed'
                                                    : 'hover:bg-red-50 text-gray-400 hover:text-red-600 opacity-0 group-hover:opacity-100'
                                                }
                                            `}
                                            title="Delete document"
                                        >
                                            {isDeleting ? (
                                                <div className="w-4 h-4 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
                                            ) : (
                                                <Trash2 className="w-4 h-4" />
                                            )}
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Footer Info */}
            {rooms.length > 0 && (
                <div className="px-4 py-2 border-t border-gray-200 bg-gray-50">
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                        <AlertCircle className="w-3 h-3" />
                        <span>Click to open • Hover to delete</span>
                    </div>
                </div>
            )}
        </div>
    );
};

export default RoomList;