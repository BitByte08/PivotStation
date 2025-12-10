'use client';
import ModalContainer from '@/app/components/containers/ModalContainer';
import { useStore } from '@/app/store/useStore';
import useModal from '../../store/useModal';
export default function SettingsModal() {
  const { fps, setFps, holdThreshold, setHoldThreshold } = useStore();
  const { closeModal } = useModal();

  return (
    <ModalContainer>
      <div className="bg-surface backdrop-blur-xl rounded-lg p-6 w-96 shadow-2xl border border-white/20">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Settings</h2>
          <button 
            onClick={closeModal}
            className="text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        </div>

        <div className="space-y-6">
          {/* FPS Control */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
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
            <div className="flex justify-between text-xs text-gray-400 mt-1">
              <span>느리게 (1)</span>
              <span>빠르게 (60)</span>
            </div>
          </div>

          {/* Hold Duration Control */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
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
            <div className="flex justify-between text-xs text-gray-400 mt-1">
              <span>유지 안함 (0%)</span>
              <span>전체 유지 (100%)</span>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              프레임 간 전환 시 프레임이 얼마나 오래 유지되는지를 설정합니다.
            </p>
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <button 
            onClick={closeModal}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm font-medium"
          >
            Done
          </button>
        </div>
      </div>
    </ModalContainer>
  );
}

