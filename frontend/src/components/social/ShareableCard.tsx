import React, { useRef } from 'react';
import { FiAward, FiUsers } from 'react-icons/fi';

interface ShareableCardProps {
  type: 'achievement' | 'tip' | 'profile' | 'leaderboard';
  data: {
    // Achievement
    achievementName?: string;
    achievementDescription?: string;
    achievementIcon?: string;
    unlockedBy?: string;
    
    // Tip
    creatorName?: string;
    creatorImage?: string;
    amount?: number;
    currency?: 'STX' | 'CHEER';
    
    // Profile
    userName?: string;
    userImage?: string;
    totalGiven?: number;
    creatorsSupported?: number;
    rank?: number;
    achievementCount?: number;
    
    // Leaderboard
    topCreators?: Array<{
      name: string;
      image?: string;
      score: number;
      rank: number;
    }>;
  };
}

const ShareableCard: React.FC<ShareableCardProps> = ({ type, data }) => {
  const cardRef = useRef<HTMLDivElement>(null);

  const renderAchievementCard = () => (
    <div className="relative w-full aspect-[16/9] bg-gradient-to-br from-orange-500 via-orange-600 to-red-600 rounded-2xl overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)',
          backgroundSize: '20px 20px'
        }} />
      </div>

      {/* Content */}
      <div className="relative h-full flex flex-col items-center justify-center p-8 text-white">
        {/* Logo */}
        <div className="absolute top-6 left-6 font-bold text-2xl">
          Tipz Stacks
        </div>

        {/* Achievement Icon */}
        <div className="mb-6">
          <div className="w-24 h-24 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
            {data.achievementIcon ? (
              <span className="text-6xl">{data.achievementIcon}</span>
            ) : (
              <FiAward className="w-12 h-12" />
            )}
          </div>
        </div>

        {/* Achievement Name */}
        <h2 className="text-4xl font-bold text-center mb-3">
          {data.achievementName}
        </h2>

        {/* Description */}
        <p className="text-xl text-center text-white text-opacity-90 mb-4">
          {data.achievementDescription}
        </p>

        {/* Stats */}
        {data.unlockedBy && (
          <div className="bg-white bg-opacity-20 px-6 py-2 rounded-full">
            <span className="text-sm">Unlocked by {data.unlockedBy} of users</span>
          </div>
        )}

        {/* CTA */}
        <div className="absolute bottom-6 text-center">
          <div className="text-sm opacity-75">🏆 Achievement Unlocked</div>
        </div>
      </div>
    </div>
  );

  const renderTipCard = () => (
    <div className="relative w-full aspect-[16/9] bg-gradient-to-br from-orange-400 to-pink-500 rounded-2xl overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: 'radial-gradient(circle, white 2px, transparent 2px)',
          backgroundSize: '30px 30px'
        }} />
      </div>

      {/* Content */}
      <div className="relative h-full flex items-center justify-between p-12 text-white">
        {/* Left Side - Creator */}
        <div className="flex flex-col items-center">
          {data.creatorImage ? (
            <img
              src={data.creatorImage}
              alt={data.creatorName}
              className="w-32 h-32 rounded-full border-4 border-white mb-4"
            />
          ) : (
            <div className="w-32 h-32 rounded-full border-4 border-white bg-white bg-opacity-20 flex items-center justify-center mb-4">
              <FiUsers className="w-16 h-16" />
            </div>
          )}
          <h3 className="text-2xl font-bold">@{data.creatorName}</h3>
        </div>

        {/* Right Side - Tip Info */}
        <div className="text-right">
          <div className="text-xl mb-2">Just tipped</div>
          <div className="text-7xl font-bold mb-2">
            {data.amount}
          </div>
          <div className="text-3xl font-semibold mb-6">
            {data.currency}
          </div>
          <div className="text-lg opacity-90">
            Support creators on<br />
            <span className="font-bold">Tipz Stacks</span>
          </div>
        </div>

        {/* Logo */}
        <div className="absolute top-6 left-6 font-bold text-2xl">
          Tipz Stacks
        </div>
      </div>
    </div>
  );

  const renderProfileCard = () => (
    <div className="relative w-full aspect-[16/9] bg-white rounded-2xl overflow-hidden border-4 border-orange-500">
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-500 to-pink-500 p-8 text-white">
        <div className="flex items-center gap-6">
          {data.userImage ? (
            <img
              src={data.userImage}
              alt={data.userName}
              className="w-24 h-24 rounded-full border-4 border-white"
            />
          ) : (
            <div className="w-24 h-24 rounded-full border-4 border-white bg-white bg-opacity-20 flex items-center justify-center">
              <FiUsers className="w-12 h-12" />
            </div>
          )}
          <div>
            <h2 className="text-3xl font-bold mb-1">{data.userName || 'Anonymous'}</h2>
            {data.rank && (
              <div className="text-xl">Rank #{data.rank}</div>
            )}
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-6 p-8">
        <div className="text-center">
          <div className="text-4xl font-bold text-orange-500 mb-2">
            {data.totalGiven?.toFixed(2) || '0'}
          </div>
          <div className="text-gray-600">STX Given</div>
        </div>
        <div className="text-center">
          <div className="text-4xl font-bold text-orange-500 mb-2">
            {data.creatorsSupported || '0'}
          </div>
          <div className="text-gray-600">Creators Supported</div>
        </div>
        <div className="text-center">
          <div className="text-4xl font-bold text-orange-500 mb-2">
            {data.rank || '-'}
          </div>
          <div className="text-gray-600">Leaderboard Rank</div>
        </div>
        <div className="text-center">
          <div className="text-4xl font-bold text-orange-500 mb-2">
            {data.achievementCount || '0'}
          </div>
          <div className="text-gray-600">Achievements</div>
        </div>
      </div>

      {/* Footer */}
      <div className="absolute bottom-6 right-6 text-orange-500 font-bold text-2xl">
        Tipz Stacks
      </div>
    </div>
  );

  const renderLeaderboardCard = () => (
    <div className="relative w-full aspect-[16/9] bg-gradient-to-br from-purple-600 via-pink-500 to-orange-500 rounded-2xl overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)',
          backgroundSize: '20px 20px'
        }} />
      </div>

      {/* Content */}
      <div className="relative h-full flex flex-col p-8 text-white">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-4xl font-bold">Top Creators</h2>
          <div className="font-bold text-2xl">Tipz Stacks</div>
        </div>

        {/* Top 3 */}
        <div className="flex items-end justify-center gap-6 flex-1">
          {/* Rank 2 */}
          {data.topCreators && data.topCreators[1] && (
            <div className="flex flex-col items-center">
              <div className="text-5xl mb-2">🥈</div>
              <div className="w-20 h-20 rounded-full bg-white bg-opacity-20 mb-2 flex items-center justify-center">
                {data.topCreators[1].image ? (
                  <img
                    src={data.topCreators[1].image}
                    alt={data.topCreators[1].name}
                    className="w-full h-full rounded-full"
                  />
                ) : (
                  <FiUsers className="w-10 h-10" />
                )}
              </div>
              <div className="font-bold text-lg">{data.topCreators[1].name}</div>
              <div className="text-sm opacity-75">{data.topCreators[1].score.toFixed(2)} STX</div>
            </div>
          )}

          {/* Rank 1 */}
          {data.topCreators && data.topCreators[0] && (
            <div className="flex flex-col items-center -translate-y-4">
              <div className="text-6xl mb-2">🥇</div>
              <div className="w-24 h-24 rounded-full bg-white bg-opacity-20 mb-2 flex items-center justify-center border-4 border-yellow-300">
                {data.topCreators[0].image ? (
                  <img
                    src={data.topCreators[0].image}
                    alt={data.topCreators[0].name}
                    className="w-full h-full rounded-full"
                  />
                ) : (
                  <FiUsers className="w-12 h-12" />
                )}
              </div>
              <div className="font-bold text-xl">{data.topCreators[0].name}</div>
              <div className="text-sm opacity-75">{data.topCreators[0].score.toFixed(2)} STX</div>
            </div>
          )}

          {/* Rank 3 */}
          {data.topCreators && data.topCreators[2] && (
            <div className="flex flex-col items-center">
              <div className="text-5xl mb-2">🥉</div>
              <div className="w-20 h-20 rounded-full bg-white bg-opacity-20 mb-2 flex items-center justify-center">
                {data.topCreators[2].image ? (
                  <img
                    src={data.topCreators[2].image}
                    alt={data.topCreators[2].name}
                    className="w-full h-full rounded-full"
                  />
                ) : (
                  <FiUsers className="w-10 h-10" />
                )}
              </div>
              <div className="font-bold text-lg">{data.topCreators[2].name}</div>
              <div className="text-sm opacity-75">{data.topCreators[2].score.toFixed(2)} STX</div>
            </div>
          )}
        </div>

        {/* CTA */}
        <div className="text-center text-lg opacity-90">
          Join the leaderboard on Tipz Stacks
        </div>
      </div>
    </div>
  );

  return (
    <div ref={cardRef} className="w-full max-w-4xl mx-auto">
      {type === 'achievement' && renderAchievementCard()}
      {type === 'tip' && renderTipCard()}
      {type === 'profile' && renderProfileCard()}
      {type === 'leaderboard' && renderLeaderboardCard()}
    </div>
  );
};

export default ShareableCard;
