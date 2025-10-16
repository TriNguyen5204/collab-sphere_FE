import React, { useEffect, useRef, useState } from "react";
import SimplePeer from "simple-peer/simplepeer.min.js";
import io from "socket.io-client";

const Peer = SimplePeer;
const socket = io("http://localhost:5000");

function WebRTC() {
  const [me, setMe] = useState("");
  const [stream, setStream] = useState();
  const [receivingCall, setReceivingCall] = useState(false);
  const [caller, setCaller] = useState("");
  const [callerSignal, setCallerSignal] = useState();
  const [callAccepted, setCallAccepted] = useState(false);
  const [idToCall, setIdToCall] = useState("");
  const [callEnded, setCallEnded] = useState(false);
  const [myName, setMyName] = useState("");
  const [callerName, setCallerName] = useState("");
  const [isShare, setIsShare] = useState(false);
  const [groupPeers, setGroupPeers] = useState([]);
  const [groupId, setGroupId] = useState("");
  const [myRoomId, setMyRoomId] = useState("");

  const myVideo = useRef();
  const userVideo = useRef();
  const connectionRef = useRef();
  const screenStreamRef = useRef(null);
  const localStreamRef = useRef(null);
  const peersRef = useRef({});

  useEffect(() => {
    navigator.mediaDevices
      .getUserMedia({ video: true, audio: true })
      .then((stream) => {
        setStream(stream);
        localStreamRef.current = stream;
        myVideo.current.srcObject = stream;
      })
      .catch((err) => console.log("Permission error", err));

    socket.on("connect", () => console.log("Connected:", socket.id));
    socket.on("me", (id) => setMe(id));
    socket.on("callUser", (data) => {
      setReceivingCall(true);
      setCaller(data.from);
      setCallerName(data.name);
      setCallerSignal(data.signal);
    });
  }, []);

  useEffect(() => {
    socket.on("callEnded", () => {
      setCallEnded(true);
      setCallAccepted(false);
      setReceivingCall(false);
      if (userVideo.current) userVideo.current.srcObject = null;
      if (connectionRef.current) connectionRef.current.destroy();
    });
    return () => socket.off("callEnded");
  }, []);

  const callUser = (id) => {
    socket.off("callAccepted");
    const peer = new Peer({ initiator: true, trickle: false, stream });
    peer.on("signal", (data) =>
      socket.emit("callUser", { userToCall: id, signalData: data, from: me, name: myName })
    );
    peer.on("stream", (stream) => {
      userVideo.current.srcObject = stream;
      userVideo.current.muted = false;
      userVideo.current.play().catch(() => {});
    });
    socket.on("callAccepted", (signal) => {
      setCallAccepted(true);
      peer.signal(signal);
    });
    connectionRef.current = peer;
  };

  const answerCall = () => {
    setCallAccepted(true);
    const peer = new Peer({ initiator: false, trickle: false, stream });
    peer.on("signal", (data) => socket.emit("answerCall", { signal: data, to: caller }));
    peer.on("stream", (stream) => {
      userVideo.current.srcObject = stream;
      userVideo.current.muted = false;
      userVideo.current.play().catch(() => {});
    });
    peer.signal(callerSignal);
    connectionRef.current = peer;
  };

  const leaveCall = () => {
    setCallEnded(true);
    setCallAccepted(false);
    setReceivingCall(false);
    socket.emit("endCall", { to: caller || idToCall });
    if (connectionRef.current) connectionRef.current.destroy();
    socket.off("callAccepted");
    socket.off("callUser");
    if (userVideo.current) userVideo.current.srcObject = null;
    if (myVideo.current) myVideo.current.srcObject = stream;
  };

  function replaceVideoTrackOnPeer(newTrack) {
    const pcPeer = connectionRef.current;
    if (!pcPeer || !pcPeer._pc) return;
    const senders = pcPeer._pc.getSenders ? pcPeer._pc.getSenders() : [];
    const videoSender = senders.find((s) => s.track && s.track.kind === "video");
    if (videoSender) {
      videoSender.replaceTrack(newTrack).catch((err) => console.warn("replaceTrack failed", err));
    }
  }

  const shareScreen = async () => {
    try {
      const screenStream = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: true });
      screenStreamRef.current = screenStream;
      myVideo.current.srcObject = screenStream;
      setIsShare(true);
      const screenVideoTrack = screenStream.getVideoTracks()[0];
      if (screenVideoTrack) replaceVideoTrackOnPeer(screenVideoTrack);
      screenVideoTrack.onended = stopScreenShare;
    } catch (err) {
      console.error("getDisplayMedia error", err);
    }
  };

  const stopScreenShare = () => {
    const screenStream = screenStreamRef.current;
    if (screenStream) {
      screenStream.getTracks().forEach((t) => t.stop());
      screenStreamRef.current = null;
    }
    const cam = localStreamRef.current;
    myVideo.current.srcObject = cam || null;
    setIsShare(false);
    const camTrack = cam ? cam.getVideoTracks()[0] : null;
    if (camTrack) replaceVideoTrackOnPeer(camTrack);
  };

  function joinRoom(roomId) {
    navigator.mediaDevices.getUserMedia({ video: true, audio: true }).then((stream) => {
      myVideo.current.srcObject = stream;
      localStreamRef.current = stream;
      socket.emit("joinRoom", { roomId, name: myName });
      socket.off("allUsers").off("userJoined").off("signal").off("userLeft");

      socket.on("allUsers", (users) => {
        const peersArray = users.map((userId) => {
          const peer = createPeer(userId, stream);
          peersRef.current[userId] = peer;
          return { id: userId, peer };
        });
        setGroupPeers(peersArray);
      });

      socket.on("userJoined", ({ id }) => {
        if (!peersRef.current[id]) {
          const peer = addPeer(null, id, stream);
          peersRef.current[id] = peer;
          setGroupPeers((prev) => [...prev, { id, peer }]);
        }
      });

      socket.on("signal", ({ from, signal }) => {
        if (peersRef.current[from]) {
          peersRef.current[from].signal(signal);
        } else {
          const peer = addPeer(signal, from, stream);
          peersRef.current[from] = peer;
          setGroupPeers((prev) => [...prev, { id: from, peer }]);
        }
      });

      socket.on("userLeft", (id) => {
        if (peersRef.current[id]) peersRef.current[id].destroy();
        delete peersRef.current[id];
        setGroupPeers((prev) => prev.filter((user) => user.id !== id));
      });
    });
  }

  function createPeer(userId, stream) {
    const peer = new SimplePeer({ initiator: true, trickle: false, stream });
    peer.on("signal", (signal) => socket.emit("signal", { targetId: userId, signal }));
    return peer;
  }

  function addPeer(incomingSignal, userId, stream) {
    const peer = new SimplePeer({ initiator: false, trickle: false, stream });
    peer.on("signal", (signal) => socket.emit("signal", { targetId: userId, signal }));
    if (incomingSignal) peer.signal(incomingSignal);
    return peer;
  }

  function GroupVideo({ peer }) {
    const ref = useRef();
    useEffect(() => {
      peer.on("stream", (stream) => (ref.current.srcObject = stream));
    }, [peer]);
    return <video ref={ref} autoPlay playsInline className="w-64 rounded-lg shadow-md" />;
  }

  function createRoom() {
    const newRoomId = Math.random().toString(36).substring(2, 10);
    setMyRoomId(newRoomId);
    joinRoom(newRoomId);
  }

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    alert("Copied: " + text);
  };

  return (
    <div className="p-6 text-white text-center">
      <h1 className="text-3xl font-bold mb-6">FAKE ZOOM</h1>

      <div className="flex flex-col items-center gap-6">
        <div className="flex gap-6">
          <video ref={myVideo} playsInline autoPlay className="w-64 rounded-lg shadow-md" />
          {callAccepted && !callEnded && (
            <video ref={userVideo} playsInline autoPlay className="w-64 rounded-lg shadow-md" />
          )}
        </div>

        <input
          type="text"
          placeholder="Enter your name"
          value={myName}
          onChange={(e) => setMyName(e.target.value)}
          className="px-4 py-2 rounded-lg border border-gray-300 text-black"
        />

        <button
          onClick={() => copyToClipboard(me)}
          className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg font-semibold"
        >
          Copy My ID
        </button>

        <input
          type="text"
          placeholder="Enter ID to call"
          value={idToCall}
          onChange={(e) => setIdToCall(e.target.value)}
          className="px-4 py-2 rounded-lg border border-gray-300 text-black"
        />

        {callAccepted && !callEnded ? (
          <button
            onClick={leaveCall}
            className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg font-semibold"
          >
            End Call
          </button>
        ) : (
          <button
            onClick={() => callUser(idToCall)}
            className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded-lg font-semibold"
          >
            📞 Call
          </button>
        )}

        {receivingCall && !callAccepted && (
          <div className="bg-gray-800 p-4 rounded-lg mt-4">
            <h2 className="mb-2">{callerName} is calling...</h2>
            <button
              onClick={answerCall}
              className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded-lg font-semibold"
            >
              Answer
            </button>
          </div>
        )}

        <div className="mt-4">
          {isShare ? (
            <button
              onClick={stopScreenShare}
              className="bg-red-500 hover:bg-red-600 px-4 py-2 rounded-lg font-semibold"
            >
              🛑 Stop Sharing
            </button>
          ) : (
            <button
              onClick={shareScreen}
              className="bg-blue-500 hover:bg-blue-600 px-4 py-2 rounded-lg font-semibold"
            >
              🖥️ Share Screen
            </button>
          )}
        </div>

        {/* Group Call */}
        <div className="mt-8 bg-gray-800 p-4 rounded-lg">
          <h3 className="text-xl font-semibold mb-4">Group Call</h3>

          {myRoomId ? (
            <div>
              <p className="mb-2">Your Room ID: {myRoomId}</p>
              <button
                onClick={() => copyToClipboard(myRoomId)}
                className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg font-semibold"
              >
                Copy Room ID
              </button>
            </div>
          ) : (
            <button
              onClick={createRoom}
              className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg font-semibold"
            >
              Create Group Call
            </button>
          )}

          <input
            type="text"
            placeholder="Enter Room ID"
            value={groupId}
            onChange={(e) => setGroupId(e.target.value)}
            className="mt-3 px-4 py-2 rounded-lg border border-gray-300 text-black"
          />
          <button
            onClick={() => joinRoom(groupId)}
            className="mt-3 bg-green-600 hover:bg-green-700 px-4 py-2 rounded-lg font-semibold"
          >
            Join Group Call
          </button>
        </div>

        {/* Group Members */}
        <div className="flex flex-wrap justify-center gap-4 mt-6">
          {groupPeers.map(({ id, peer }) => (
            <GroupVideo key={id} peer={peer} />
          ))}
        </div>
      </div>
    </div>
  );
}

export default WebRTC;
