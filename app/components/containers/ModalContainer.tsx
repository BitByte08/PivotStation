import React from 'react'

interface ModalContainerProps { 
	children?: React.ReactNode
	isOpen?: boolean
}

const ModalContainer: React.FC<ModalContainerProps> = ({children, isOpen = true}) => {
    // If not open, we can still render it effectively hidden or handle unmounting in parent.
    // However, for animation, usually we keep it mounted or use AnimatePresence.
    // Given the props, we'll use CSS transitions.
    
    return (
        <div 
            className={`
                fixed inset-0 z-[100] flex justify-end
                transition-all duration-300
                ${isOpen ? 'visible pointer-events-auto' : 'invisible pointer-events-none delay-300'}
            `}
        >
            {/* Backdrop */}
            <div 
                className={`
                    absolute inset-0 bg-black/20 backdrop-blur-[1px] transition-opacity duration-300
                    ${isOpen ? 'opacity-100' : 'opacity-0'}
                `}
                // Note: Closing logic usually handled by parent passing onClose or clicking X inside.
                // Depending on if `useModal` handles backdrop click. 
                // We'll leave it visual for now as specific close handlers are in children buttons.
            />

            {/* Sidebar Content */}
            <div 
                className={`
                    relative z-10 h-full w-[400px] max-w-[90vw] bg-surface shadow-2xl
                    transform transition-transform duration-300 ease-in-out border-l border-gray-100
                    ${isOpen ? 'translate-x-0' : 'translate-x-full'}
                `}
            >
                {children}
            </div>
        </div>
    )
}

export default ModalContainer;