'use client';
import ModalContainer from '@/app/components/containers/ModalContainer';
import { useStore } from '@/app/store/useStore';
import useModal from '../../store/useModal';

export default function SettingsModal() {
  const { 
    fps, setFps, 
    holdThreshold, setHoldThreshold, 
    project, setProjectName, setProjectDescription, saveToLocalStorage,
    globalThickness, setGlobalThickness 
  } = useStore();
  const { closeModal } = useModal();

  return (
    <ModalContainer>
      <div className="bg-surface rounded-2xl rounded-l-none p-6 w-96 h-full shadow-sm overflow-auto flex flex-col">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-foreground">설정 (Settings)</h2>
          <button 
            onClick={closeModal}
            className="text-foreground/50 hover:text-foreground transition-colors"
          >
            ✕
          </button>
        </div>

        <div className="space-y-6 flex-1">
          {/* Project Info */}
          <div className="border-b border-foreground/10 pb-4">
            <h3 className="text-sm font-bold text-foreground mb-4">프로젝트 정보</h3>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">제목</label>
              <input 
                type="text" 
                value={project.name}
                onChange={(e) => setProjectName(e.target.value)}
                className="w-full border border-foreground/20 rounded bg-background text-foreground p-2 text-sm"
                placeholder="프로젝트 이름을 입력하세요"
              />
            </div>
            <div className="mt-3">
              <label className="block text-sm font-medium text-foreground mb-2">설명</label>
              <textarea 
                value={project.description}
                onChange={(e) => setProjectDescription(e.target.value)}
                className="w-full border border-foreground/20 rounded bg-background text-foreground p-2 text-sm resize-none h-16"
                placeholder="프로젝트 설명을 입력하세요"
              />
            </div>
            <button 
              onClick={saveToLocalStorage}
              className="mt-3 w-full py-2 bg-background text-foreground rounded border border-foreground/20 hover:border-foreground/40 text-sm font-medium transition-colors"
            >
              로컬 저장소에 프로젝트 저장
            </button>
          </div>

          {/* FPS Control */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              재생 속도 (FPS): {fps}
            </label>
            <input 
              type="range" 
              min="1" 
              max="60" 
              value={fps} 
              onChange={(e) => setFps(Number(e.target.value))}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-foreground/50 mt-1">
              <span>느리게 (1)</span>
              <span>빠르게 (60)</span>
            </div>
          </div>

          {/* Global Thickness Control */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              기본 선 굵기: {globalThickness}px
            </label>
            <input 
              type="range" 
              min="1" 
              max="20" 
              value={globalThickness} 
              onChange={(e) => setGlobalThickness(Number(e.target.value))}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-foreground/50 mt-1">
              <span>얇게 (1)</span>
              <span>굵게 (20)</span>
            </div>
            <p className="text-xs text-foreground/60 mt-2">
              모든 스틱 피규어의 기본 두께를 설정합니다. (개별 설정이 없는 경우 적용됨)
            </p>
          </div>

          {/* Hold Duration Control */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              프레임 유지 비율: {Math.round(holdThreshold * 100)}%
            </label>
            <input 
              type="range" 
              min="0" 
              max="100" 
              step="10"
              value={holdThreshold * 100} 
              onChange={(e) => setHoldThreshold(Number(e.target.value) / 100)}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-foreground/50 mt-1">
              <span>유지 안함 (0%)</span>
              <span>전체 유지 (100%)</span>
            </div>
            <p className="text-xs text-foreground/60 mt-2">
              프레임 간 전환 시 프레임이 얼마나 오래 유지되는지를 설정합니다.
            </p>
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <button 
            onClick={closeModal}
            className="px-4 py-2 bg-background text-foreground rounded border border-foreground/20 hover:border-foreground/40 text-sm font-medium transition-colors"
          >
            완료 (Done)
          </button>
        </div>
      </div>
    </ModalContainer>
  );
}
