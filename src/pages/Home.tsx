import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import menuConfig from "../config/menuConfig.json";
import * as Icons from "lucide-react";

const Home: React.FC = () => {
  const navigate = useNavigate();
  const [userRole, setUserRole] = useState<string | null>(null);

  useEffect(() => {
    const storedRole = localStorage.getItem("userRole").replace(/"/g, "");

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
        title="Logout"
      >
        <Icons.LogOut className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 lg:w-6 lg:h-6" />
      </button>

      <div className="w-full flex justify-center mb-8 md:mb-12 lg:mb-16">
        <img 
          src="logo.png" 
          alt="Logo Conference" 
          className="w-[280px] h-32 object-contain md:w-[350px] md:h-40 lg:w-[550px] lg:h-60"
        />
      </div>


      <div className="w-full flex items-center justify-center">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 w-full max-w-4xl">
          {menuConfig.buttons
            // .filter((btn) => !userRole || btn.visibleFor.includes(userRole))
            .filter(btn => btn.visibleFor.includes(userRole || ""))
            .map((btn) => {
              const Icon = Icons[btn.icon];
              return (
                <button
                  key={btn.label}
                  onClick={() => navigate(btn.route)}
                  className={`
                    ${btn.color} text-white font-semibold relative 
                    px-12 py-5 md:px-16 md:py-6 lg:px-20 lg:py-8 
                    rounded-xl overflow-hidden transition-all duration-300 
                    hover:-translate-y-2 hover:shadow-2xl 
                    flex flex-col items-center justify-center
                    border border-transparent
                    before:absolute before:inset-0 before:border before:border-transparent 
                    before:rounded-xl before:transition-all before:duration-500 
                    hover:before:border-white
                  `}
                >
                  <Icon className="w-10 h-10 md:w-12 md:h-12 lg:w-14 lg:h-14 text-white" />
                  <span className="text-lg md:text-xl lg:text-2xl font-bold">{btn.label}</span>
                </button>
              );
            })}
        </div>
      </div>
    </div>
  );
};

export default Home;
