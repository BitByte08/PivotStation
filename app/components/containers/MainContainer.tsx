interface MainContainerProps { children?: React.ReactNode }
const MainContainer: React.FC<MainContainerProps> = ({children}) => <main className="flex min-h-screen max-h-screen min-w-screen min-w-screen flex-col items-center justify-center bg-background">{children}</main>
export default MainContainer;