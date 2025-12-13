import React from 'react';

export const CreatorCardSkeleton: React.FC = () => {
  return (
    <div className="bg-white rounded-2xl shadow-md p-6 animate-pulse">
      {/* Profile Image Skeleton */}
      <div className="flex justify-center mb-4">
        <div className="w-20 h-20 rounded-full bg-gray-300"></div>
      </div>

      {/* Name Skeleton */}
      <div className="h-6 bg-gray-300 rounded w-3/4 mx-auto mb-2"></div>

      {/* Bio Skeleton */}
      <div className="space-y-2 mb-4">
        <div className="h-4 bg-gray-200 rounded w-full"></div>
        <div className="h-4 bg-gray-200 rounded w-5/6"></div>
      </div>

      {/* Stats Skeleton */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        <div className="text-center">
          <div className="h-4 bg-gray-300 rounded w-full mb-1"></div>
          <div className="h-3 bg-gray-200 rounded w-2/3 mx-auto"></div>
        </div>
        <div className="text-center">
          <div className="h-4 bg-gray-300 rounded w-full mb-1"></div>
          <div className="h-3 bg-gray-200 rounded w-2/3 mx-auto"></div>
        </div>
        <div className="text-center">
          <div className="h-4 bg-gray-300 rounded w-full mb-1"></div>
          <div className="h-3 bg-gray-200 rounded w-2/3 mx-auto"></div>
        </div>
      </div>

      {/* Buttons Skeleton */}
      <div className="flex gap-2">
        <div className="h-10 bg-gray-300 rounded-xl flex-1"></div>
        <div className="h-10 bg-gray-200 rounded-xl flex-1"></div>
      </div>
    </div>
  );
};

interface CreatorCardSkeletonGridProps {
  count?: number;
}

export const CreatorCardSkeletonGrid: React.FC<CreatorCardSkeletonGridProps> = ({
  count = 6,
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: count }).map((_, index) => (
        <CreatorCardSkeleton key={index} />
      ))}
    </div>
  );
};
