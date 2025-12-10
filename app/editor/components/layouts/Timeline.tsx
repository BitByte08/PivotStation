'use client';
import React, { useEffect } from 'react';
import { useStore } from '@/app/store/useStore';

interface TimelineButtonProps {
  children?: React.ReactNode;
  onClick?: () => void;
  className?: string;
}
const TimelineButton: React.FC<TimelineButtonProps> = ({children, onClick, className}) => 
<div onClick={onClick} className={"w-24 h-full rounded-md flex items-center justify-center cursor-pointer shrink-0 bg-background relative" + className}>
  {children}
</div>

const Timeline: React.FC = () => {
  const { project, currentFrameIndex, setCurrentFrameIndex, addFrame, interpolatingTargetIndex } = useStore();
  return (
    <footer className="h-20 w-full bg-surface rounded-2xl p-3 shadow-sm">
      <div className='flex gap-2 h-full overflow-x-scroll'>
         {project.frames.map((frame, index) => {
           const isCurrent = currentFrameIndex === index;
           const isTarget = interpolatingTargetIndex === index;

           return (
             <TimelineButton 
               key={frame.id}
               onClick={() => setCurrentFrameIndex(index)}
               className={`
                 ${isCurrent ? 'border-2 border-blue-500 text-blue-500' : 
                   isTarget ? 'border-2 border-green-400 text-green-600' : 'text-foreground border-background'}
               `}
             >
               <span className="font-bold">{index + 1}</span>
               {isTarget && (
                  <div className="absolute inset-0 border-2 border-green-400 animate-pulse pointer-events-none rounded"></div>
               )}
             </TimelineButton>
           );
           
         })}
        <TimelineButton 
            onClick={addFrame}
            className="px-3 py-1.5 bg-gray-100 text-background rounded hover:bg-gray-200 text-sm font-medium"
          >
            +
        </TimelineButton>
      </div>
    </footer>
  );
};

export default Timeline;
