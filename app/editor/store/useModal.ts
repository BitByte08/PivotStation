import { create } from 'zustand';

export type ModalType = 'export' | 'models' | 'settings' | 'figure-settings' | null;

interface ModalState {
  openModal: ModalType;
  openModalType: (t: Exclude<ModalType, null>) => void;
  closeModal: () => void;
}

export const useModal = create<ModalState>((set, get) => ({
  openModal: null,
  openModalType: (t) => set({ openModal: t }),
  closeModal: () => set({ openModal: null }),
}));
