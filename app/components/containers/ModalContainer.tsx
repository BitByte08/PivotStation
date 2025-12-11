interface ModalContainerProps { 
	children?: React.ReactNode
	isOpen?: boolean
}
const ModalContainer: React.FC<ModalContainerProps> = ({children, isOpen = true}) => (
	<div 
		className={`
			fixed z-50 transition-all duration-300 select-none flex flex-col
			${isOpen ? 'visible opacity-100 translate-x-0' : 'invisible opacity-0 translate-x-96'}
		`}
		style={{
			width: 'auto',
			maxWidth: '400px',
			visibility: isOpen ? 'visible' : 'hidden',
			top: '16px',
			bottom: '16px',
			right: '16px',
			height: 'calc(100vh - 32px)'
		}}
	>
		{children}
	</div>
)
export default ModalContainer;