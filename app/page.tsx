'use client';

import { useRef } from 'react';
import { useStore } from '@/app/store/useStore';
import { useRouter } from 'next/navigation';
import UpdateNotification from '@/app/components/UpdateNotification';

export default function Home() {
  const projectFileInputRef = useRef<HTMLInputElement>(null);
  const { setProject } = useStore();
  const router = useRouter();

  const handleProjectFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        const project = JSON.parse(content);
        setProject(project);
        router.push('/editor');
      } catch {
        alert('파일을 읽을 수 없습니다. 올바른 .psproject 파일인지 확인해주세요.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="flex flex-col justify-center py-20 px-40">
      <div className="z-10 max-w-5xl w-full items-center justify-between font-mono text-sm lg:flex">
        <h1 className="text-4xl font-bold mb-8">Pivot Station</h1>
      </div>

      <div className="text-left flex flex-col gap-4">
        <a
          href="/editor/"
          className="group rounded-lg border border-transparent px-5 py-4 transition-colors hover:border-gray-300 hover:bg-gray-100 hover:dark:border-neutral-700 hover:dark:bg-neutral-800/30"
        >
          <h2 className={`mb-3 text-2xl font-semibold`}>
            {"> " }새로운 프로젝트
          </h2>
          <p className={`m-0 text-sm opacity-50`}>
            새로운 애니메이션 프로젝트를 생성해요.
          </p>
        </a>
        
        <a
          href="/projects/"
          className="group rounded-lg border border-transparent px-5 py-4 transition-colors hover:border-gray-300 hover:bg-gray-100 hover:dark:border-neutral-700 hover:dark:bg-neutral-800/30"
        >
          <h2 className={`mb-3 text-2xl font-semibold`}>
            {"> " }내 프로젝트
          </h2>
          <p className={`m-0 text-sm opacity-50`}>
            저장된 프로젝트를 확인해요.
          </p>
        </a>

        <button
          onClick={() => projectFileInputRef.current?.click()}
          className="group rounded-lg border border-transparent px-5 py-4 transition-colors hover:border-gray-300 hover:bg-gray-100 hover:dark:border-neutral-700 hover:dark:bg-neutral-800/30 text-left"
        >
          <h2 className={`mb-3 text-2xl font-semibold`}>
            {"> " }프로젝트 불러오기
          </h2>
          <p className={`m-0 text-sm opacity-50`}>
            .psproject 파일을 불러와요.
          </p>
        </button>
        
        <input
          ref={projectFileInputRef}
          type="file"
          accept=".psproject"
          onChange={handleProjectFileUpload}
          style={{ display: 'none' }}
        />
      </div>
      <UpdateNotification />
    </div>
  );
}
