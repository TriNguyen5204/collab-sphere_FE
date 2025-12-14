import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { useSelector } from 'react-redux';
import { useNavigate, useSearchParams } from 'react-router-dom';
import * as Y from 'yjs';
import { SignalRYjsProvider } from './hooks/SignalRYjsProvider';
import useTeam from '../../context/useTeam';
import useToastConfirmation from '../../hooks/useToastConfirmation';

// Custom Collaboration extensions
import { CustomCollaborationCaret } from './hooks/collaboration-caret-custom';

// TipTap imports
import { Editor } from '@tiptap/core';
import { EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { Collaboration } from '@tiptap/extension-collaboration';
import TextAlign from '@tiptap/extension-text-align';
import Color from '@tiptap/extension-color';
import { TextStyle } from '@tiptap/extension-text-style';
import Highlight from '@tiptap/extension-highlight';
import FontFamily from '@tiptap/extension-font-family';
import Underline from '@tiptap/extension-underline';
import ListItem from '@tiptap/extension-list-item';
import BulletList from '@tiptap/extension-bullet-list';
import OrderedList from '@tiptap/extension-ordered-list';

// Other components
import Toolbar from './components/EditorToolBar';
import CreateRoomForm from './components/CreateRoomForm';
import RoomList from './components/RoomList';

// API imports
import { getDocuments } from './services/textEditorApi';

// Icons
import { FileText, Users, Copy, ArrowLeft } from 'lucide-react';

import './EditorStyles.css';
// ✅ Custom FontSize Extension
const FontSize = TextStyle.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      fontSize: {
        default: null,
        parseHTML: element => element.style.fontSize || null,
        renderHTML: attributes => {
          if (!attributes.fontSize) {
            return {};
          }
          return {
            style: `font-size: ${attributes.fontSize}`,
          };
        },
      },
    };
  },
});

const CollabEditor = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const Confirm = useToastConfirmation();
  const [provider, setProvider] = useState(null);
  const [editor, setEditor] = useState(null);

  // Track participants from awareness
  const [participants, setParticipants] = useState([]);

  // Get userId and userName from Redux store
  const userId = useSelector(state => state.user.userId);
  const userName = useSelector(state => state.user.fullName);
  const accessToken = useSelector(state => state.user.accessToken);
  const { team } = useTeam();
  const teamIdFromQuery = searchParams.get('teamId');
  const rawTeamId = teamIdFromQuery || team?.teamId;
  const teamId = rawTeamId ? Number(rawTeamId) : '';

  // Team Id and Room Name state
  const [roomList, setRoomList] = useState([]);
  const [currentRoomName, setCurrentRoomName] = useState('');
  const [showSidebar, setShowSidebar] = useState(true);

  useEffect(() => {
    if (editor) {
      const isEditable = !!currentRoomName;
      editor.setEditable(isEditable);
    }
  }, [editor, currentRoomName]);

  // --- Initialize Yjs provider ---
  useEffect(() => {
    const newDoc = new Y.Doc();
    let newProvider = null;
    let newEditor = null;

    // --- Base TipTap extensions ---
    const baseExtensions = [
      StarterKit.configure({
        history: false,
        bulletList: false,
        orderedList: false,
        listItem: false,
      }),
      BulletList.configure({
        HTMLAttributes: {
          class: 'editor-bullet-list',
        },
      }),
      OrderedList.configure({
        HTMLAttributes: {
          class: 'editor-ordered-list',
        },
      }),
      ListItem.configure({
        HTMLAttributes: {
          class: 'editor-list-item',
        },
      }),
      // TextStyle, // Removed to avoid duplicate extension name with FontSize
      FontSize,
      Color,
      Highlight.configure({
        multicolor: true,
      }),
      FontFamily,
      Underline,
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
    ];

    if (!accessToken || !currentRoomName) {
      newEditor = new Editor({
        extensions: baseExtensions,
        // editable: false,
        editorProps: {
          attributes: {
            class: 'editor-content-wrapper',
          },
        },
      });
      setEditor(newEditor);
      return;
    }

    newProvider = new SignalRYjsProvider(
      teamId,
      currentRoomName,
      newDoc,
      userId,
      userName,
      accessToken
    );

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
        },
      }),
    ];

    newEditor = new Editor({
      extensions: extensions,
      // editable: false,
      editorProps: {
        attributes: {
          class: 'editor-content-wrapper',
        },
      },
    });

    newProvider.connect().then(() => {
      setProvider(newProvider);
      setEditor(newEditor);
    });

    const handleUnload = () => newProvider.disconnect();
    window.addEventListener('beforeunload', handleUnload);
    window.addEventListener('unload', handleUnload);

    return () => {
      window.removeEventListener('beforeunload', handleUnload);
      window.removeEventListener('unload', handleUnload);
      newEditor?.destroy();
      newProvider?.disconnect();
      setEditor(null);
      setProvider(null);
    };
  }, [accessToken, teamId, currentRoomName, userId, userName]);

  useEffect(() => {
    setCurrentRoomName('');
    if (!accessToken) return;

    const fetchData = async () => {
      const response = await getDocuments(teamId);
      if (response) {
        setRoomList(response.documentRooms);
      }
    };
    fetchData();
  }, [accessToken, teamId]);

  useEffect(() => {
    if (!provider) return;

    const updateParticipants = () => {
      const awarenessUsers = Array.from(
        provider.awareness.getStates().entries()
      )
        .map(([_clientId, state]) => ({
          userId: state.user?.userId,
          name: state.user?.name,
          color: state.user?.color,
        }))
        .filter(
          (state, index, array) =>
            array.findIndex(t => t.userId === state.userId) === index
        );

      const you = awarenessUsers.find(
        u => u.name === userName && u.userId === userId
      );
      const others = awarenessUsers.filter(
        u => u.name !== userName || u.userId !== userId
      );
      const ordered = you ? [you, ...others] : others;
      setParticipants(ordered.map(u => ({ name: u.name, color: u.color })));
    };

    provider.awareness.on('update', updateParticipants);
    updateParticipants();

    return () => {
      provider.awareness.off('update', updateParticipants);
    };
  }, [provider, userName, userId]);

  const handleRoomCreated = async newRoomName => {
    const response = await getDocuments(teamId);
    if (response) {
      setRoomList(response.documentRooms);
      setCurrentRoomName(newRoomName);
    }
  };

  const handleRoomDeleted = async deletedRoomName => {
    const response = await getDocuments(teamId);
    if (response) {
      setRoomList(response.documentRooms);
      if (currentRoomName === deletedRoomName) {
        setCurrentRoomName('');
      }
    }
  };

  const copyToClipboard = () => {
    if (!editor) return;
    const htmlContent = editor.getHTML();
    const type = 'text/html';
    const blob = new Blob([htmlContent], { type });
    const data = [new ClipboardItem({ [type]: blob })];
    navigator.clipboard.write(data).then(() => {
      toast.success('Copied to clipboard!');
    });
  };

  const handleBackNavigation = async () => {
    // Nếu đang ở trong một phòng, cần hỏi xác nhận trước khi thoát
    if (currentRoomName) {
      const isConfirmed = await Confirm({
        message: 'Leave this document?',
        description: 'Unsaved changes might be lost if you leave now. Are you sure?',
        confirmLabel: 'Leave',
        cancelLabel: 'Stay',
        variant: 'warning', 
      });

      if (!isConfirmed) {
        return;
      }
    }

    navigate(-1);
  };

  if (!accessToken) {
    return (
      <div className='flex items-center justify-center min-h-screen bg-gray-100'>
        <div className='bg-white p-8 rounded-lg shadow-lg max-w-md'>
          <FileText className='w-16 h-16 text-blue-600 mx-auto mb-4' />
          <h3 className='text-2xl font-bold text-gray-800 mb-2 text-center'>
            Welcome to Collaborative Editor
          </h3>
          <p className='text-gray-600 text-center'>Please login to continue</p>
        </div>
      </div>
    );
  }

  return (
    <div className='h-screen flex flex-col bg-gray-100'>
      {/* Top Navigation Bar - Word style */}
      <div className='bg-orangeFpt-500 text-white px-4 py-2 flex items-center justify-between shadow-md'>
        <div className='flex items-center gap-4'>
          <button
            onClick={handleBackNavigation}
            className='flex items-center gap-2 px-3 py-1.5 rounded hover:bg-orangeFpt-300 active:bg-orangeFpt-400 transition-all'
          >
            <ArrowLeft className='w-5 h-5' />
            <span className='text-sm font-medium'>Back</span>
          </button>
          <FileText className='w-6 h-6' />
          <div>
            <div className='font-semibold'>
              {currentRoomName || 'Untitled Document'}
            </div>
            <div className='text-xs text-blue-100'>Team: {teamId}</div>
          </div>
        </div>
        <div className='flex items-center gap-4'>
          {/* Participants */}
          <div className='flex items-center gap-2'>
            <Users className='w-4 h-4' />
            <span className='text-sm'>{participants.length} online</span>
          </div>
          {participants.slice(0, 3).map((p, idx) => (
            <div
              key={idx}
              className='w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 border-white'
              style={{ backgroundColor: p.color }}
              title={p.name}
            >
              {p.name.charAt(0).toUpperCase()}
            </div>
          ))}
          {participants.length > 3 && (
            <div className='w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold bg-white text-blue-600 border-2 border-white'>
              +{participants.length - 3}
            </div>
          )}
        </div>
      </div>

      <div className='flex flex-1 overflow-hidden'>
        {/* Sidebar - Collapsible */}
        {showSidebar && (
          <div className='w-80 bg-white border-r border-gray-200 overflow-y-auto'>
            <div className='p-4 space-y-4'>
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
          </div>
        )}

        {/* Main Editor Area */}
        <div className='flex-1 flex flex-col overflow-hidden'>
          {/* Toolbar */}
          <Toolbar editor={editor} currentRoomName={currentRoomName} />

          {/* Editor Content - Word-like paper view */}
          <div className='flex-1 overflow-y-auto bg-gray-200 p-8'>
            <div className='max-w-[210mm] mx-auto'>
              {/* Paper/Page view */}
              <div className='bg-white shadow-lg min-h-[297mm] p-[25mm] rounded-sm'>
                <EditorContent editor={editor} className='editor-content' />
              </div>
            </div>
          </div>

          {/* Bottom Status Bar - Word style */}
          <div className='bg-white border-t border-gray-200 px-4 py-2 flex items-center justify-between text-xs text-gray-600'>
            <div className='flex items-center gap-4'>
              <button
                onClick={() => setShowSidebar(!showSidebar)}
                className='hover:text-blue-600'
              >
                {showSidebar ? '← Hide Sidebar' : '→ Show Sidebar'}
              </button>
              <span>Room: {currentRoomName || 'None'}</span>
            </div>
            <div className='flex items-center gap-4'>
              <button
                onClick={copyToClipboard}
                className='flex items-center gap-1 hover:text-blue-600'
              >
                <Copy className='w-3 h-3' />
                Copy
              </button>
              <span>
                {participants.length} collaborator
                {participants.length !== 1 ? 's' : ''}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CollabEditor;
