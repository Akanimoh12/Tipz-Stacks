import React from 'react';
import type { IconType } from 'react-icons';

interface StepCardProps {
  stepNumber: number;
  title: string;
  description: string;
  icon: IconType;
  delay?: number;
}

const StepCard: React.FC<StepCardProps> = ({ stepNumber, title, description, icon: Icon, delay = 0 }) => {
  const [isVisible, setIsVisible] = React.useState(false);
  const stepRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setTimeout(() => {
              setIsVisible(true);
            }, delay * 150);
          }
        });
      },
      { threshold: 0.2 }
    );

    if (stepRef.current) {
      observer.observe(stepRef.current);
    }

    return () => {
      if (stepRef.current) {
        observer.unobserve(stepRef.current);
      }
    };
  }, [delay]);

  return (
    <div
      ref={stepRef}
      className={`relative flex flex-col items-center text-center transition-all duration-700 ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
      }`}
    >
      {/* Step Number Badge */}
      <div className="relative mb-6">
        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#FF6B35] to-[#FF8C42] flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
          <span className="text-3xl font-bold text-white">{stepNumber}</span>
        </div>
        
        {/* Icon Container */}
        <div className="absolute -bottom-3 -right-3 w-12 h-12 rounded-full bg-white shadow-md flex items-center justify-center border-2 border-[#FF6B35]/20">
          <Icon className="text-xl text-[#FF6B35]" />
        </div>
      </div>

      {/* Title */}
      <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3 px-4">
        {title}
      </h3>

      {/* Description */}
      <p className="text-sm sm:text-base text-gray-600 leading-relaxed max-w-xs px-4">
        {description}
      </p>

      {/* Hover Effect Glow */}
      <div className="absolute inset-0 -z-10 bg-[#FF6B35]/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-xl"></div>
    </div>
  );
};

export default StepCard;
