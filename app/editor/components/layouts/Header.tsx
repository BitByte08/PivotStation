'use client';
import React from 'react';
import { useStore } from '@/app/store/useStore';
import { useModal } from '@/app/editor/store/useModal';

const EditorHeader: React.FC = () => {
	const { addFrame, togglePlay, isPlaying } = useStore();
	const { openModalType, closeModal } = useModal();

	return (
		<header className="h-14 w-full flex bg-surface p-3 items-center rounded-2xl justify-between">
			<div className='flex h-full'>
				<span className="font-bold text-lg text-foreground">Pivot Animator</span>
				<div className="h-full w-px bg-gray-300 mx-2" />
			</div>
			<nav>
				<button 
					onClick={() => openModalType('export')}
					className="px-3 py-1.5 bg-background rounded-md"
				>
					Export
				</button>
			</nav>
		</header>
	);
};

export default EditorHeader;