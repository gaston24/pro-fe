import React, { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import { Eye, Trash2, Edit2, Plus } from "lucide-react";
import { API_URL } from "../config";

interface Location {
  id: number;
  locationCode: string;
}

const LocationList: React.FC = () => {
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
  const [newLocationCode, setNewLocationCode] = useState<string>("");
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [deleteLocationId, setDeleteLocationId] = useState<number | null>(null);

  // Fetch locations on mount
  useEffect(() => {
    const fetchLocations = async () => {
      try {
        const response = await fetch(`${API_URL}/locations`);
        if (!response.ok) throw new Error("Error al cargar ubicaciones");
        const data = await response.json();
        setLocations(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchLocations();
  }, []);

  const handleAddLocation = async () => {
    if (!newLocationCode.trim()) {
      alert("El código de ubicación no puede estar vacío");
      return;
    }

    try {
      const response = await fetch(`${API_URL}/locations`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ locationCode: newLocationCode.toUpperCase() }),
      });

      if (!response.ok) throw new Error("Error al crear la ubicación");

      const newLocation = await response.json();
      setLocations([...locations, newLocation]);
      setShowAddModal(false);
      setNewLocationCode("");
    } catch (error) {
      alert("Error al agregar la ubicación");
    }
  };

  const handleUpdateLocation = async () => {
    if (!selectedLocation) return;

    try {
      const response = await fetch(`${API_URL}/locations/${selectedLocation.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ locationCode: selectedLocation.locationCode.toUpperCase() }),
      });

      if (!response.ok) throw new Error("Error al actualizar la ubicación");

      setLocations((prevLocations) =>
        prevLocations.map((loc) =>
          loc.id === selectedLocation.id ? selectedLocation : loc
        )
      );
      setSelectedLocation(null);
    } catch (error) {
      alert("Error al actualizar la ubicación");
    }
  };

  const handleDeleteLocation = async () => {
    if (!deleteLocationId) return;

    try {
      const response = await fetch(`${API_URL}/locations/${deleteLocationId}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Error al eliminar la ubicación");

      setLocations((prevLocations) =>
        prevLocations.filter((location) => location.id !== deleteLocationId)
      );
      setDeleteLocationId(null);
    } catch (error) {
      alert("Error al eliminar la ubicación");
    }
  };

  return (
    <div className="min-h-screen w-screen bg-gray-100">
      <Navbar />
      <div className="flex justify-center items-center h-full mt-5">
        <div className="w-full max-w-5xl bg-white p-6 sm:p-8 rounded-xl shadow-lg">
          <h1 className="text-3xl font-bold text-gray-900 mb-4 text-center">Ubicaciones</h1>

          <div className="flex justify-between mb-6">
            <button
              onClick={() => setShowAddModal(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-md flex items-center"
            >
              <Plus className="mr-2" /> Agregar Ubicación
            </button>
          </div>

          {loading && <p className="text-center text-gray-600">Cargando...</p>}
          {error && <p className="text-center text-red-500">{error}</p>}
          {!loading && !error && locations.length === 0 && (
            <p className="text-center text-gray-600">No hay ubicaciones disponibles</p>
          )}

          <div className="hidden sm:block overflow-x-auto">
            <table className="w-full table-auto border-collapse border border-gray-200 text-gray-900">
              <thead>
                <tr className="bg-black text-white">
                  <th className="border border-gray-300 px-2 py-2">ID</th>
                  <th className="border border-gray-300 px-2 py-2">Código de Ubicación</th>
                  <th className="border border-gray-300 px-2 py-2">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {locations.map((location) => (
                  <tr key={location.id} className="border-b hover:bg-gray-100">
                    <td className="border border-gray-300 px-2 py-2 text-center">{location.id}</td>
                    <td className="border border-gray-300 px-2 py-2">{location.locationCode}</td>
                    <td className="border border-gray-300 px-2 py-2 flex justify-center gap-2">
                      <button
                        onClick={() => setSelectedLocation(location)}
                        className="text-gray-700 hover:text-black p-2 rounded-md transition-all"
                      >
                        <Edit2 className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => setDeleteLocationId(location.id)}
                        className="text-red-600 hover:text-red-800 p-2 rounded-md transition-all"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modal para agregar ubicación */}
      {showAddModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-lg shadow-xl text-center">
            <h2 className="text-lg font-bold mb-4">Agregar Nueva Ubicación</h2>
            <input
              type="text"
              value={newLocationCode}
              onChange={(e) => setNewLocationCode(e.target.value)}
              className="w-full p-2 border rounded-md mb-4"
              placeholder="Código de ubicación"
            />
            <div className="flex justify-center gap-4">
              <button
                onClick={handleAddLocation}
                className="bg-blue-600 text-white px-4 py-2 rounded-md"
              >
                Guardar
              </button>
              <button
                onClick={() => setShowAddModal(false)}
                className="bg-gray-400 text-white px-4 py-2 rounded-md"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal para editar ubicación */}
      {selectedLocation && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-lg shadow-xl text-center">
            <h2 className="text-lg font-bold mb-4">Editar Ubicación</h2>
            <input
              type="text"
              value={selectedLocation.locationCode}
              onChange={(e) =>
                setSelectedLocation({
                  ...selectedLocation,
                  locationCode: e.target.value,
                })
              }
              className="w-full p-2 border rounded-md mb-4"
              placeholder="Código de ubicación"
            />
            <div className="flex justify-center gap-4">
              <button
                onClick={handleUpdateLocation}
                className="bg-green-600 text-white px-4 py-2 rounded-md"
              >
                Guardar
              </button>
              <button
                onClick={() => setSelectedLocation(null)}
                className="bg-gray-400 text-white px-4 py-2 rounded-md"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de confirmación para eliminar ubicación */}
      {deleteLocationId && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-lg shadow-xl text-center">
            <p className="text-lg font-bold mb-4">
              ¿Estás seguro de eliminar esta ubicación?
            </p>
            <div className="flex justify-center gap-4">
              <button
                onClick={handleDeleteLocation}
                className="bg-red-600 text-white px-4 py-2 rounded-md"
              >
                Confirmar
              </button>
              <button
                onClick={() => setDeleteLocationId(null)}
                className="bg-gray-400 text-white px-4 py-2 rounded-md"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LocationList;
