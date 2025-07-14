export default function Layout({ children }) {
  return (
    // <main className="bg-black">
      <div className="w-screen h-screen p-4 flex justify-center overflow-hidden">
        <div className="w-full max-w-[800px]">{children}</div>
      </div>
    // </main>
  );
}
