'use client';

import { useState } from 'react';
import Modal from './Modal';

interface NewProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (name: string, description: string) => void;
}

export default function NewProjectModal({ isOpen, onClose, onConfirm }: NewProjectModalProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  const handleConfirm = () => {
    if (!name.trim()) {
      alert('프로젝트 이름을 입력해주세요.');
      return;
    }
    onConfirm(name, description);
    setName('');
    setDescription('');
  };

  const handleClose = () => {
    setName('');
    setDescription('');
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose}>
      <div className="p-6">
        <h2 className="text-2xl font-bold mb-6">새 프로젝트 생성</h2>
        
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">프로젝트 이름 *</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter') handleConfirm();
            }}
            placeholder="예: My Animation"
            className="w-full px-4 py-2 border rounded-lg bg-white text-black"
          />
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium mb-2">설명</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="프로젝트에 대한 설명을 입력해주세요..."
            className="w-full px-4 py-2 border rounded-lg bg-white text-black resize-none h-20"
          />
        </div>

        <div className="flex gap-2 justify-end">
          <button
            onClick={handleClose}
            className="px-4 py-2 rounded-lg border border-gray-300 dark:border-neutral-600 hover:bg-gray-100 dark:hover:bg-neutral-800"
          >
            취소
          </button>
          <button
            onClick={handleConfirm}
            className="px-4 py-2 rounded-lg bg-blue-500 text-white hover:bg-blue-600"
          >
            생성
          </button>
        </div>
      </div>
    </Modal>
  );
}
