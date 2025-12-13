import React, { useState } from 'react';
import { ExternalLink, Copy, PlayCircle, Download, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

/**
 * Component để hiển thị Record URL với các tính năng:
 * - Truncate URL dài
 * - Copy to clipboard
 * - Open in new tab
 * - Download video (nếu là Google Drive link)
 */
const RecordUrlCell = ({ recordUrl }) => {
  const [copied, setCopied] = useState(false);

  // Nếu không có record URL
  if (!recordUrl) {
    return (
      <div className='flex items-center gap-2'>
        <div className='p-2 bg-slate-100 rounded-lg'>
          <PlayCircle className='h-4 w-4 text-slate-400' />
        </div>
        <span className='text-sm text-slate-400 italic'>No recording</span>
      </div>
    );
  }

  // Truncate URL để hiển thị (chỉ lấy 40 ký tự đầu)
  const truncateUrl = (url) => {
    if (url.length <= 40) return url;
    return url.substring(0, 37) + '...';
  };

  // Copy URL to clipboard
  const handleCopy = async (e) => {
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(recordUrl);
      setCopied(true);
      toast.success('Recording URL copied!', {
        duration: 2000,
        icon: '📋',
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
      toast.error('Failed to copy URL');
    }
  };

  // Open URL in new tab
  const handleOpen = (e) => {
    e.stopPropagation();
    window.open(recordUrl, '_blank', 'noopener,noreferrer');
  };

  // Check if it's a Google Drive download link
  const isGoogleDriveDownload = recordUrl.includes('drive.google.com') && recordUrl.includes('export=download');

  return (
    <div className='flex items-center gap-2 group'>
      {/* Icon */}
      <div className={`p-2 rounded-lg shrink-0 ${
        isGoogleDriveDownload ? 'bg-green-50' : 'bg-blue-50'
      }`}>
        {isGoogleDriveDownload ? (
          <Download className='h-4 w-4 text-green-600' />
        ) : (
          <PlayCircle className='h-4 w-4 text-blue-600' />
        )}
      </div>

      {/* URL Display */}
      <div className='flex-1 min-w-0'>
        <a
          href={recordUrl}
          target='_blank'
          rel='noopener noreferrer'
          className='text-sm text-blue-600 hover:text-blue-800 hover:underline truncate block max-w-[200px]'
          title={recordUrl}
          onClick={(e) => e.stopPropagation()}
        >
          {truncateUrl(recordUrl)}
        </a>
        <span className='text-xs text-slate-500'>
          {isGoogleDriveDownload ? 'Download link' : 'Recording link'}
        </span>
      </div>

      {/* Action Buttons (show on hover) */}
      <div className='flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity'>
        {/* Copy Button */}
        <button
          onClick={handleCopy}
          className='p-1.5 hover:bg-slate-100 rounded-lg transition-colors'
          title='Copy URL'
        >
          {copied ? (
            <CheckCircle className='h-4 w-4 text-green-600' />
          ) : (
            <Copy className='h-4 w-4 text-slate-600' />
          )}
        </button>

        {/* Open in New Tab Button */}
        <button
          onClick={handleOpen}
          className='p-1.5 hover:bg-slate-100 rounded-lg transition-colors'
          title='Open in new tab'
        >
          <ExternalLink className='h-4 w-4 text-slate-600' />
        </button>
      </div>
    </div>
  );
};

export default RecordUrlCell;