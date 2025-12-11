interface ModalContainerProps { 
	children?: React.ReactNode
	isOpen?: boolean
}
const ModalContainer: React.FC<ModalContainerProps> = ({children, isOpen = true}) => (
	<div 
		className={`
			fixed z-50 transition-all duration-300 select-none
			${isOpen ? 'visible opacity-100 translate-x-0' : 'invisible opacity-0 -translate-x-96'}
		`}
		style={{
			width: 'auto',
			maxWidth: '400px',
			visibility: isOpen ? 'visible' : 'hidden',
			top: '50%',
			left: 'calc(var(--toolbox-width, 72px) + 32px)',
			transform: isOpen ? 'translateY(-50%)' : 'translate(-24rem, -50%)'
		}}
	>
		{children}
	</div>
)
export default ModalContainer;