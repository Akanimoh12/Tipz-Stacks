import React, { useEffect, useState, useRef } from 'react';
import { FiUsers, FiDollarSign, FiZap, FiTrendingUp } from 'react-icons/fi';

interface StatItemProps {
  icon: React.ReactNode;
  value: number;
  label: string;
  suffix?: string;
  prefix?: string;
  delay?: number;
}

const StatItem: React.FC<StatItemProps> = ({ icon, value, label, suffix = '', prefix = '', delay = 0 }) => {
  const [count, setCount] = useState(0);
  const [hasAnimated, setHasAnimated] = useState(false);
  const statRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !hasAnimated) {
            setTimeout(() => {
              animateCount();
            }, delay * 100);
            setHasAnimated(true);
          }
        });
      },
      { threshold: 0.5 }
    );

    if (statRef.current) {
      observer.observe(statRef.current);
    }

    return () => {
      if (statRef.current) {
        observer.unobserve(statRef.current);
      }
    };
  }, [hasAnimated, delay]);

  const animateCount = () => {
    const duration = 2000; // 2 seconds
    const steps = 60;
    const increment = value / steps;
    let current = 0;

    const timer = setInterval(() => {
      current += increment;
      if (current >= value) {
        setCount(value);
        clearInterval(timer);
      } else {
        setCount(Math.floor(current));
      }
    }, duration / steps);
  };

  const formatNumber = (num: number): string => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };

  return (
    <div
      ref={statRef}
      className="flex flex-col items-center text-center p-6 sm:p-8 bg-white rounded-2xl shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1"
    >
      <div className="mb-4 p-4 rounded-xl bg-linear-to-br from-[#FF6B35]/10 to-[#FF8C42]/10">
        {icon}
      </div>
      <div className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-2">
        {prefix}
        {formatNumber(count)}
        {suffix}
      </div>
      <div className="text-sm sm:text-base text-gray-600 font-medium">{label}</div>
    </div>
  );
};

const Stats: React.FC = () => {
  // These would typically come from your smart contract or API
  const stats = [
    {
      icon: <FiDollarSign className="text-3xl text-[#FF6B35]" />,
      value: 12500,
      label: 'STX Tipped',
      suffix: '+',
    },
    {
      icon: <FiUsers className="text-3xl text-[#FF6B35]" />,
      value: 523,
      label: 'Active Creators',
      suffix: '+',
    },
    {
      icon: <FiZap className="text-3xl text-[#FF6B35]" />,
      value: 2500000,
      label: 'CHEER Claimed',
      suffix: '+',
    },
    {
      icon: <FiTrendingUp className="text-3xl text-[#FF6B35]" />,
      value: 10200,
      label: 'Community Members',
      suffix: '+',
    },
  ];

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8">
      {/* Section Header */}
      <div className="text-center mb-8 sm:mb-12">
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-3 sm:mb-4">
          Growing Together
        </h2>
        <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto">
          Join thousands of creators and supporters building the future of the creator economy.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {stats.map((stat, index) => (
          <StatItem
            key={index}
            icon={stat.icon}
            value={stat.value}
            label={stat.label}
            suffix={stat.suffix}
            delay={index}
          />
        ))}
      </div>

      {/* Additional Context */}
      <div className="mt-8 sm:mt-12 text-center">
        <p className="text-sm sm:text-base text-gray-500">
          Real-time data from the Stacks blockchain •{' '}
          <span className="text-[#FF6B35] font-medium">Updated every block</span>
        </p>
      </div>
    </div>
  );
};

export default Stats;
