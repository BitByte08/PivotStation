'use client';
import { useRouter } from 'next/navigation';
import { useStore } from '../../../store/useStore';

export default function SettingsModal() {
  const router = useRouter();
  const { fps, setFps, holdThreshold, setHoldThreshold } = useStore();

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
      <div className="bg-white/80 backdrop-blur-md rounded-lg p-6 w-96 shadow-xl border border-white/20">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Settings</h2>
          <button 
            onClick={() => router.back()}
            className="text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        </div>

        <div className="space-y-6">
          {/* FPS Control */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Playback Speed (FPS): {fps}
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
              <span>Slow (1)</span>
              <span>Fast (60)</span>
            </div>
          </div>

          {/* Hold Duration Control */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Hold Duration: {Math.round(holdThreshold * 100)}%
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
              <span>No Hold (0%)</span>
              <span>Full Hold (100%)</span>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Percentage of frame time to hold the pose before interpolating.
            </p>
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <button 
            onClick={() => router.back()}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm font-medium"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
