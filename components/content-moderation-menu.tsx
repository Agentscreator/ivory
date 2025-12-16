'use client';

import { useState } from 'react';
import { Flag, UserX, MoreVertical } from 'lucide-react';
import FlagContentDialog from './flag-content-dialog';
import BlockUserDialog from './block-user-dialog';

interface ContentModerationMenuProps {
  currentUserId: number;
  contentType: 'look' | 'review' | 'profile';
  contentId: number;
  contentOwnerId: number;
  contentOwnerUsername: string;
  showBlockOption?: boolean;
}

export default function ContentModerationMenu({
  currentUserId,
  contentType,
  contentId,
  contentOwnerId,
  contentOwnerUsername,
  showBlockOption = true,
}: ContentModerationMenuProps) {
  const [showMenu, setShowMenu] = useState(false);
  const [showFlagDialog, setShowFlagDialog] = useState(false);
  const [showBlockDialog, setShowBlockDialog] = useState(false);

  // Don't show menu for own content
  if (currentUserId === contentOwnerId) {
    return null;
  }

  return (
    <>
      <div className="relative">
        <button
          onClick={() => setShowMenu(!showMenu)}
          className="p-2 hover:bg-gray-100 rounded-full"
          aria-label="More options"
        >
          <MoreVertical size={20} className="text-gray-600" />
        </button>

        {showMenu && (
          <>
            <div
              className="fixed inset-0 z-10"
              onClick={() => setShowMenu(false)}
            />
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-20">
              <button
                onClick={() => {
                  setShowFlagDialog(true);
                  setShowMenu(false);
                }}
                className="w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center gap-3 text-gray-700"
              >
                <Flag size={18} />
                <span>Report Content</span>
              </button>
              
              {showBlockOption && (
                <button
                  onClick={() => {
                    setShowBlockDialog(true);
                    setShowMenu(false);
                  }}
                  className="w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center gap-3 text-red-600 border-t border-gray-200"
                >
                  <UserX size={18} />
                  <span>Block User</span>
                </button>
              )}
            </div>
          </>
        )}
      </div>

      <FlagContentDialog
        isOpen={showFlagDialog}
        onClose={() => setShowFlagDialog(false)}
        contentType={contentType}
        contentId={contentId}
        contentOwnerId={contentOwnerId}
        reporterId={currentUserId}
      />

      <BlockUserDialog
        isOpen={showBlockDialog}
        onClose={() => setShowBlockDialog(false)}
        blockerId={currentUserId}
        blockedId={contentOwnerId}
        blockedUsername={contentOwnerUsername}
        onBlockSuccess={() => {
          // Refresh the page to remove blocked user's content
          window.location.reload();
        }}
      />
    </>
  );
}
