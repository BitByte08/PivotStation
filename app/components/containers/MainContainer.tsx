interface MainContainerProps { children?: React.ReactNode }
const MainContainer: React.FC<MainContainerProps> = ({children}) => <main className="flex min-h-screen flex-col items-center justify-center">{children}</main>
export default MainContainer;