'use client';
import React from 'react';
import { useStore } from '@/app/store/useStore';
import { useModal } from '@/app/editor/store/useModal';

const EditorHeader: React.FC = () => {
	const { addFrame, togglePlay, isPlaying } = useStore();
	const { openModalType, closeModal } = useModal();

	return (
		<header className="h-14 w-full border-b bg-surface flex items-center px-4 gap-4">
			<h1 className="font-bold text-lg text-foreground">Pivot Animator</h1>
			<div className="h-6 w-px bg-gray-300 mx-2"></div>
			<button 
				onClick={() => openModalType('models')}
				className="px-3 py-1.5 bg-primary text-background rounded hover:bg-blue-700 text-sm font-medium"
			>
				피규어 추가
			</button>
			<div className="flex items-center gap-2 mr-4">
				<span className="text-sm text-foreground">FPS: {useStore.getState().fps}</span>
				<button 
					onClick={() => openModalType('settings')}
					className="p-2 text-gray-600 hover:bg-gray-100 rounded"
					title="Settings"
				>
					⚙️
				</button>
			</div>
			<button 
				onClick={togglePlay}
				className={`px-3 py-1.5 rounded text-sm font-medium border ${isPlaying ? 'bg-red-100 text-red-700 border-red-200' : 'bg-green-100 text-green-700 border-green-200'}`}
			>
				{isPlaying ? 'Stop' : 'Play'}
			</button>
			<button 
				onClick={() => openModalType('export')}
				className="px-3 py-1.5 bg-purple-50 text-purple-600 rounded hover:bg-purple-100 text-sm font-medium border border-purple-200 ml-auto"
			>
				Export
			</button>
			<button 
				onClick={() => {
					if (confirm('Are you sure you want to reset the project?')) {
						useStore.getState().resetProject();
						// close any open modals
						closeModal();
					}
				}}
				className="px-3 py-1.5 bg-red-50 text-red-600 rounded hover:bg-red-100 text-sm font-medium border border-red-200"
			>
				Reset
			</button>
			<button 
				onClick={() => useStore.getState().checkIntegrity()}
				className="px-3 py-1.5 bg-yellow-50 text-yellow-600 rounded hover:bg-yellow-100 text-sm font-medium border border-yellow-200"
			>
				Debug
			</button>
		</header>
	);
};

export default EditorHeader;