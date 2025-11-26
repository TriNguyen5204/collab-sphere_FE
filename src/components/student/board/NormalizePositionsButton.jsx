import React, { useState } from 'react';
import { useSignalRContext } from '../../../context/kanban/useSignalRContext';
import { moveList } from '../../../hooks/kanban/signalRHelper';
import { AlertTriangle, CheckCircle, Loader } from 'lucide-react';

/**
 * Component để normalize positions của tất cả lists
 * Thêm component này vào ProjectBoard để dễ fix position
 */
const NormalizePositionsButton = ({ lists, workspaceId }) => {
  const { connection, isConnected } = useSignalRContext();
  const [isNormalizing, setIsNormalizing] = useState(false);
  const [result, setResult] = useState(null);

  // Kiểm tra xem có lists nào có duplicate positions không
  const hasDuplicatePositions = () => {
    const positions = lists.map(l => l.position);
    return positions.length !== new Set(positions).size;
  };

  // Normalize positions
  const handleNormalize = async () => {
    if (!isConnected || !connection) {
      alert('Not connected to server!');
      return;
    }

    // Confirm
    const confirmMessage = `
⚠️ NORMALIZE LIST POSITIONS

This will update positions for ${lists.length} lists:
${lists.map((l, i) => `• ${l.title}: ${l.position} → ${(i + 1) * 1.0}`).join('\n')}

Continue?
    `.trim();

    if (!window.confirm(confirmMessage)) {
      return;
    }

    setIsNormalizing(true);
    setResult(null);

    try {
      // 1. Sort lists theo position (nếu bằng nhau thì theo id)
      const sortedLists = [...lists].sort((a, b) => {
        if (a.position === b.position) {
          return parseInt(a.id) - parseInt(b.id);
        }
        return a.position - b.position;
      });

      console.log('🔧 Starting normalization...');
      console.log('📊 Current order:', sortedLists.map(l => ({
        id: l.id,
        title: l.title,
        position: l.position
      })));

      // 2. Update từng list
      const updates = [];
      for (let i = 0; i < sortedLists.length; i++) {
        const list = sortedLists[i];
        const newPosition = (i + 1) * 1.0;

        // Chỉ update nếu position khác
        if (list.position !== newPosition) {
          console.log(`🚀 Updating list ${list.id} (${list.title}): ${list.position} → ${newPosition}`);
          
          await moveList(
            connection,
            workspaceId,
            parseInt(list.id),
            newPosition
          );

          updates.push({
            id: list.id,
            title: list.title,
            oldPosition: list.position,
            newPosition: newPosition
          });

          // Đợi 200ms để tránh quá tải server
          await new Promise(resolve => setTimeout(resolve, 200));
        }
      }

      console.log('✅ Normalization complete!');
      console.log('📈 Updated lists:', updates);

      setResult({
        success: true,
        message: `Successfully normalized ${updates.length} lists!`,
        updates
      });

    } catch (error) {
      console.error('❌ Error normalizing positions:', error);
      setResult({
        success: false,
        message: `Error: ${error.message}`
      });
    } finally {
      setIsNormalizing(false);
    }
  };

  const isDuplicate = hasDuplicatePositions();

  return (
    <div className='fixed top-20 right-4 z-50'>
      {/* Warning badge nếu có duplicate */}
      {isDuplicate && !result && (
        <div className='mb-2 bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-3 rounded shadow-lg'>
          <div className='flex items-center gap-2'>
            <AlertTriangle size={20} />
            <div>
              <p className='font-semibold'>Duplicate positions detected!</p>
              <p className='text-sm'>Some lists have the same position value.</p>
            </div>
          </div>
        </div>
      )}

      {/* Main button */}
      <button
        onClick={handleNormalize}
        disabled={isNormalizing || !isConnected}
        className={`
          px-4 py-2 rounded-lg shadow-lg font-medium
          flex items-center gap-2
          transition-all duration-200
          ${isDuplicate 
            ? 'bg-yellow-600 hover:bg-yellow-700 text-white animate-pulse' 
            : 'bg-blue-600 hover:bg-blue-700 text-white'
          }
          disabled:opacity-50 disabled:cursor-not-allowed
        `}
      >
        {isNormalizing ? (
          <>
            <Loader size={18} className='animate-spin' />
            Normalizing...
          </>
        ) : (
          <>
            <AlertTriangle size={18} />
            {isDuplicate ? 'Fix Positions' : 'Normalize Positions'}
          </>
        )}
      </button>

      {/* Result message */}
      {result && (
        <div
          className={`
            mt-2 p-3 rounded shadow-lg
            ${result.success 
              ? 'bg-green-100 border-l-4 border-green-500 text-green-700' 
              : 'bg-red-100 border-l-4 border-red-500 text-red-700'
            }
          `}
        >
          <div className='flex items-start gap-2'>
            {result.success ? (
              <CheckCircle size={20} className='flex-shrink-0 mt-0.5' />
            ) : (
              <AlertTriangle size={20} className='flex-shrink-0 mt-0.5' />
            )}
            <div className='flex-1'>
              <p className='font-semibold'>{result.message}</p>
              {result.success && result.updates && (
                <p className='text-sm mt-1'>
                  Updated {result.updates.length} list(s)
                </p>
              )}
            </div>
            <button
              onClick={() => setResult(null)}
              className='text-gray-500 hover:text-gray-700'
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Info tooltip */}
      <div className='mt-2 bg-white border border-gray-200 rounded shadow p-2 text-xs text-gray-600'>
        <p className='font-semibold mb-1'>What does this do?</p>
        <ul className='space-y-1 list-disc list-inside'>
          <li>Fixes duplicate positions</li>
          <li>Sets positions to 1.0, 2.0, 3.0, ...</li>
          <li>Maintains current order</li>
        </ul>
      </div>
    </div>
  );
};

export default NormalizePositionsButton;