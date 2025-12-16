'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, UserX } from 'lucide-react';

interface BlockedUser {
  id: number;
  blockedId: number;
  reason: string | null;
  createdAt: string;
}

export default function BlockedUsersPage() {
  const router = useRouter();
  const [blockedUsers, setBlockedUsers] = useState<BlockedUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);

  useEffect(() => {
    // Get current user ID from session/auth
    const userId = localStorage.getItem('userId');
    if (userId) {
      setCurrentUserId(parseInt(userId));
      fetchBlockedUsers(parseInt(userId));
    } else {
      router.push('/auth');
    }
  }, [router]);

  const fetchBlockedUsers = async (userId: number) => {
    try {
      const response = await fetch(`/api/moderation/block-user?userId=${userId}`);
      const data = await response.json();
      setBlockedUsers(data.blockedUsers || []);
    } catch (error) {
      console.error('Error fetching blocked users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUnblock = async (blockedId: number) => {
    if (!currentUserId) return;

    try {
      const response = await fetch(
        `/api/moderation/block-user?blockerId=${currentUserId}&blockedId=${blockedId}`,
        { method: 'DELETE' }
      );

      if (response.ok) {
        setBlockedUsers(blockedUsers.filter(u => u.blockedId !== blockedId));
      }
    } catch (error) {
      console.error('Error unblocking user:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto p-4">
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={() => router.back()}
            className="p-2 hover:bg-gray-100 rounded-full"
          >
            <ArrowLeft size={24} />
          </button>
          <h1 className="text-2xl font-bold">Blocked Users</h1>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500 mx-auto"></div>
          </div>
        ) : blockedUsers.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 text-center">
            <UserX size={48} className="mx-auto text-gray-400 mb-4" />
            <p className="text-gray-600">You haven't blocked any users</p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl divide-y">
            {blockedUsers.map((user) => (
              <div key={user.id} className="p-4 flex items-center justify-between">
                <div>
                  <p className="font-medium">User #{user.blockedId}</p>
                  {user.reason && (
                    <p className="text-sm text-gray-600 capitalize">
                      Reason: {user.reason}
                    </p>
                  )}
                  <p className="text-xs text-gray-400">
                    Blocked {new Date(user.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <button
                  onClick={() => handleUnblock(user.blockedId)}
                  className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Unblock
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-800">
            <strong>Note:</strong> Blocked users cannot see your content or send you design requests. 
            Their content is automatically hidden from your feed.
          </p>
        </div>
      </div>
    </div>
  );
}
