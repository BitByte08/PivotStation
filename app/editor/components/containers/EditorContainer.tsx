interface EditorContainerProps { children?: React.ReactNode }
const EditorContainer: React.FC<EditorContainerProps> = ({children}) => <section className="flex-1 flex items-center h-full w-full gap-4">{children}</section>
export default EditorContainer;