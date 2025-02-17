import { useState, FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { API_BACK } from "../config";

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    if (!email.includes("@")) {
      setError("Ingrese un email válido");
      setIsLoading(false);
      return;
    }
  
    try {
      console.log("API_URL", API_BACK, email, password);
      const response = await fetch(`${API_BACK}/api/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.error === "Unauthorized" ? "Invalid credentials" : data?.error ?? "Error");
      }

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      navigate("/Home");
  
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };
  

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-200 px-6 w-screen">
      <div className="w-full max-w-md sm:max-w-lg md:max-w-xl lg:max-w-2xl bg-white p-8 sm:p-12 rounded-xl shadow-xl">
      <div className="flex items-center justify-center pb-10">
        <img 
          src="public/logo.png" 
          alt="Conference logo" 
          className="max-w-full max-h-40 object-contain"
        />
      </div>
      <h2 className="text-center text-3xl font-bold text-black mb-6">Login</h2>
        <form className="space-y-6" onSubmit={handleSubmit}>
          <div>
          <label className="block text-sm font-medium text-gray-800 mb-1">Email</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-3 border border-gray-400 rounded-md shadow-sm focus:ring-gray-600 focus:border-gray-600"
            placeholder="email@example.com"
          />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
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
              isLoading ? "bg-gray-500" : "bg-black hover:bg-gray-800"
            }`}
          >
            {isLoading ? "Loading..." : "Login"}
          </button>
        </form>
        <div className="mt-4 flex justify-center">
          <button
            onClick={() => navigate("/conferences")}
            className="w-full py-3 text-gray-800 font-semibold border border-gray-600 rounded-md transition-all duration-200 hover:bg-gray-200"
          >
            Enter as guest
          </button>
        </div>

        <p className="text-center text-sm text-gray-600 mt-4">
          You don't have an account yet?{' '}
          <a href="/registro" className="text-black hover:text-gray-700 font-medium">
            Register
          </a>
        </p>
      </div>
    </div>
  );
};

export default Login;
