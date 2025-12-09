import React from 'react';
import { Clock, UserCheck, XCircle, Loader2 } from 'lucide-react';

/**
 * WaitingRoom component - Shows when a guest is waiting for host approval
 * @param {Object} props
 * @param {string} props.guestName - Name of the waiting guest
 * @param {string} props.hostName - Name of the host
 * @param {string} props.roomId - Room code
 * @param {string} props.status - 'waiting' | 'approved' | 'rejected'
 * @param {Function} props.onCancel - Callback when guest cancels waiting
 */
export const WaitingRoom = ({ 
  guestName, 
  hostName = 'Host', 
  roomId, 
  status = 'waiting',
  onCancel 
}) => {
  if (status === 'rejected') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-6">
        <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-8 max-w-md w-full text-center border border-white/20 shadow-2xl">
          <div className="w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <XCircle className="w-10 h-10 text-red-400" />
          </div>
          
          <h2 className="text-2xl font-bold text-white mb-3">
            Request Declined
          </h2>
          
          <p className="text-slate-300 mb-6">
            The host has declined your request to join this meeting.
          </p>
          
          <button
            onClick={onCancel}
            className="w-full py-3 px-6 bg-slate-600 hover:bg-slate-500 text-white rounded-xl font-medium transition-all duration-200"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-6">
      <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-8 max-w-md w-full text-center border border-white/20 shadow-2xl">
        {/* Animated waiting indicator */}
        <div className="relative w-24 h-24 mx-auto mb-6">
          <div className="absolute inset-0 bg-orange-500/20 rounded-full animate-ping" />
          <div className="relative w-24 h-24 bg-gradient-to-br from-orange-500 to-orange-600 rounded-full flex items-center justify-center">
            <Clock className="w-10 h-10 text-white animate-pulse" />
          </div>
        </div>
        
        <h2 className="text-2xl font-bold text-white mb-3">
          Waiting for Approval
        </h2>
        
        <p className="text-slate-300 mb-2">
          Hi <span className="text-orange-400 font-semibold">{guestName}</span>!
        </p>
        
        <p className="text-slate-400 text-sm mb-6">
          You're trying to join room <span className="text-white font-mono bg-white/10 px-2 py-1 rounded">{roomId}</span>
        </p>
        
        <div className="bg-white/5 rounded-xl p-4 mb-6 border border-white/10">
          <div className="flex items-center justify-center gap-3">
            <Loader2 className="w-5 h-5 text-orange-400 animate-spin" />
            <span className="text-slate-300">
              Waiting for <span className="text-white font-medium">{hostName}</span> to let you in...
            </span>
          </div>
        </div>
        
        <p className="text-slate-500 text-xs mb-6">
          The host will be notified of your request. Please wait...
        </p>
        
        <button
          onClick={onCancel}
          className="w-full py-3 px-6 bg-slate-700/50 hover:bg-slate-600/50 text-slate-300 hover:text-white rounded-xl font-medium transition-all duration-200 border border-slate-600/50"
        >
          Cancel & Go Back
        </button>
      </div>
    </div>
  );
};

/**
 * GuestApprovalNotification - Toast/Modal for host to approve/reject guests
 * @param {Object} props
 * @param {Object} props.guest - Guest info { id, name, socketId }
 * @param {Function} props.onApprove - Callback when host approves
 * @param {Function} props.onReject - Callback when host rejects
 */
export const GuestApprovalNotification = ({ guest, onApprove, onReject }) => {
  return (
    <div className="bg-slate-800 border border-orange-500/30 rounded-xl p-4 shadow-2xl max-w-sm animate-slide-in">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 bg-orange-500/20 rounded-full flex items-center justify-center flex-shrink-0">
          <UserCheck className="w-5 h-5 text-orange-400" />
        </div>
        
        <div className="flex-1 min-w-0">
          <p className="text-white font-medium truncate">
            {guest.name}
          </p>
          <p className="text-slate-400 text-sm">
            wants to join this meeting
          </p>
          
          <div className="flex gap-2 mt-3">
            <button
              onClick={() => onApprove(guest)}
              className="flex-1 py-2 px-3 bg-green-600 hover:bg-green-500 text-white text-sm rounded-lg font-medium transition-colors"
            >
              Admit
            </button>
            <button
              onClick={() => onReject(guest)}
              className="flex-1 py-2 px-3 bg-red-600/80 hover:bg-red-500 text-white text-sm rounded-lg font-medium transition-colors"
            >
              Deny
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * WaitingGuestsList - Shows list of waiting guests for host
 * @param {Object} props
 * @param {Array} props.guests - List of waiting guests
 * @param {Function} props.onApprove - Callback when host approves
 * @param {Function} props.onReject - Callback when host rejects
 * @param {Function} props.onApproveAll - Callback to approve all guests
 */
export const WaitingGuestsList = ({ guests = [], onApprove, onReject, onApproveAll }) => {
  if (guests.length === 0) return null;

  return (
    <div className="absolute top-4 right-4 z-50 w-80">
      <div className="bg-slate-800/95 backdrop-blur-xl rounded-xl border border-slate-700 shadow-2xl overflow-hidden">
        <div className="px-4 py-3 bg-orange-500/10 border-b border-slate-700 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse" />
            <span className="text-white font-medium">
              Waiting Room ({guests.length})
            </span>
          </div>
          {guests.length > 1 && (
            <button
              onClick={onApproveAll}
              className="text-xs text-orange-400 hover:text-orange-300 font-medium"
            >
              Admit All
            </button>
          )}
        </div>
        
        <div className="max-h-64 overflow-y-auto">
          {guests.map(guest => (
            <div 
              key={guest.socketId} 
              className="px-4 py-3 border-b border-slate-700/50 last:border-b-0 hover:bg-white/5 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-orange-600 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                    {guest.name?.charAt(0)?.toUpperCase() || '?'}
                  </div>
                  <span className="text-white text-sm truncate">
                    {guest.name}
                  </span>
                </div>
                
                <div className="flex gap-1.5 flex-shrink-0">
                  <button
                    onClick={() => onApprove(guest)}
                    className="p-1.5 bg-green-600 hover:bg-green-500 text-white rounded-lg transition-colors"
                    title="Admit"
                  >
                    <UserCheck className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => onReject(guest)}
                    className="p-1.5 bg-red-600/80 hover:bg-red-500 text-white rounded-lg transition-colors"
                    title="Deny"
                  >
                    <XCircle className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default WaitingRoom;
