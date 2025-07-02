import { Outlet,} from "react-router-dom";
import AdminSidebar from "./Adminsidebar";

const AdminLayout = () => {
  return (
    <div className="flex h-screen">
      <AdminSidebar />
      <div className="flex-grow p-p">
        <Outlet/>
      </div>
    </div>
  );
};

export default AdminLayout;
