const Layout = ({ children }) => {
  return (
    <main className="bg-gradient-to-r from-rose-50 to-yellow-50">
      <div className="w-screen h-screen p-4">{children}</div>
    </main>
  );
};

export default Layout;
