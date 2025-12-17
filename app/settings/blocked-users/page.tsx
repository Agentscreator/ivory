'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { BottomNav } from '@/components/bottom-nav';
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
    const userStr = localStorage.getItem('ivoryUser');
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        setCurrentUserId(user.id);
        fetchBlockedUsers(user.id);
      } catch (error) {
        console.error('Error parsing user data:', error);
        router.push('/auth');
      }
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
    <div className="min-h-screen bg-white pb-24">
      {/* Header */}
      <header className="bg-white border-b border-[#E8E8E8] sticky top-0 z-10 safe-top">
        <div className="max-w-screen-xl mx-auto px-5 sm:px-6 py-4 sm:py-5 flex items-center gap-3">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => router.back()} 
            className="hover:bg-[#F8F7F5] active:scale-95 transition-all rounded-none"
          >
            <ArrowLeft className="w-5 h-5" strokeWidth={1} />
          </Button>
          <h1 className="font-serif text-xl sm:text-2xl font-light text-[#1A1A1A] tracking-tight">
            Blocked Users
          </h1>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-2xl mx-auto px-4 sm:px-6 py-6 sm:py-8 pb-safe">
        {loading ? (
          <div className="border border-[#E8E8E8] p-12 text-center bg-white">
            <div className="w-12 h-12 border-2 border-[#E8E8E8] border-t-[#8B7355] rounded-full animate-spin mx-auto mb-4" />
            <p className="text-sm text-[#6B6B6B] font-light">Loading...</p>
          </div>
        ) : blockedUsers.length === 0 ? (
          <div className="border border-[#E8E8E8] p-12 text-center bg-white">
            <UserX className="w-12 h-12 text-[#6B6B6B] mx-auto mb-4" strokeWidth={1} />
            <h2 className="font-serif text-xl font-light text-[#1A1A1A] tracking-tight mb-2">
              No Blocked Users
            </h2>
            <p className="text-sm text-[#6B6B6B] font-light">
              You haven't blocked any users
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {blockedUsers.map((user) => (
              <div key={user.id} className="border border-[#E8E8E8] p-5 sm:p-6 bg-white hover:border-[#8B7355] transition-all">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <p className="font-serif text-base font-light text-[#1A1A1A] mb-1">
                      User #{user.blockedId}
                    </p>
                    {user.reason && (
                      <p className="text-sm text-[#6B6B6B] font-light capitalize mb-1">
                        Reason: {user.reason}
                      </p>
                    )}
                    <p className="text-xs text-[#6B6B6B] font-light tracking-wider uppercase">
                      Blocked {new Date(user.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <button
                    onClick={() => handleUnblock(user.blockedId)}
                    className="h-10 px-4 border border-[#E8E8E8] text-[#1A1A1A] font-light text-xs tracking-wider uppercase hover:bg-[#F8F7F5] active:scale-95 transition-all duration-300 whitespace-nowrap"
                  >
                    Unblock
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="mt-6 border border-[#8B7355] bg-[#F8F7F5] p-6">
          <p className="text-sm text-[#1A1A1A] font-light">
            <span className="font-serif font-normal">Note:</span> Blocked users cannot see your content or send you design requests. 
            Their content is automatically hidden from your feed.
          </p>
        </div>
      </main>

      {/* Bottom Navigation */}
      <BottomNav onCenterAction={() => router.push('/capture')} />
    </div>
  );
}
