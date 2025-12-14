'use client';

import { useStore } from '@/app/store/useStore';
import { useRouter } from 'next/navigation';

// Simple icon components
const Crosshair = ({ size = 20 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="10" />
    <path d="M22 12h-4M6 12H2M12 6V2M12 22v-4" />
  </svg>
);

const Link = ({ size = 20 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71" />
    <path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71" />
  </svg>
);

const Target = ({ size = 20 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="10" />
    <circle cx="12" cy="12" r="6" />
    <circle cx="12" cy="12" r="2" />
  </svg>
);

const Move = ({ size = 20 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M5 9l-3 3 3 3M9 5l3-3 3 3M15 19l-3 3-3-3M19 9l3 3-3 3M2 12h20M12 2v20" />
  </svg>
);

const Anchor = ({ size = 20 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="5" r="3" />
    <path d="M12 22V8M5 12H2a10 10 0 0020 0h-3" />
  </svg>
);

const Activity = ({ size = 20 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
  </svg>
);

const CheckCircle = ({ size = 20 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M22 11.08V12a10 10 0 11-5.93-9.14M22 4L12 14.01l-3-3" />
  </svg>
);

const Save = ({ size = 20 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z" />
    <path d="M17 21v-8H7v8M7 3v5h8" />
  </svg>
);

const Download = ({ size = 20 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3" />
  </svg>
);

const Home = ({ size = 20 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
    <path d="M9 22V12h6v10" />
  </svg>
);

export default function BuilderToolbar() {
  const { 
    builderTool, 
    setBuilderTool, 
    validateBuilderFigure,
    validationErrors,
    saveBuilderFigure,
    exportBuilderFigure,
    builderFigure,
    connectingPivots,
    clearConnectingPivots,
    createLineFromConnecting
  } = useStore();
  
  const router = useRouter();

  const tools = [
    { id: 'select' as const, icon: Move, label: '이동' },
    { id: 'add-pivot' as const, icon: Crosshair, label: '피봇 추가' },
    { id: 'connect' as const, icon: Link, label: '피봇 연결' },
    { id: 'set-root' as const, icon: Target, label: '루트 설정' },
    { id: 'set-joint' as const, icon: Activity, label: '관절 설정' },
    { id: 'set-fixed' as const, icon: Anchor, label: '고정 설정' },
  ];

  const handleValidate = () => {
    validateBuilderFigure();
  };

  const handleSave = () => {
    const name = prompt('피봇 이름 입력:');
    if (name) {
      saveBuilderFigure(name);
      alert('피봇이 라이브러리에 저장되었습니다!');
    }
  };

  const handleExport = () => {
    const name = prompt('파일 이름 입력:');
    if (name) {
      exportBuilderFigure(name);
    }
  };

  const handleBackToHome = () => {
    if (confirm('피봇 만들기를 나가실까요? 저장되지 않은 변경사항은 삭제됩니다.')) {
      router.push('/');
    }
  };

  return (
    <div className="fixed left-4 top-1/2 -translate-y-1/2 flex flex-col gap-2 bg-white/90 backdrop-blur-sm rounded-lg shadow-lg p-2 z-50">
      {/* Tools */}
      <div className="flex flex-col gap-1 border-b border-gray-300 pb-2">
        {tools.map((tool) => {
          const Icon = tool.icon;
          return (
            <button
              key={tool.id}
              onClick={() => setBuilderTool(tool.id)}
              className={`p-3 rounded-md transition-colors relative group ${
                builderTool === tool.id
                  ? 'bg-blue-500 text-white'
                  : 'hover:bg-gray-100 text-gray-700'
              }`}              title={tool.label}            >
              <Icon size={20} />
            </button>
          );
        })}
      </div>

      {/* Connect Mode Controls */}
      {builderTool === 'connect' && connectingPivots.length >= 2 && (
        <div className="flex flex-col gap-1 border-b border-gray-300 pb-2">
          <button
            onClick={createLineFromConnecting}
            className="px-3 py-2 bg-green-500 text-white text-xs rounded-md hover:bg-green-600 transition-colors font-medium"
          >
            연결
          </button>
          <button
            onClick={clearConnectingPivots}
            className="px-3 py-2 bg-gray-300 text-gray-700 text-xs rounded-md hover:bg-gray-400 transition-colors"
          >
            취소
          </button>
        </div>
      )}

      {/* Validation */}
      <div className="flex flex-col gap-1 border-b border-gray-300 pb-2">
        <button
          onClick={handleValidate}
          className={`p-3 rounded-md transition-colors relative ${
            validationErrors.length === 0 && builderFigure
              ? 'bg-green-500 text-white'
              : 'hover:bg-gray-100 text-gray-700'
          }`}
          title="유효성 검사"
        >
          <CheckCircle size={20} />
          {validationErrors.length > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
              {validationErrors.length}
            </span>
          )}
        </button>
      </div>

      {/* Actions */}
      <div className="flex flex-col gap-1 border-b border-gray-300 pb-2">
        <button
          onClick={handleSave}
          className="p-3 rounded-md hover:bg-gray-100 text-gray-700 transition-colors"
          title="라이브러리에 저장"
          disabled={!builderFigure}
        >
          <Save size={20} />
        </button>
        <button
          onClick={handleExport}
          className="p-3 rounded-md hover:bg-gray-100 text-gray-700 transition-colors"
          title="파일로 내보내기"
          disabled={!builderFigure}
        >
          <Download size={20} />
        </button>
      </div>

      {/* Navigation */}
      <button
        onClick={handleBackToHome}
        className="p-3 rounded-md hover:bg-gray-100 text-gray-700 transition-colors"
        title="나가기"
      >
        <Home size={20} />
      </button>
    </div>
  );
}
