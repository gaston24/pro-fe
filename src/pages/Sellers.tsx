import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import { API_URL } from "../config";

interface Seller {
  id: number;
  name: string;
  user: {
    firstName: string;
    lastName: string;
    email: string;
  };
}

const SellerList = () => {
  const [sellers, setSellers] = useState<Seller[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSellers = async () => {
      try {
        const response = await fetch(`${API_URL}/sellers`);
        if (!response.ok) throw new Error("Error al cargar vendedores");

        const data = await response.json();
        setSellers(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchSellers();
  }, []);

  return (
    <div className="min-h-screen w-screen bg-gray-100">
      <Navbar />

      <div className="flex justify-center items-center h-full">
        <div className="w-full max-w-5xl bg-white p-6 sm:p-8 rounded-xl shadow-lg">
          <h1 className="text-3xl font-bold text-gray-900 mb-4 text-center">
            Lista de Vendedores
          </h1>

          {loading && <p className="text-center text-gray-600">Cargando...</p>}
          {error && <p className="text-center text-red-500">{error}</p>}
          {!loading && !error && sellers.length === 0 && (
            <p className="text-center text-gray-600">No hay vendedores disponibles</p>
          )}

          <div className="hidden sm:block overflow-x-auto">
            <table className="w-full table-auto border-collapse border border-gray-200">
              <thead>
                <tr className="bg-black text-white">
                  <th className="border border-gray-300 px-4 py-2">ID</th>
                  <th className="border border-gray-300 px-4 py-2">Nombre</th>
                  <th className="border border-gray-300 px-4 py-2">Nombre Completo</th>
                  <th className="border border-gray-300 px-4 py-2">Email</th>
                </tr>
              </thead>
              <tbody>
                {sellers.map((seller) => (
                  <tr key={seller.id} className="border-b hover:bg-gray-100">
                    <td className="border border-gray-300 px-4 py-2 text-center">{seller.id}</td>
                    <td className="border border-gray-300 px-4 py-2">{seller.name}</td>
                    <td className="border border-gray-300 px-4 py-2">
                      {seller.user.lastName} {seller.user.firstName}
                    </td>
                    <td className="border border-gray-300 px-4 py-2">{seller.user.email}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="block sm:hidden">
            {sellers.map((seller) => (
              <div 
                key={seller.id} 
                className="bg-white shadow-md rounded-lg p-4 mb-3 border-l-4 border-blue-500"
              >
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold text-gray-900">{seller.name}</h3>
                  <span className="text-gray-500 text-sm">ID: {seller.id}</span>
                </div>
                <p className="text-sm text-gray-600 mt-1">
                  <span className="font-semibold text-gray-700">Nombre Completo:</span> {seller.user.lastName} {seller.user.firstName}
                </p>
                <p className="text-sm text-gray-600 mt-1">
                  <span className="font-semibold text-gray-700">Email:</span> {seller.user.email}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SellerList;
