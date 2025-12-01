// src/CollabEditor.jsx
import React, { useEffect, useState } from "react"
import { useSelector } from "react-redux"
import * as Y from "yjs"
import { SignalRYjsProvider } from "../hooks/textEditor/SignalRYjsProvider"
import useTeam from "../../context/useTeam"

// Custom Collaboration extensions
import { CustomCollaborationCaret } from "../hooks/textEditor/collaboration-caret-custom"

// TipTap imports
import { Editor } from "@tiptap/core"
import { EditorContent } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"
import { Collaboration } from "@tiptap/extension-collaboration"
import TextAlign from '@tiptap/extension-text-align'
import Color from '@tiptap/extension-color'
import { TextStyle } from '@tiptap/extension-text-style'
import Highlight from '@tiptap/extension-highlight'
import FontFamily from '@tiptap/extension-font-family'
import Underline from '@tiptap/extension-underline'

// Other components
import Toolbar from "../components/textEditor/EditorToolBar"
import CreateRoomForm from "../components/textEditor/CreateRoomForm"
import RoomList from "../components/textEditor/RoomList"

// API imports
import { getDocuments } from "../../services/textEditorApi"

const CollabEditor = () => {
    const [provider, setProvider] = useState(null)
    const [editor, setEditor] = useState(null)

    // Track participants from awareness
    const [participants, setParticipants] = useState([]);

    // Get userId and userName from Redux store
    const userId = useSelector(state => state.user.userId);
    const userName = useSelector(state => state.user.fullName);
    const accessToken = useSelector(state => state.user.accessToken);
    const { team } = useTeam();
    const teamId = team?.teamId ?? '';

    // Team Id and Room Name state
    const [roomList, setRoomList] = useState([])
    const [currentRoomName, setCurrentRoomName] = useState("")
    

    // --- Initialize Yjs provider ---
    useEffect(() => {
        const newDoc = new Y.Doc()
        let newProvider = null
        let newEditor = null

        // --- Base TipTap extensions ---
        const baseExtensions = [
            StarterKit.configure({
                bulletList: {
                    keepMarks: true,
                },
                orderedList: {
                    keepMarks: true,
                },
                heading: {
                    levels: [1, 2, 3, 4, 5, 6],
                },
                history: false,
            }),
            TextStyle,
            Color,
            Highlight.configure({
                multicolor: true,
            }),
            FontFamily,
            Underline,
            TextAlign.configure({
                types: ['heading', 'paragraph'],
            }),
        ]

        console.log("Connect with login:", { userId, userName, accessToken });
        if (!accessToken || !currentRoomName) {
            newEditor = new Editor({
                extensions: baseExtensions,
            })
            setEditor(newEditor)
            return;
        }

        newProvider = new SignalRYjsProvider(
            teamId,
            currentRoomName,
            newDoc,
            userId,
            userName,
            accessToken
        )

        const extensions = [
            ...baseExtensions,
            Collaboration.configure({
                document: newDoc,
            }),
            CustomCollaborationCaret.configure({
                provider: newProvider,
                user: {
                    userId: userId || -1,
                    name: userName,
                    color: newProvider.userColor,
                }
            })
        ]

        newEditor = new Editor({
            extensions: extensions,
        })

        newProvider.connect().then(() => {
            setProvider(newProvider)
            setEditor(newEditor)
        })

        const handleUnload = () => newProvider.disconnect();
        window.addEventListener("beforeunload", handleUnload);
        window.addEventListener("unload", handleUnload);

        return () => {
            window.removeEventListener("beforeunload", handleUnload);
            window.removeEventListener("unload", handleUnload);
            newEditor?.destroy()
            newProvider?.disconnect()
            setEditor(null)
            setProvider(null)
        }
    }, [accessToken, teamId, currentRoomName, userId, userName])

    useEffect(() => {
        setCurrentRoomName("");
        if (!accessToken) return;
        
        const fetchData = async () =>{
            const response = await getDocuments(teamId)
            if(response){
                setRoomList(response.documentRooms)
            }
        }
        fetchData();
    }, [accessToken, teamId])

    useEffect(() => {
        if (!provider) return;

        const updateParticipants = () => {
            const awarenessUsers = Array.from(provider.awareness.getStates().entries())
                .map(([_clientId, state]) => ({
                    userId: state.user?.userId,
                    name: state.user?.name,
                    color: state.user?.color
                }))
                .filter((state, index, array) =>
                    array.findIndex(t => t.userId === state.userId) === index
                );

            const you = awarenessUsers.find((u) => u.name === userName && u.userId === userId);
            const others = awarenessUsers.filter((u) => u.name !== userName || u.userId !== userId);
            const ordered = you ? [you, ...others] : others;
            setParticipants(ordered.map(u => ({ name: u.name, color: u.color })));
        }

        provider.awareness.on("update", updateParticipants);
        updateParticipants();

        return () => {
            provider.awareness.off("update", updateParticipants);
        };
    }, [provider, userName, userId]);

    const handleRoomCreated = async (newRoomName) => {
        const response = await getDocuments(teamId);
        if(response){
            setRoomList(response.documentRooms);
            setCurrentRoomName(newRoomName);
        }
    };

    const handleRoomDeleted = async (deletedRoomName) => {
        const response = await getDocuments(teamId);
        if(response){
            setRoomList(response.documentRooms);
            if(currentRoomName === deletedRoomName) {
                setCurrentRoomName("");
            }
        }
    };

    const copyToClipboard = () => {
        if (!editor) return;
        const htmlContent = editor.getHTML();
        const type = "text/html";
        const blob = new Blob([htmlContent], { type });
        const data = [new ClipboardItem({ [type]: blob })];
        navigator.clipboard.write(data).then(() => {
            alert("Copied to clipboard!");
        });
    };

    if (!accessToken) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
                <div className="bg-white p-8 rounded-2xl shadow-xl">
                    <h3 className="text-2xl font-bold text-gray-800 mb-2">Welcome</h3>
                    <p className="text-gray-600">Please login to continue</p>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
            <div className="max-w-7xl mx-auto p-6">
                <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold">
                                {userName?.charAt(0).toUpperCase()}
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-gray-800">{userName}</h2>
                                <p className="text-sm text-gray-500">Team ID: {teamId}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-200">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <span className="font-semibold text-gray-700">Room:</span>
                                <span className="font-bold text-blue-600">{currentRoomName || "Not Selected"}</span>
                            </div>
                            <div className="flex gap-2">
                                {participants.map((p, idx) => (
                                    <div key={idx} className="flex items-center gap-2 px-3 py-1.5 rounded-full" style={{backgroundColor: p.color + "20", border: `2px solid ${p.color}`}}>
                                        <div className="w-3 h-3 rounded-full" style={{backgroundColor: p.color}} />
                                        <span className="text-sm font-semibold" style={{color: p.color}}>
                                            {p.name === userName ? `You` : p.name}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-1 space-y-6">
                        <CreateRoomForm 
                            teamId={teamId}
                            onRoomCreated={handleRoomCreated}
                            existingRooms={roomList}
                        />
                        <RoomList
                            rooms={roomList}
                            currentRoomName={currentRoomName}
                            onRoomSelect={setCurrentRoomName}
                            onRoomDeleted={handleRoomDeleted}
                            teamId={teamId}
                        />
                    </div>

                    <div className="lg:col-span-2 space-y-6">
                        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                            <Toolbar editor={editor} />
                            <div className="p-6 min-h-[600px]">
                                <EditorContent editor={editor} />
                            </div>
                        </div>
                        <button onClick={copyToClipboard} className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-blue-600 hover:to-indigo-700 transition-all shadow-lg">
                            Copy to Clipboard
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default CollabEditor