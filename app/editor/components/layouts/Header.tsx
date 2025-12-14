'use client';
import React from 'react';
import { useRouter } from 'next/navigation';
import { useStore } from '@/app/store/useStore';
import { useModal } from '@/app/editor/store/useModal';

const EditorHeader: React.FC = () => {
	const router = useRouter();
	const { saveToLocalStorage, project } = useStore();
	const { openModalType } = useModal();

	const handleSave = () => {
		saveToLocalStorage();
		alert(`'${project.name}' 프로젝트가 저장되었습니다!`);
	};

	const handleExport = () => {
		openModalType('export');
	};

	return (
		<header className="h-14 w-full flex bg-surface p-3 items-center rounded-2xl justify-between shadow-sm">
			<div className='flex h-full items-center gap-3'>
				<button 
					onClick={() => router.push('/')}
					className="flex items-center justify-center p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
					title="홈으로"
				>
					<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
					</svg>
				</button>
				<span className="font-bold text-lg text-foreground">PivotStation</span>
				<div className="h-full w-px bg-gray-300 mx-2" />
			</div>
			<nav>
				<button 
					onClick={handleSave}
					className="px-3 py-1.5 bg-green-600 text-white rounded-md font-medium text-sm hover:bg-green-700 transition-colors mr-2"
				>
					저장
				</button>
				<button 
					onClick={handleExport}
					className="px-3 py-1.5 bg-background rounded-md font-medium text-sm hover:bg-gray-100 transition-colors"
				>
					내보내기 (Export)
				</button>
			</nav>
		</header>
	);
};

export default EditorHeader;