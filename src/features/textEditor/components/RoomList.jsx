// RoomList.jsx
import React, { useState } from 'react'
import { deleteDocumentRoom } from "../services/textEditorApi"

const RoomList = ({ rooms, currentRoomName, onRoomSelect, onRoomDeleted, teamId }) => {
    const [deletingRoom, setDeletingRoom] = useState(null);

    const handleDeleteRoom = async (roomName, e) => {
        e.stopPropagation(); // Prevent room selection when clicking delete
        
        if (!window.confirm(`Are you sure you want to delete "${roomName}"?`)) {
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
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
            <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-pink-500 rounded-lg flex items-center justify-center">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                    </svg>
                </div>
                <div>
                    <h3 className="text-lg font-bold text-gray-800">Document Rooms</h3>
                    <p className="text-xs text-gray-500">{rooms.length} room{rooms.length !== 1 ? 's' : ''}</p>
                </div>
            </div>

            <div className="space-y-2 max-h-[500px] overflow-y-auto">
                {rooms.length === 0 ? (
                    <div className="text-center py-8">
                        <svg className="w-16 h-16 mx-auto text-gray-300 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <p className="text-gray-500 font-medium">No rooms found</p>
                        <p className="text-sm text-gray-400 mt-1">Create your first room to get started</p>
                    </div>
                ) : (
                    rooms.map((room, index) => {
                        const isActive = currentRoomName === room.roomName;
                        const isDeleting = deletingRoom === room.roomName;

                        return (
                            <div
                                key={index}
                                onClick={() => !isDeleting && onRoomSelect(room.roomName)}
                                className={`group relative p-4 rounded-lg border-2 cursor-pointer transition-all ${
                                    isActive
                                        ? 'border-blue-500 bg-blue-50 shadow-md'
                                        : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
                                } ${isDeleting ? 'opacity-50 cursor-not-allowed' : ''}`}
                            >
                                <div className="flex items-start justify-between">
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1">
                                            {isActive && (
                                                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                                            )}
                                            <h4 className={`font-semibold truncate ${
                                                isActive ? 'text-blue-700' : 'text-gray-800'
                                            }`}>
                                                {room.roomName}
                                            </h4>
                                            {isActive && (
                                                <span className="px-2 py-0.5 text-xs font-bold text-blue-600 bg-blue-100 rounded-full">
                                                    Active
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-xs text-gray-500">
                                            <svg className="w-3 h-3 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                            {convertToVietnamTime(room.createdAt)}
                                        </p>
                                    </div>

                                    <button
                                        onClick={(e) => handleDeleteRoom(room.roomName, e)}
                                        disabled={isDeleting}
                                        className={`ml-2 p-2 rounded-lg transition-all ${
                                            isDeleting
                                                ? 'bg-gray-200 cursor-not-allowed'
                                                : 'hover:bg-red-50 text-gray-400 hover:text-red-600 group-hover:opacity-100 opacity-0'
                                        }`}
                                        title="Delete room"
                                    >
                                        {isDeleting ? (
                                            <svg className="animate-spin h-5 w-5 text-gray-500" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                            </svg>
                                        ) : (
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                            </svg>
                                        )}
                                    </button>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
};

export default RoomList;
