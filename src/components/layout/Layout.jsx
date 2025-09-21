
import { Outlet } from "react-router-dom";
import Header from "./Header";

const Layout = () => {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Header luôn hiển thị */}
      <Header />

      {/* Nội dung page */}
      <main >
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;
