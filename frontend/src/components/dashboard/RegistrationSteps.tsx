import React from 'react';
import { FiCheck } from 'react-icons/fi';

interface RegistrationStepsProps {
  currentStep: number;
  onStepClick?: (step: number) => void;
}

const steps = [
  { number: 1, title: 'Basic Info', description: 'Name & Bio' },
  { number: 2, title: 'Profile Image', description: 'Upload Photo' },
  { number: 3, title: 'Social & Portfolio', description: 'Links' },
  { number: 4, title: 'Review', description: 'Confirm & Submit' },
];

export const RegistrationSteps: React.FC<RegistrationStepsProps> = ({
  currentStep,
  onStepClick,
}) => {
  const getStepStatus = (stepNumber: number) => {
    if (stepNumber < currentStep) return 'completed';
    if (stepNumber === currentStep) return 'current';
    return 'upcoming';
  };

  return (
    <div className="w-full py-8">
      {/* Desktop: Horizontal Layout */}
      <div className="hidden md:flex items-center justify-between max-w-3xl mx-auto">
        {steps.map((step, index) => {
          const status = getStepStatus(step.number);
          const isClickable = onStepClick && step.number <= currentStep;

          return (
            <React.Fragment key={step.number}>
              {/* Step Circle */}
              <button
                onClick={() => isClickable && onStepClick(step.number)}
                disabled={!isClickable}
                className={`flex flex-col items-center group ${
                  isClickable ? 'cursor-pointer' : 'cursor-default'
                }`}
              >
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg transition-all duration-300 ${
                    status === 'completed'
                      ? 'bg-orange-500 text-white scale-100'
                      : status === 'current'
                      ? 'bg-orange-500 text-white scale-110 ring-4 ring-orange-100'
                      : 'bg-gray-200 text-gray-500 scale-100'
                  } ${
                    isClickable
                      ? 'group-hover:scale-105 group-hover:shadow-lg'
                      : ''
                  }`}
                >
                  {status === 'completed' ? (
                    <FiCheck size={24} />
                  ) : (
                    <span>{step.number}</span>
                  )}
                </div>
                <div className="mt-3 text-center">
                  <p
                    className={`text-sm font-semibold ${
                      status === 'current'
                        ? 'text-orange-600'
                        : status === 'completed'
                        ? 'text-gray-800'
                        : 'text-gray-500'
                    }`}
                  >
                    {step.title}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {step.description}
                  </p>
                </div>
              </button>

              {/* Connector Line */}
              {index < steps.length - 1 && (
                <div className="flex-1 h-1 mx-4 relative -top-5">
                  <div className="h-full bg-gray-200 rounded">
                    <div
                      className={`h-full rounded transition-all duration-500 ${
                        step.number < currentStep
                          ? 'bg-orange-500'
                          : 'bg-gray-200'
                      }`}
                      style={{
                        width:
                          step.number < currentStep
                            ? '100%'
                            : step.number === currentStep
                            ? '0%'
                            : '0%',
                      }}
                    />
                  </div>
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>

      {/* Mobile: Vertical Layout */}
      <div className="md:hidden space-y-4">
        {steps.map((step) => {
          const status = getStepStatus(step.number);
          const isClickable = onStepClick && step.number <= currentStep;

          return (
            <button
              key={step.number}
              onClick={() => isClickable && onStepClick(step.number)}
              disabled={!isClickable}
              className={`w-full flex items-center gap-4 p-4 rounded-lg transition-all ${
                status === 'current'
                  ? 'bg-orange-50 border-2 border-orange-500'
                  : status === 'completed'
                  ? 'bg-white border-2 border-orange-200'
                  : 'bg-gray-50 border-2 border-gray-200'
              } ${isClickable ? 'hover:shadow-md' : ''}`}
            >
              <div
                className={`w-10 h-10 shrink-0 rounded-full flex items-center justify-center font-bold transition-all ${
                  status === 'completed'
                    ? 'bg-orange-500 text-white'
                    : status === 'current'
                    ? 'bg-orange-500 text-white'
                    : 'bg-gray-300 text-gray-600'
                }`}
              >
                {status === 'completed' ? (
                  <FiCheck size={20} />
                ) : (
                  <span>{step.number}</span>
                )}
              </div>
              <div className="flex-1 text-left">
                <p
                  className={`font-semibold ${
                    status === 'current'
                      ? 'text-orange-600'
                      : status === 'completed'
                      ? 'text-gray-800'
                      : 'text-gray-500'
                  }`}
                >
                  {step.title}
                </p>
                <p className="text-sm text-gray-500">{step.description}</p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default RegistrationSteps;
