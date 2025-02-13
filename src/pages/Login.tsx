import { useState, FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { API_URL } from "../config";

const Login = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);
  
    try {

      const response = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      });
  
      if (!response.ok) {
        throw new Error("Credenciales incorrectas");
      }
  
      const data = await response.json();
    //   console.log("Respuesta del servidor:", data);
  
      localStorage.setItem("token", data.auth.token);
      localStorage.setItem("user", JSON.stringify(data.auth.user));
      localStorage.setItem("userRole", data.auth.user.role);
  
      navigate("/Home");
  
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };
  

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-6 w-screen">
      <div className="w-full max-w-md sm:max-w-lg md:max-w-xl lg:max-w-2xl bg-white p-8 sm:p-12 rounded-xl shadow-xl">
      <div className="flex items-center justify-center pb-10">
        <img 
          src="public/logo.png" 
          alt="Logo Empresa" 
          className="max-w-full max-h-40 object-contain"
        />
      </div>
        <h2 className="text-center text-3xl font-bold text-gray-900 mb-6">Iniciar Sesión</h2>
        <form className="space-y-6" onSubmit={handleSubmit}>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
            <input
              type="text"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="username"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Contraseña</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="••••••••"
            />
          </div>
          {error && <div className="text-red-500 text-sm text-center bg-red-100 p-2 rounded-md">{error}</div>}
          <button
            type="submit"
            disabled={isLoading}
            className={`w-full py-3 text-white font-semibold rounded-md transition-all duration-200 ${
              isLoading ? "bg-indigo-400" : "bg-indigo-600 hover:bg-indigo-700"
            }`}
          >
            {isLoading ? "Cargando..." : "Iniciar Sesión"}
          </button>
        </form>
        <p className="text-center text-sm text-gray-600 mt-4">
          ¿No tienes una cuenta?{' '}
          <a href="/registro" className="text-indigo-600 hover:text-indigo-500 font-medium">
            Regístrate
          </a>
        </p>
      </div>
    </div>
  );
};

export default Login;
