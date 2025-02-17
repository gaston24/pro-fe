import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Home, FileText, Users, LogOut } from "lucide-react";

const Navbar: React.FC = () => {
  const navigate = useNavigate();
  const [userRole, setUserRole] = useState<string | null>(null);

  // useEffect(() => {
  //   const role = localStorage.getItem("userRole");
  //   setUserRole(role ? JSON.parse(role) : null); 
  // }, []);

  useEffect(() => {
    const storedRole = (localStorage.getItem("userRole")) ? localStorage.getItem("userRole").replace(/"/g, ""): null;

    setUserRole(storedRole);
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  const navLinks = [
    { label: "Conferences", route: "/Conferences", icon: Users, color: "text-blue-600", visibleFor: ["admin", "user"] },
    { label: "Conferences Manage", route: "/Admin/Conferences", icon: FileText, color: "text-yellow-600", visibleFor: ["admin"] },
    { label: "Speakers Manage", route: "/Admin/Speakers", icon: FileText, color: "text-red-600", visibleFor: ["admin"] }
  ];

  return (
    <nav className="w-full bg-gray-50 shadow-sm py-3 px-4 mb-5">
      {/* if admin can see navbar */}
      {userRole === "admin" && (
      <div className="hidden lg:flex w-full max-w-[1200px] mx-auto items-center justify-between">
        <div className="flex gap-6 flex-grow justify-center">
          <Link to="/home" className="flex items-center text-blue-600 hover:opacity-80">
            <Home className="w-5 h-5" />
            <span className="ml-2 text-sm font-medium">Home</span>
          </Link>

          {navLinks
            .filter(link => link.visibleFor.includes(userRole || ""))
            .map(link => (
              <Link key={link.label} to={link.route} className={`flex items-center hover:opacity-80 text-center ${link.color}`}>
                <link.icon className="w-5 h-5" />
                <span className="ml-2 text-sm font-medium">{link.label}</span>
              </Link>
            ))}

          <button onClick={handleLogout} className="flex items-center bg-red-50 text-red-600 px-3 py-1 rounded-lg hover:opacity-80">
            <LogOut className="w-5 h-5" />
            <span className="ml-2 text-sm font-medium">Cerrar Sesión</span>
          </button>
        </div>
      </div>
      )}
    </nav>
  );
};

export default Navbar;
