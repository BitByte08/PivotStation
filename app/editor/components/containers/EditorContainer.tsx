interface EditorContainerProps { children?: React.ReactNode }
const EditorContainer: React.FC<EditorContainerProps> = ({children}) => <section className="flex flex-1 h-full w-full bg-surface">{children}</section>
export default EditorContainer;