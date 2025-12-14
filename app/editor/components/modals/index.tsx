'use client';
import { useModal } from "@/app/editor/store/useModal";
import ModalContainer from "@/app/components/containers/ModalContainer";
import ModelsModal from "./ModelsModal";
import SettingsModal from "./SettingsModal";
import ExportModal from "./ExportModal";

const Modal: React.FC = () => {
  const { openModal } = useModal();
  if (!openModal) return null;
  if (openModal === 'models') return <ModelsModal />;
  if (openModal === 'settings') return <SettingsModal />;
  if (openModal === 'export') return <ExportModal />;
}

export default Modal;