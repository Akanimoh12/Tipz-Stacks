/**
 * Loading Fallback Component
 * Displays while lazy-loaded components are being loaded
 */

import { FiLoader } from 'react-icons/fi';

interface LoadingFallbackProps {
  message?: string;
  fullScreen?: boolean;
}

export function LoadingFallback({ 
  message = 'Loading...', 
  fullScreen = false 
}: LoadingFallbackProps) {
  const containerClasses = fullScreen
    ? 'fixed inset-0 flex items-center justify-center bg-white dark:bg-gray-900'
    : 'flex items-center justify-center min-h-[400px] w-full';

  return (
    <div className={containerClasses}>
      <div className="text-center">
        <FiLoader className="w-12 h-12 text-orange-500 animate-spin mx-auto mb-4" />
        <p className="text-gray-600 dark:text-gray-400 text-lg">{message}</p>
      </div>
    </div>
  );
}

/**
 * Skeleton Loader for Cards
 */
export function SkeletonCard() {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 animate-pulse">
      <div className="flex items-center space-x-4 mb-4">
        <div className="rounded-full bg-gray-300 dark:bg-gray-700 h-12 w-12"></div>
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-3/4"></div>
          <div className="h-3 bg-gray-300 dark:bg-gray-700 rounded w-1/2"></div>
        </div>
      </div>
      <div className="space-y-2">
        <div className="h-3 bg-gray-300 dark:bg-gray-700 rounded"></div>
        <div className="h-3 bg-gray-300 dark:bg-gray-700 rounded w-5/6"></div>
      </div>
    </div>
  );
}

/**
 * Skeleton Loader for List
 */
export function SkeletonList({ count = 5 }: { count?: number }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 animate-pulse"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3 flex-1">
              <div className="rounded-full bg-gray-300 dark:bg-gray-700 h-10 w-10"></div>
              <div className="flex-1 space-y-2">
                <div className="h-3 bg-gray-300 dark:bg-gray-700 rounded w-1/3"></div>
                <div className="h-2 bg-gray-300 dark:bg-gray-700 rounded w-1/4"></div>
              </div>
            </div>
            <div className="h-8 bg-gray-300 dark:bg-gray-700 rounded w-20"></div>
          </div>
        </div>
      ))}
    </div>
  );
}

/**
 * Skeleton Loader for Table
 */
export function SkeletonTable({ rows = 10 }: { rows?: number }) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
      <div className="animate-pulse">
        {/* Header */}
        <div className="border-b border-gray-200 dark:border-gray-700 p-4">
          <div className="flex space-x-4">
            <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-1/6"></div>
            <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-1/4"></div>
            <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-1/6"></div>
            <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-1/6"></div>
          </div>
        </div>
        {/* Rows */}
        {Array.from({ length: rows }).map((_, i) => (
          <div
            key={i}
            className="border-b border-gray-200 dark:border-gray-700 p-4"
          >
            <div className="flex space-x-4">
              <div className="h-3 bg-gray-300 dark:bg-gray-700 rounded w-1/6"></div>
              <div className="h-3 bg-gray-300 dark:bg-gray-700 rounded w-1/4"></div>
              <div className="h-3 bg-gray-300 dark:bg-gray-700 rounded w-1/6"></div>
              <div className="h-3 bg-gray-300 dark:bg-gray-700 rounded w-1/6"></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default LoadingFallback;
