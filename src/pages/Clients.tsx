import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import { API_URL } from "../config";

interface Client {
  id: number;
  name: string;
  email: string;
  phone: string;
}

const ClientList = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchClients = async () => {
      try {
        const response = await fetch(`${API_URL}/client`);
        if (!response.ok) throw new Error("Error al cargar clientes");

        const data = await response.json();
        setClients(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchClients();
  }, []);

  return (
    <div className="min-h-screen w-screen bg-gray-100">
      <Navbar />

      <div className="flex justify-center items-center h-full">
        <div className="w-full max-w-5xl bg-white p-6 sm:p-8 rounded-xl shadow-lg">
          <h1 className="text-3xl font-bold text-gray-900 mb-4 text-center">
            Lista de Clientes
          </h1>

          {loading && <p className="text-center text-gray-600">Cargando...</p>}
          {error && <p className="text-center text-red-500">{error}</p>}
          {!loading && !error && clients.length === 0 && (
            <p className="text-center text-gray-600">No hay clientes disponibles</p>
          )}

          <div className="hidden sm:block overflow-x-auto">
            <table className="w-full table-auto border-collapse border border-gray-200">
              <thead>
                <tr className="bg-black text-white">
                  <th className="border border-gray-300 px-4 py-2">ID</th>
                  <th className="border border-gray-300 px-4 py-2">Nombre</th>
                  <th className="border border-gray-300 px-4 py-2">Email</th>
                  <th className="border border-gray-300 px-4 py-2">Teléfono</th>
                </tr>
              </thead>
              <tbody>
                {clients.map((client) => (
                  <tr key={client.id} className="border-b hover:bg-gray-100">
                    <td className="border border-gray-300 px-4 py-2 text-center">{client.id}</td>
                    <td className="border border-gray-300 px-4 py-2">{client.name}</td>
                    <td className="border border-gray-300 px-4 py-2">{client.email}</td>
                    <td className="border border-gray-300 px-4 py-2">{client.phone}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="block sm:hidden">
            {clients.map((client) => (
              <div 
                key={client.id} 
                className="bg-white border border-gray-400 rounded-lg shadow-md p-4 mb-3"
              >
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold text-gray-900">{client.name}</h3>
                  <span className="text-gray-500 text-sm">ID: {client.id}</span>
                </div>
                <p className="text-sm text-gray-600 mt-1">
                  <span className="font-semibold text-green-600">Email:</span> {client.email}
                </p>
                <p className="text-sm text-gray-600 mt-1">
                  <span className="font-semibold text-green-600">Teléfono:</span> {client.phone}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClientList;
