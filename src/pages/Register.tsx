import { useState, FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { API_BACK } from "../config";

const Register = () => {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    if (!email.includes("@")) {
      setError("Ingrese un email válido");
      setIsLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden");
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch(`${API_BACK}/api/users/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password })
      });

      if (!response.ok) {
        throw new Error("Error al registrar el usuario");
      }

      setShowSuccessModal(true);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-200 px-6 w-screen">
      {showSuccessModal && (
      <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
        <div className="bg-white p-6 rounded-lg shadow-lg text-center w-96">
          <h2 className="text-2xl font-bold text-green-600">¡Registro Exitoso!</h2>
          <p className="text-gray-700 mt-2">Ahora puedes iniciar sesión.</p>
          <button
            onClick={() => navigate("/login")}
            className="mt-4 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition"
          >
            Ir al Login
          </button>
        </div>
      </div>
    )}
      <div className="w-full max-w-md sm:max-w-lg md:max-w-xl lg:max-w-2xl bg-gray-100 p-8 sm:p-12 rounded-xl shadow-xl">
      <h2 className="text-center text-3xl font-bold text-black mb-6">Regístrate</h2>
        <form className="space-y-6" onSubmit={handleSubmit}>
          <div>
          <label className="block text-sm font-medium text-gray-800 mb-1">Nombre</label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-4 py-3 border border-gray-400 rounded-md shadow-sm focus:ring-gray-600 focus:border-gray-600"
            placeholder="Tu nombre completo"
          />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              placeholder="correo@ejemplo.com"
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
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Confirmar Contraseña</label>
            <input
              type="password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="••••••••"
            />
          </div>
          {error && <div className="text-red-500 text-sm text-center bg-red-100 p-2 rounded-md">{error}</div>}
          <button
            type="submit"
            disabled={isLoading}
            className={`w-full py-3 text-white font-semibold rounded-md transition-all duration-200 ${
              isLoading ? "bg-gray-500" : "bg-black hover:bg-gray-800"
            }`}
          >
            {isLoading ? "Cargando..." : "Registrarse"}
          </button>
        </form>
        <p className="text-center text-sm text-gray-600 mt-4">
          ¿Ya tienes una cuenta?{' '}
          <a href="/login" className="text-black hover:text-gray-700 font-medium">
            Inicia sesión
          </a>
        </p>
      </div>
    </div>
  );
};

export default Register;
