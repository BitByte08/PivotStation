export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-4">
      <div className="z-10 max-w-5xl w-full items-center justify-between font-mono text-sm lg:flex">
        <h1 className="text-4xl font-bold mb-8">Pivot Station</h1>
      </div>

      <div className="mb-32 grid text-center lg:max-w-5xl lg:w-full lg:mb-0 lg:grid-cols-3 lg:text-left gap-4">
        <a
          href="/editor/"
          className="group rounded-lg border border-transparent px-5 py-4 transition-colors hover:border-gray-300 hover:bg-gray-100 hover:dark:border-neutral-700 hover:dark:bg-neutral-800/30"
        >
          <h2 className={`mb-3 text-2xl font-semibold`}>
            {"> " }새로운 프로젝트
          </h2>
          <p className={`m-0 text-sm opacity-50`}>
            새로운 애니메이션 프로젝트를 생성해요.
          </p>
        </a>
      </div>
    </div>
  );
}
