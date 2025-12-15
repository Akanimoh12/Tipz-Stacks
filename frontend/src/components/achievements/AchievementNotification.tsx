import { useEffect, useState } from 'react';
import { FiX, FiAward } from 'react-icons/fi';

export interface ToastNotification {
  id: string;
  type: 'achievement' | 'progress' | 'milestone';
  title: string;
  message: string;
  icon?: string;
  duration?: number;
}

interface AchievementNotificationProps {
  notifications: ToastNotification[];
  onDismiss: (id: string) => void;
}

export const AchievementNotification: React.FC<AchievementNotificationProps> = ({
  notifications,
  onDismiss,
}) => {
  return (
    <div className="fixed bottom-4 right-4 z-50 space-y-3 max-w-sm">
      {notifications.map(notification => (
        <ToastCard
          key={notification.id}
          notification={notification}
          onDismiss={() => onDismiss(notification.id)}
        />
      ))}
    </div>
  );
};

interface ToastCardProps {
  notification: ToastNotification;
  onDismiss: () => void;
}

const ToastCard: React.FC<ToastCardProps> = ({ notification, onDismiss }) => {
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    const duration = notification.duration || 5000;
    const timer = setTimeout(() => {
      setIsExiting(true);
      setTimeout(onDismiss, 300);
    }, duration);

    return () => clearTimeout(timer);
  }, [notification.duration, onDismiss]);

  const getTypeStyles = () => {
    switch (notification.type) {
      case 'achievement':
        return 'bg-gradient-to-r from-orange-500 to-yellow-500 text-white';
      case 'progress':
        return 'bg-gradient-to-r from-blue-500 to-purple-500 text-white';
      case 'milestone':
        return 'bg-gradient-to-r from-green-500 to-teal-500 text-white';
      default:
        return 'bg-gray-800 text-white';
    }
  };

  return (
    <div
      className={`transform transition-all duration-300 ${
        isExiting ? 'translate-x-full opacity-0' : 'translate-x-0 opacity-100'
      }`}
    >
      <div
        className={`${getTypeStyles()} rounded-lg shadow-2xl p-4 min-w-[320px] cursor-pointer`}
        onClick={onDismiss}
      >
        <div className="flex items-start gap-3">
          {/* Icon */}
          <div className="flex-shrink-0">
            {notification.icon ? (
              <div className="text-3xl">{notification.icon}</div>
            ) : (
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                <FiAward className="w-5 h-5" />
              </div>
            )}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <h4 className="font-bold text-sm mb-1">{notification.title}</h4>
            <p className="text-sm opacity-90">{notification.message}</p>
          </div>

          {/* Close Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsExiting(true);
              setTimeout(onDismiss, 300);
            }}
            className="flex-shrink-0 p-1 hover:bg-white/20 rounded transition-colors"
          >
            <FiX className="w-4 h-4" />
          </button>
        </div>

        {/* Progress Bar */}
        <div className="mt-3 h-1 bg-white/20 rounded-full overflow-hidden">
          <div
            className="h-full bg-white/40 rounded-full animate-shrink"
            style={{
              animation: `shrink ${notification.duration || 5000}ms linear`,
            }}
          />
        </div>
      </div>
    </div>
  );
};

// Custom hook for managing notifications
export const useAchievementNotifications = () => {
  const [notifications, setNotifications] = useState<ToastNotification[]>([]);

  const addNotification = (notification: Omit<ToastNotification, 'id'>) => {
    const id = `notification-${Date.now()}-${Math.random()}`;
    setNotifications(prev => [...prev, { ...notification, id }]);
  };

  const dismissNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const showAchievementUnlock = (achievementName: string, icon: string) => {
    addNotification({
      type: 'achievement',
      title: '🎉 Achievement Unlocked!',
      message: `You unlocked "${achievementName}"`,
      icon,
      duration: 6000,
    });
  };

  const showProgressMilestone = (message: string, icon?: string) => {
    addNotification({
      type: 'progress',
      title: '📈 Progress Update',
      message,
      icon,
      duration: 4000,
    });
  };

  const showNearlyUnlocked = (achievementName: string, remaining: string) => {
    addNotification({
      type: 'milestone',
      title: '🎯 Almost There!',
      message: `${remaining} to unlock "${achievementName}"`,
      duration: 5000,
    });
  };

  const showMilestoneReached = (milestone: string, icon: string) => {
    addNotification({
      type: 'milestone',
      title: '🏆 Milestone Reached!',
      message: milestone,
      icon,
      duration: 5000,
    });
  };

  return {
    notifications,
    addNotification,
    dismissNotification,
    showAchievementUnlock,
    showProgressMilestone,
    showNearlyUnlocked,
    showMilestoneReached,
  };
};

// Add CSS animation in global styles
const style = document.createElement('style');
style.textContent = `
  @keyframes shrink {
    from { width: 100%; }
    to { width: 0%; }
  }
`;
document.head.appendChild(style);
