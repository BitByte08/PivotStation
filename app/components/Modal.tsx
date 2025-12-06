'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useRef } from 'react';

export default function Modal({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    if (!dialogRef.current?.open) {
      dialogRef.current?.showModal();
    }
  }, []);

  const onDismiss = () => {
    router.back();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={onDismiss}>
      <dialog
        ref={dialogRef}
        className="w-full max-w-4xl max-h-[90vh] overflow-auto rounded-lg bg-white p-0 shadow-xl"
        onClick={(e) => e.stopPropagation()}
        onClose={onDismiss}
      >
        {children}
      </dialog>
    </div>
  );
}
