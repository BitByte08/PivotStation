interface ModalContainerProps { children?: React.ReactNode }
const ModalContainer: React.FC<ModalContainerProps> = ({children}) => <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">{children}</div>
export default ModalContainer;