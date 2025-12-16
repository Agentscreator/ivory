'use client';

import { useState } from 'react';
import { Heart, Share2 } from 'lucide-react';
import ContentModerationMenu from './content-moderation-menu';

interface LookCardProps {
  look: {
    id: number;
    userId: number;
    username?: string;
    title: string;
    imageUrl: string;
    viewCount: number;
    createdAt: string;
  };
  currentUserId: number;
  onLike?: () => void;
  onShare?: () => void;
}

export default function LookCard({ look, currentUserId, onLike, onShare }: LookCardProps) {
  const [liked, setLiked] = useState(false);

  const handleLike = () => {
    setLiked(!liked);
    onLike?.();
  };

  return (
    <div className="bg-white rounded-2xl overflow-hidden shadow-sm">
      {/* Image */}
      <div className="relative aspect-square">
        <img
          src={look.imageUrl}
          alt={look.title}
          className="w-full h-full object-cover"
        />
      </div>

      {/* Content */}
      <div className="p-4">
        <div className="flex items-start justify-between mb-2">
          <div className="flex-1">
            <h3 className="font-semibold text-lg">{look.title}</h3>
            {look.username && (
              <p className="text-sm text-gray-600">by {look.username}</p>
            )}
          </div>
          
          {/* Moderation Menu */}
          <ContentModerationMenu
            currentUserId={currentUserId}
            contentType="look"
            contentId={look.id}
            contentOwnerId={look.userId}
            contentOwnerUsername={look.username || `User ${look.userId}`}
            showBlockOption={true}
          />
        </div>

        {/* Actions */}
        <div className="flex items-center gap-4 mt-3">
          <button
            onClick={handleLike}
            className={`flex items-center gap-2 ${
              liked ? 'text-pink-500' : 'text-gray-600'
            }`}
          >
            <Heart size={20} fill={liked ? 'currentColor' : 'none'} />
          </button>
          
          <button
            onClick={onShare}
            className="flex items-center gap-2 text-gray-600"
          >
            <Share2 size={20} />
          </button>

          <span className="text-sm text-gray-500 ml-auto">
            {look.viewCount} views
          </span>
        </div>
      </div>
    </div>
  );
}
