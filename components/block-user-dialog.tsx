'use client';

import { useState } from 'react';
import { X } from 'lucide-react';

interface BlockUserDialogProps {
  isOpen: boolean;
  onClose: () => void;
  blockerId: number;
  blockedId: number;
  blockedUsername: string;
  onBlockSuccess?: () => void;
}

export default function BlockUserDialog({
  isOpen,
  onClose,
  blockerId,
  blockedId,
  blockedUsername,
  onBlockSuccess,
}: BlockUserDialogProps) {
  const [reason, setReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleBlock = async () => {
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/moderation/block-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          blockerId,
          blockedId,
          reason,
        }),
      });

      if (response.ok) {
        onBlockSuccess?.();
        onClose();
      }
    } catch (error) {
      console.error('Error blocking user:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Block User</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={24} />
          </button>
        </div>

        <div className="mb-6">
          <p className="text-gray-700 mb-4">
            Are you sure you want to block <strong>{blockedUsername}</strong>?
          </p>
          <p className="text-sm text-gray-600 mb-4">
            When you block this user:
          </p>
          <ul className="text-sm text-gray-600 space-y-2 mb-4">
            <li>• Their content will be removed from your feed instantly</li>
            <li>• They won't be able to send you design requests</li>
            <li>• You won't see their comments or reviews</li>
            <li>• Our team will be notified to review their content</li>
          </ul>

          <div>
            <label className="block text-sm font-medium mb-2">
              Reason (optional)
            </label>
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
            >
              <option value="">Select a reason</option>
              <option value="inappropriate">Inappropriate behavior</option>
              <option value="spam">Spam</option>
              <option value="harassment">Harassment</option>
              <option value="other">Other</option>
            </select>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={handleBlock}
            disabled={isSubmitting}
            className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:opacity-50"
          >
            {isSubmitting ? 'Blocking...' : 'Block User'}
          </button>
        </div>
      </div>
    </div>
  );
}
