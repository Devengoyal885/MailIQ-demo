import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Target, X, ChevronRight, ChevronLeft, Sparkles } from 'lucide-react';

interface TourStep {
  targetId: string;
  title: string;
  content: string;
  position: 'top' | 'bottom' | 'left' | 'right';
  align?: 'start' | 'center' | 'end';
}

const TOUR_STEPS: TourStep[] = [
  {
    targetId: 'tour-welcome',
    title: 'Welcome to Mail-IQ 2.0',
    content: 'Experience the future of email. This production-grade platform uses Gemini AI to triage your inbox, extract actionable tasks, and block security threats.',
    position: 'bottom'
  },
  {
    targetId: 'tour-sidebar-nav',
    title: 'SaaS Navigation',
    content: 'Switch between your Inbox, advanced Analytics Dashboard, Task Kanban board, and AI Settings seamlessly.',
    position: 'right',
    align: 'start'
  },
  {
    targetId: 'tour-ai-summary',
    title: 'Instant AI Intelligence',
    content: 'Every email is instantly summarized. We detect Sentiment, Urgency, and exact Follow-up deadlines automatically.',
    position: 'bottom',
    align: 'center'
  },
  {
    targetId: 'tour-smart-reply',
    title: 'Context-Aware Smart Replies',
    content: 'Draft perfect responses in seconds. Choose from Professional, Friendly, or Formal tones generated directly from the email context.',
    position: 'top',
    align: 'end'
  },
  {
    targetId: 'tour-task-extraction',
    title: 'Automated Task Extraction',
    content: 'Stop copying action items manually. Mail-IQ detects requests and deadlines, adding them straight to your integrated Kanban board.',
    position: 'left',
    align: 'start'
  },
  {
    targetId: 'tour-cyber-shield',
    title: 'Cyber Shield Protection',
    content: 'Real-time prompt-injection filtering. The dashboard shows you exactly which malicious payloads were blocked to protect your AI agent.',
    position: 'top'
  }
];

export function ShowcaseTour({ onComplete }: { onComplete?: () => void }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);

  // Initialize tour
  useEffect(() => {
    // Small delay to let the UI mount and animations settle
    const timer = setTimeout(() => setIsVisible(true), 2000);
    return () => clearTimeout(timer);
  }, []);

  // Track target element
  useEffect(() => {
    if (!isVisible) return;
    
    const updatePosition = () => {
      const step = TOUR_STEPS[currentStep];
      if (!step) return;
      
      const el = document.getElementById(step.targetId);
      if (el) {
        setTargetRect(el.getBoundingClientRect());
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      } else {
        // Fallback to center if element not found yet
        setTargetRect(null);
      }
    };

    updatePosition();
    window.addEventListener('resize', updatePosition);
    
    // Poll position to handle dynamic UI changes
    const intervalId = setInterval(updatePosition, 500);
    
    return () => {
      window.removeEventListener('resize', updatePosition);
      clearInterval(intervalId);
    };
  }, [currentStep, isVisible]);

  if (!isVisible) return null;

  const step = TOUR_STEPS[currentStep];
  const isLast = currentStep === TOUR_STEPS.length - 1;

  const handleNext = () => {
    if (isLast) {
      setIsVisible(false);
      onComplete?.();
    } else {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handlePrev = () => {
    setCurrentStep(prev => Math.max(0, prev - 1));
  };

  const handleSkip = () => {
    setIsVisible(false);
    onComplete?.();
  };

  // Calculate tooltip position
  let tooltipStyle: React.CSSProperties = {
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
  };

  if (targetRect) {
    const spacing = 20;
    
    if (step.position === 'right') {
      tooltipStyle = {
        top: step.align === 'start' ? targetRect.top : targetRect.top + targetRect.height / 2,
        left: targetRect.right + spacing,
        transform: step.align === 'start' ? 'translateY(0)' : 'translateY(-50%)'
      };
    } else if (step.position === 'left') {
      tooltipStyle = {
        top: step.align === 'start' ? targetRect.top : targetRect.top + targetRect.height / 2,
        left: targetRect.left - spacing,
        transform: `translate(-100%, ${step.align === 'start' ? '0' : '-50%'})`
      };
    } else if (step.position === 'bottom') {
      tooltipStyle = {
        top: targetRect.bottom + spacing,
        left: step.align === 'start' ? targetRect.left : targetRect.left + targetRect.width / 2,
        transform: step.align === 'start' ? 'translateX(0)' : 'translateX(-50%)'
      };
    } else if (step.position === 'top') {
      tooltipStyle = {
        top: targetRect.top - spacing,
        left: step.align === 'start' ? targetRect.left : targetRect.left + targetRect.width / 2,
        transform: `translate(${step.align === 'start' ? '0' : '-50%'}, -100%)`
      };
    }
  }

  return (
    <div className="fixed inset-0 z-[100] pointer-events-none">
      {/* Backdrop */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-slate-950/60 backdrop-blur-[2px] transition-all duration-500 pointer-events-auto"
        onClick={handleSkip}
      />

      {/* Target Highlight Ring */}
      <AnimatePresence>
        {targetRect && (
          <motion.div
            key={`highlight-${currentStep}`}
            initial={{ opacity: 0, scale: 1.1 }}
            animate={{ 
              opacity: 1, 
              scale: 1,
              top: targetRect.top - 8,
              left: targetRect.left - 8,
              width: targetRect.width + 16,
              height: targetRect.height + 16,
            }}
            transition={{ type: 'spring', stiffness: 200, damping: 20 }}
            className="absolute border-2 border-indigo-500 rounded-2xl shadow-[0_0_30px_rgba(99,102,241,0.3)] z-[101] pointer-events-none"
          />
        )}
      </AnimatePresence>

      {/* Tooltip Card */}
      <motion.div
        key={`tooltip-${currentStep}`}
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ 
          opacity: 1, 
          y: 0, 
          scale: 1,
          ...tooltipStyle
        }}
        transition={{ type: 'spring', stiffness: 300, damping: 25, delay: 0.1 }}
        className="absolute w-80 bg-slate-900 border border-white/10 rounded-2xl shadow-2xl p-5 z-[102] pointer-events-auto flex flex-col"
      >
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-400">
              <Sparkles size={16} />
            </div>
            <h3 className="font-semibold text-white">{step.title}</h3>
          </div>
          <button 
            onClick={handleSkip}
            className="text-slate-500 hover:text-white transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        <p className="text-sm text-slate-300 leading-relaxed mb-6">
          {step.content}
        </p>

        <div className="flex items-center justify-between mt-auto">
          <div className="flex gap-1.5">
            {TOUR_STEPS.map((_, idx) => (
              <div 
                key={idx} 
                className={`h-1.5 rounded-full transition-all duration-300 ${idx === currentStep ? 'w-4 bg-indigo-500' : 'w-1.5 bg-white/20'}`}
              />
            ))}
          </div>

          <div className="flex items-center gap-2">
            <button 
              onClick={handlePrev}
              disabled={currentStep === 0}
              className="p-1.5 rounded-lg text-slate-400 hover:bg-white/5 disabled:opacity-30 transition-colors"
            >
              <ChevronLeft size={18} />
            </button>
            <button 
              onClick={handleNext}
              className="flex items-center gap-1.5 px-4 py-2 bg-indigo-500 hover:bg-indigo-400 text-white text-sm font-medium rounded-xl shadow-lg shadow-indigo-500/25 transition-all active:scale-95"
            >
              {isLast ? 'Finish Tour' : 'Next'}
              {!isLast && <ChevronRight size={16} />}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
