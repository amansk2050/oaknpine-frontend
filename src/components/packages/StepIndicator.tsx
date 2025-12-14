'use client';

import React from 'react';
import { Check, Sparkles } from 'lucide-react';

interface Step {
  id: number;
  title: string;
  icon: React.ReactNode;
}

interface StepIndicatorProps {
  steps: Step[];
  currentStep: number;
  onStepClick?: (step: number) => void;
}

export function StepIndicator({ steps, currentStep, onStepClick }: StepIndicatorProps) {
  return (
    <div className="w-full">
      <div className="flex items-center justify-between relative">
        {/* Progress Line */}
        <div className="absolute top-6 left-0 right-0 h-1 bg-slate-200 -z-10" />
        <div
          className="absolute top-6 left-0 h-1 bg-gradient-to-r from-indigo-500 to-purple-500 -z-10 transition-all duration-500"
          style={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}
        />

        {steps.map((step) => {
          const isCompleted = step.id < currentStep;
          const isCurrent = step.id === currentStep;
          const isClickable = onStepClick && step.id <= currentStep;

          return (
            <div
              key={step.id}
              className={`flex flex-col items-center ${isClickable ? 'cursor-pointer' : ''}`}
              onClick={() => isClickable && onStepClick(step.id)}
            >
              <div
                className={`
                  w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-300
                  ${isCompleted
                    ? 'bg-gradient-to-br from-emerald-500 to-emerald-600 shadow-lg shadow-emerald-500/30'
                    : isCurrent
                    ? 'bg-gradient-to-br from-indigo-500 to-purple-500 shadow-lg shadow-indigo-500/30 animate-pulse'
                    : 'bg-slate-200'
                  }
                `}
              >
                {isCompleted ? (
                  <Check className="w-6 h-6 text-white" />
                ) : isCurrent ? (
                  <div className="relative">
                    {step.icon}
                    <Sparkles className="w-3 h-3 text-yellow-300 absolute -top-1 -right-1" />
                  </div>
                ) : (
                  <span className="text-slate-400">{step.icon}</span>
                )}
              </div>
              <span
                className={`
                  mt-2 text-sm font-medium transition-colors
                  ${isCurrent ? 'text-indigo-600' : isCompleted ? 'text-emerald-600' : 'text-slate-400'}
                `}
              >
                {step.title}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
