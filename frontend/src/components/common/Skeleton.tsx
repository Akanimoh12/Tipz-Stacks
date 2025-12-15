import React from 'react';

export const SkeletonCard: React.FC = () => (
  <div className="bg-white rounded-lg shadow-sm p-6 animate-pulse">
    <div className="flex items-center gap-4 mb-4">
      <div className="w-16 h-16 bg-gray-200 rounded-full" />
      <div className="flex-1">
        <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
        <div className="h-3 bg-gray-200 rounded w-1/2" />
      </div>
    </div>
    <div className="space-y-2">
      <div className="h-3 bg-gray-200 rounded" />
      <div className="h-3 bg-gray-200 rounded w-5/6" />
    </div>
  </div>
);

export const SkeletonTable: React.FC = () => (
  <div className="space-y-3">
    {[1, 2, 3, 4, 5].map((i) => (
      <div key={i} className="flex items-center gap-4 p-4 bg-white rounded-lg animate-pulse">
        <div className="w-10 h-10 bg-gray-200 rounded-full" />
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-gray-200 rounded w-1/3" />
          <div className="h-3 bg-gray-200 rounded w-1/4" />
        </div>
        <div className="h-6 bg-gray-200 rounded w-16" />
      </div>
    ))}
  </div>
);

export const SkeletonGrid: React.FC<{ count?: number }> = ({ count = 6 }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
    {Array.from({ length: count }).map((_, i) => (
      <SkeletonCard key={i} />
    ))}
  </div>
);

export const SkeletonProfileCard: React.FC = () => (
  <div className="bg-white rounded-xl shadow-sm p-6 animate-pulse">
    <div className="flex items-center gap-4 mb-6">
      <div className="w-20 h-20 bg-gray-200 rounded-full" />
      <div className="flex-1">
        <div className="h-6 bg-gray-200 rounded w-2/3 mb-2" />
        <div className="h-4 bg-gray-200 rounded w-1/2" />
      </div>
    </div>
    <div className="space-y-4">
      <div className="h-4 bg-gray-200 rounded" />
      <div className="h-4 bg-gray-200 rounded w-5/6" />
      <div className="h-4 bg-gray-200 rounded w-4/6" />
    </div>
    <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t">
      <div className="space-y-2">
        <div className="h-8 bg-gray-200 rounded" />
        <div className="h-3 bg-gray-200 rounded" />
      </div>
      <div className="space-y-2">
        <div className="h-8 bg-gray-200 rounded" />
        <div className="h-3 bg-gray-200 rounded" />
      </div>
      <div className="space-y-2">
        <div className="h-8 bg-gray-200 rounded" />
        <div className="h-3 bg-gray-200 rounded" />
      </div>
    </div>
  </div>
);
