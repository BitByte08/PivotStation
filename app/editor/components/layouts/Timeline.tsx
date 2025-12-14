'use client';
import React, { useEffect, useRef, useState } from 'react';
import { useStore } from '@/app/store/useStore';

interface TimelineButtonProps {
  children?: React.ReactNode;
  onClick?: () => void;
  className?: string;
  active?: boolean;
}

const TimelineButton: React.FC<TimelineButtonProps> = ({children, onClick, className, active}) => (
  <div 
    onClick={onClick} 
    className={`
        min-w-[3.5rem] h-[80%] rounded-md flex items-center justify-center cursor-pointer shrink-0 
        transition-all text-sm font-medium border overflow-hidden
        ${active 
            ? 'border-blue-500 text-blue-500 bg-blue-50 shadow-sm' 
            : 'border-transparent bg-background text-foreground hover:bg-gray-50 hover:border-gray-200'}
        ${className || ''}
    `}
  >
    {children}
  </div>
);

const NavButton = ({ onClick, children, title }: { onClick: () => void, children: React.ReactNode, title?: string }) => (
    <button 
        onClick={onClick}
        className="h-6 w-6 flex items-center justify-center rounded bg-gray-50 border border-gray-200 text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors text-xs font-bold"
        title={title}
    >
        {children}
    </button>
);

const Timeline: React.FC = () => {
  const { project, currentFrameIndex, setCurrentFrameIndex, addFrame, interpolatingTargetIndex } = useStore();
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [jumpInput, setJumpInput] = useState<string>('');

  // Auto-scroll to current frame
  useEffect(() => {
    if (scrollContainerRef.current) {
        const container = scrollContainerRef.current;
        const buttonWidth = 80; // approx width including gap
        const targetScroll = currentFrameIndex * buttonWidth - (container.clientWidth / 2) + (buttonWidth / 2);
        
        container.scrollTo({
            left: Math.max(0, targetScroll),
            behavior: 'smooth'
        });
    }
  }, [currentFrameIndex]);

  // Handle jump input
  const handleJump = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
        const frameNum = parseInt(jumpInput);
        if (!isNaN(frameNum) && frameNum >= 1 && frameNum <= project.frames.length) {
            setCurrentFrameIndex(frameNum - 1);
            setJumpInput('');
        }
    }
  };

  const handleAddFrame = () => {
      addFrame();
      // Scroll will happen automatically via useEffect
  };

  return (
    <footer className="w-full bg-white shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] flex flex-col gap-1 fixed bottom-0 left-0 right-0 h-24 border-t border-gray-200 z-40 rounded-2xl">
      {/* Control Panel (Top) */}
      <div className="flex items-center justify-between px-4 h-8 border-b border-gray-100 bg-gray-50/50">
        <div className="flex items-center gap-2">
            <span className="text-[10px] text-gray-500 font-medium tracking-tight">FRAME {currentFrameIndex + 1} / {project.frames.length}</span>
        </div>
        
        <div className="flex items-center gap-4">
             <div className="flex items-center gap-2">
                <span className="text-[10px] text-gray-400 font-medium">JUMP</span>
                <input 
                    type="number" 
                    className="w-10 h-5 text-xs border border-gray-200 rounded px-1 bg-white text-center focus:outline-none focus:border-blue-500 transition-colors"
                    value={jumpInput}
                    onChange={(e) => setJumpInput(e.target.value)}
                    onKeyDown={handleJump}
                />
            </div>

            <div className="flex gap-0.5">
                <NavButton onClick={() => setCurrentFrameIndex(0)} title="First">«</NavButton>
                <NavButton onClick={() => setCurrentFrameIndex(Math.max(0, currentFrameIndex - 1))} title="Prev">‹</NavButton>
                <NavButton onClick={() => setCurrentFrameIndex(Math.min(project.frames.length - 1, currentFrameIndex + 1))} title="Next">›</NavButton>
                <NavButton onClick={() => setCurrentFrameIndex(project.frames.length - 1)} title="Last">»</NavButton>
            </div>
        </div>
      </div>

      {/* Frame List (Bottom) */}
      <div 
        ref={scrollContainerRef}
        className='flex-1 flex gap-1 overflow-x-auto scrollbar-hide items-center px-2 bg-surface/50'
      >
         {project.frames.map((frame, index) => {
           const isCurrent = currentFrameIndex === index;
           const isTarget = interpolatingTargetIndex === index;

             return (
               <TimelineButton 
                 key={frame.id}
                 onClick={() => setCurrentFrameIndex(index)}
                 active={isCurrent}
               >
                 <div className="flex flex-col items-center">
                     <span className="text-xs text-gray-400 mb-0.5">Frame</span>
                     <span className="font-bold text-lg leading-none">{index + 1}</span>
                 </div>
               </TimelineButton>
             );
           
         })}
        
        {/* Add Frame Button */}
        <TimelineButton 
            onClick={handleAddFrame}
            className="border-dashed border-gray-300 hover:border-gray-400 hover:bg-gray-50 text-gray-400"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 5v14m-7-7h14"/>
            </svg>
        </TimelineButton>
      </div>
    </footer>
  );
};

export default Timeline;
