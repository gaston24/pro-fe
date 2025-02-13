import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { 
  Home, 
  Users, 
  Package, 
  PlusSquare, 
  FileText, 
  LogOut, 
  Menu 
} from 'lucide-react';

const Navbar: React.FC = () => {
  const navigate = useNavigate();
  const [userRole, setUserRole] = useState<string | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false); 

  useEffect(() => {
    const role = localStorage.getItem("userRole");
    setUserRole(role);
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  const navLinks = [
    { label: "Vendedores", route: "/Sellers", icon: Users, color: "text-blue-600", visibleFor: ["administrador"] },
    { label: "Clientes", route: "/Clients", icon: Users, color: "text-green-600", visibleFor: ["administrador", "vendedor"] },
    { label: "Artículos", route: "/articles", icon: Package, color: "text-yellow-600", visibleFor: ["administrador", "vendedor"] },
    { label: "Nuevo Artículo", route: "/ArticleNew", icon: PlusSquare, color: "text-yellow-700", visibleFor: ["administrador", "vendedor"] },
    { label: "Pedidos", route: "/orders", icon: FileText, color: "text-red-600", visibleFor: ["administrador", "vendedor", "cliente"] },
    { label: "Pedido Nuevo", route: "/NewOrder", icon: FileText, color: "text-red-700", visibleFor: ["administrador", "vendedor", "cliente"] }
  ];

  return (
    <nav className="w-full bg-gray-50 shadow-sm py-3 px-4">
      
      <div className="hidden lg:flex w-full max-w-[1200px] mx-auto items-center justify-between">
        <div className="flex gap-6 flex-grow justify-center">
          <Link to="/home" className="flex items-center text-blue-600 hover:opacity-80">
            <Home className="w-5 h-5" />
            <span className="ml-2 text-sm font-medium">Inicio</span>
          </Link>

          {navLinks.map(link => (
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

      <div className="hidden md:flex lg:hidden justify-center items-center gap-6">
        <Link to="/home" className="flex flex-col items-center text-blue-600 hover:opacity-80">
          <Home className="w-6 h-6" />
          <span className="text-xs mt-1">Inicio</span>
        </Link>

        {navLinks.map(link => (
          <Link key={link.label} to={link.route} className={`flex flex-col items-center hover:opacity-80 text-center ${link.color}`}>
            <link.icon className="w-6 h-6" />
            <span className="text-xs mt-1">{link.label}</span>
          </Link>
        ))}

        <button onClick={handleLogout} className="flex flex-col items-center text-red-600 hover:opacity-80">
          <LogOut className="w-6 h-6" />
          <span className="text-xs mt-1">Cerrar Sesión</span>
        </button>
      </div>

      <div className="flex sm:hidden justify-between items-center">
        <Link to="/home" className="text-blue-600 hover:opacity-80">
          <Home className="w-6 h-6" />
        </Link>

        <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="text-gray-700">
          <Menu className="w-6 h-6" />
        </button>

        <button onClick={handleLogout} className="text-red-600 hover:opacity-80">
          <LogOut className="w-6 h-6" />
        </button>
      </div>

      {isMenuOpen && (
        <div className="absolute top-14 left-0 w-full bg-white shadow-md py-4 px-6 z-50">
          <div className="flex flex-col gap-4">
            {navLinks.map(link => (
              <Link key={link.label} to={link.route} className={`flex items-center hover:opacity-80 ${link.color}`} onClick={() => setIsMenuOpen(false)}>
                <link.icon className="w-5 h-5" />
                <span className="ml-2 text-sm font-medium">{link.label}</span>
              </Link>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
