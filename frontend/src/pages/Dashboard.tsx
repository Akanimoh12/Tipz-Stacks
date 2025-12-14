import React, { memo, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useWallet } from '../hooks/useWallet';
import { Heading, Paragraph } from '../components/common/Typography';
import { Card, CardHeader, CardBody } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { FiGift, FiSearch, FiAward, FiUser, FiArrowRight } from 'react-icons/fi';

// Memoized StatCard component to prevent re-renders
const StatCard = memo<{ label: string; value: string; icon: React.ReactNode }>(
  ({ label, value, icon }) => (
    <Card>
      <CardBody>
        <div className="flex items-center justify-between">
          <div>
            <Paragraph size="sm" color="secondary" className="mb-1">
              {label}
            </Paragraph>
            <Heading level={3}>{value}</Heading>
          </div>
          <div className="w-12 h-12 bg-[#FF6B35]/10 rounded-xl flex items-center justify-center">
            {icon}
          </div>
        </div>
      </CardBody>
    </Card>
  )
);

StatCard.displayName = 'StatCard';

const Dashboard: React.FC = () => {
  const { walletAddress, stxBalance, cheerBalance } = useWallet();

  // Memoize formatted balances to prevent recalculation on every render
  const formattedStxBalance = useMemo(() => stxBalance.toFixed(2), [stxBalance]);
  const formattedCheerBalance = useMemo(() => cheerBalance.toFixed(0), [cheerBalance]);

  return (
    <div>
      <div className="mb-8">
        <Heading level={1} className="mb-2">
          Welcome Back!
        </Heading>
        <Paragraph color="secondary">
          Here's an overview of your Tipz Stacks activity.
        </Paragraph>
      </div>

      <div className="grid gap-6 lg:grid-cols-3 mb-6">
        {/* Quick Stats */}
        <StatCard 
          label="STX Balance" 
          value={`${formattedStxBalance} STX`} 
          icon={<span className="text-2xl">₿</span>} 
        />
        <StatCard 
          label="CHEER Balance" 
          value={`${formattedCheerBalance} CHEER`} 
          icon={<FiGift className="text-[#FF6B35] text-xl" />} 
        />
        <StatCard 
          label="Tips Given" 
          value="0" 
          icon={<span className="text-2xl">🎉</span>} 
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <Heading level={3}>Quick Actions</Heading>
            </CardHeader>
            <CardBody>
              <div className="grid gap-4 sm:grid-cols-2">
                <Link to="/discover" className="block">
                  <button className="w-full p-4 bg-linear-to-r from-[#FF6B35] to-[#FF8C42] text-white rounded-xl font-semibold hover:shadow-lg transition-all flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <FiSearch />
                      Discover Creators
                    </span>
                    <FiArrowRight />
                  </button>
                </Link>
                <Link to="/leaderboards" className="block">
                  <button className="w-full p-4 border-2 border-[#FF6B35] text-[#FF6B35] rounded-xl font-semibold hover:bg-[#FF6B35]/5 transition-all flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <FiAward />
                      View Leaderboards
                    </span>
                    <FiArrowRight />
                  </button>
                </Link>
                <Link to="/claim" className="block">
                  <button className="w-full p-4 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-all flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <FiGift />
                      Claim CHEER
                    </span>
                    <FiArrowRight />
                  </button>
                </Link>
                <Link to="/my-profile" className="block">
                  <button className="w-full p-4 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-all flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <FiUser />
                      My Profile
                    </span>
                    <FiArrowRight />
                  </button>
                </Link>
              </div>
            </CardBody>
          </Card>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <Heading level={3}>Recent Activity</Heading>
            </CardHeader>
            <CardBody>
              <Paragraph color="secondary" className="text-center py-8">
                No recent activity yet. Start by discovering creators and giving tips!
              </Paragraph>
            </CardBody>
          </Card>
        </div>

        {/* Sidebar Widgets */}
        <div className="space-y-6">
          {/* Wallet Info */}
          <Card>
            <CardHeader>
              <Heading level={3}>Your Wallet</Heading>
            </CardHeader>
            <CardBody>
              <div className="space-y-3">
                <div>
                  <Paragraph size="sm" color="secondary" className="mb-1">
                    Address
                  </Paragraph>
                  <Paragraph size="sm" className="font-mono break-all">
                    {walletAddress}
                  </Paragraph>
                </div>
              </div>
            </CardBody>
          </Card>

          {/* Featured Creators - Placeholder */}
          <Card>
            <CardHeader>
              <Heading level={3}>Featured Creators</Heading>
            </CardHeader>
            <CardBody>
              <Paragraph color="secondary" className="text-sm">
                Featured creators will appear here. Discover amazing content creators to support!
              </Paragraph>
              <Link to="/discover" className="block mt-4">
                <Button variant="secondary" className="w-full">
                  Explore Creators
                </Button>
              </Link>
            </CardBody>
          </Card>

          {/* Pro Tip */}
          <Card variant="highlighted">
            <CardHeader>
              <Heading level={4}>💡 Pro Tip</Heading>
            </CardHeader>
            <CardBody>
              <Paragraph size="sm">
                Claim your free 100 CHEER tokens every 24 hours to support creators without spending your STX!
              </Paragraph>
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
