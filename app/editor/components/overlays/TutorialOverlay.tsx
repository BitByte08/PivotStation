'use client';
import React, { useState, useEffect } from 'react';

export default function TutorialOverlay() {
  const [step, setStep] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const hasSeenTutorial = localStorage.getItem('pivot_tutorial_seen');
    if (!hasSeenTutorial) {
      setIsVisible(true);
    }
  }, []);

  const handleNext = () => {
    if (step < 3) {
      setStep(step + 1);
    } else {
      handleClose();
    }
  };

  const handleClose = () => {
    setIsVisible(false);
    localStorage.setItem('pivot_tutorial_seen', 'true');
  };

  if (!isVisible) return null;

  const steps = [
    {
      title: "환영합니다! (Welcome)",
      content: "PivotStation에 오신 것을 환영합니다. 이 튜토리얼은 앱의 주요 기능을 빠르게 안내해 드립니다.",
      icon: "👋"
    },
    {
      title: "사이드바 (Sidebar)",
      content: "화면 왼쪽의 사이드바에서 이동(Move), 늘리기(Stretch), 뒤집기(Flip) 모드를 선택하거나 설정을 변경할 수 있습니다.",
      icon: "🛠️"
    },
    {
      title: "타임라인 (Timeline)",
      content: "화면 하단에 타임라인이 있습니다. 'Jump' 입력칸을 이용해 프레임으로 바로 이동하거나, 화살표 버튼으로 탐색하세요. 프레임 추가(+)는 리스트 끝에 있습니다.",
      icon: "yw"
    },
    {
      title: "내보내기 (Export)",
      content: "작업이 끝났다면 상단의 '내보내기' 버튼을 눌러보세요. MP4 동영상이나 GIF, 또는 프로젝트 파일로 저장할 수 있습니다.",
      icon: "📤"
    }
  ];

  const currentStep = steps[step];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm text-white">
      <div className="bg-surface text-foreground w-[500px] max-w-[90vw] p-8 rounded-2xl shadow-2xl flex flex-col items-center text-center relative animate-in fade-in zoom-in duration-300">
        
        {/* Close Button */}
        <button 
            onClick={handleClose} 
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
            title="Skip Tutorial"
        >
            ✕
        </button>

        {/* Icon */}
        <div className="text-6xl mb-6 bg-gray-50 rounded-full w-24 h-24 flex items-center justify-center">
            {currentStep.icon === 'yw' ? '🎬' : currentStep.icon}
        </div>

        {/* Steps Indicator */}
        <div className="flex gap-2 mb-6">
            {steps.map((_, i) => (
                <div 
                    key={i} 
                    className={`h-1.5 rounded-full transition-all duration-300 ${i === step ? 'w-8 bg-blue-500' : 'w-2 bg-gray-200'}`}
                />
            ))}
        </div>

        {/* Content */}
        <h2 className="text-2xl font-bold mb-4">{currentStep.title}</h2>
        <p className="text-gray-600 mb-8 leading-relaxed h-20">
            {currentStep.content}
        </p>

        {/* Actions */}
        <div className="flex gap-3 w-full">
            {step > 0 && (
                <button 
                    onClick={() => setStep(step - 1)}
                    className="flex-1 py-3 px-6 rounded-xl border border-gray-200 font-medium text-gray-600 hover:bg-gray-50 transition-colors"
                >
                    이전 (Prev)
                </button>
            )}
            <button 
                onClick={handleNext}
                className="flex-1 py-3 px-6 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-700 shadow-lg hover:shadow-blue-500/30 transition-all transform active:scale-95"
            >
                {step === steps.length - 1 ? '시작하기 (Start)' : '다음 (Next)'}
            </button>
        </div>

      </div>
    </div>
  );
}
