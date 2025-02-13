import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import menuConfig from "../config/menuConfig.json";
import * as Icons from "lucide-react";

const Home: React.FC = () => {
  const navigate = useNavigate();
  const [userRole, setUserRole] = useState<string | null>(null);

  useEffect(() => {
    const storedRole = localStorage.getItem("userRole");
    setUserRole(storedRole);
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 w-screen relative p-6">
      <button
        onClick={handleLogout}
        className="
          absolute top-3 right-3 
          bg-red-500 hover:bg-red-600 
          text-white rounded-full 
          shadow-md flex items-center justify-center
          transition-all duration-300 hover:scale-110
          p-1 sm:p-2 md:p-3 lg:p-3
        "
        title="Cerrar Sesión"
      >
        <Icons.LogOut className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 lg:w-6 lg:h-6" />
      </button>

      <div className="w-full flex justify-center mb-12">
        <img 
          src="logo.png" 
          alt="Logo Empresa" 
          className="w-[250px] h-28 object-contain md:w-[300px] md:h-32 lg:w-[500px] lg:h-48"
        />
      </div>

      <div className="w-full flex items-center justify-center">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 w-full max-w-4xl">
          {menuConfig.buttons
            .filter((btn) => !userRole || btn.visibleFor.includes(userRole))
            .map((btn) => {
              const Icon = Icons[btn.icon];
              return (
                <button
                  key={btn.label}
                  onClick={() => navigate(btn.route)}
                  className={`
                    ${btn.color} text-white rounded-lg p-4 md:p-5 lg:p-7
                    transform transition-all duration-300 
                    hover:-translate-y-2 hover:shadow-xl 
                    flex flex-col items-center justify-center 
                    space-y-2 group text-base md:text-lg lg:text-lg
                  `}
                >
                  <Icon 
                    className="w-8 h-8 md:w-9 md:h-9 lg:w-12 lg:h-12 text-white group-hover:scale-110 transition-transform"
                  />
                <span className="text-lg md:text-lg lg:text-2xl font-semibold">
                  {btn.label}
                </span>
                </button>
              );
            })}
        </div>
      </div>
    </div>
  );
};

export default Home;
