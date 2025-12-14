import React from 'react';
import type { IconType } from 'react-icons';

interface FeatureCardProps {
  icon: IconType;
  title: string;
  description: string;
  delay?: number;
}

const FeatureCard: React.FC<FeatureCardProps> = ({ icon: Icon, title, description, delay = 0 }) => {
  const [isVisible, setIsVisible] = React.useState(false);
  const cardRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setTimeout(() => {
              setIsVisible(true);
            }, delay * 100);
          }
        });
      },
      { threshold: 0.1 }
    );

    if (cardRef.current) {
      observer.observe(cardRef.current);
    }

    return () => {
      if (cardRef.current) {
        observer.unobserve(cardRef.current);
      }
    };
  }, [delay]);

  return (
    <div
      ref={cardRef}
      className={`group relative bg-white rounded-2xl p-6 sm:p-8 shadow-md hover:shadow-xl transition-all duration-500 border border-gray-100 hover:border-[#FF6B35]/30 transform hover:-translate-y-2 ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
      }`}
    >
      {/* Orange accent line */}
      <div className="absolute top-0 left-0 w-full h-1 bg-linear-to-r from-[#FF6B35] to-[#FF8C42] rounded-t-2xl transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left"></div>

      {/* Icon */}
      <div className="mb-6">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-linear-to-br from-[#FF6B35]/10 to-[#FF8C42]/10 group-hover:from-[#FF6B35]/20 group-hover:to-[#FF8C42]/20 transition-all duration-300">
          <Icon className="text-3xl text-[#FF6B35] group-hover:scale-110 transition-transform duration-300" />
        </div>
      </div>

      {/* Title */}
      <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3 group-hover:text-[#FF6B35] transition-colors duration-300">
        {title}
      </h3>

      {/* Description */}
      <p className="text-base text-gray-600 leading-relaxed">
        {description}
      </p>

      {/* Decorative element */}
      <div className="absolute -bottom-2 -right-2 w-24 h-24 bg-[#FF6B35]/5 rounded-full blur-2xl group-hover:bg-[#FF6B35]/10 transition-colors duration-300"></div>
    </div>
  );
};

export default FeatureCard;
