interface MainContainerProps { children?: React.ReactNode }
const BodyContainer: React.FC<MainContainerProps> = ({children}) => <body className="flex flex-col min-h-screen max-h-screen min-w-screen min-w-screen bg-background p-4 gap-4">{children}</body>
export default BodyContainer;