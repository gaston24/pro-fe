import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import { API_BACK } from "../config";
import { FiEdit, FiTrash2 } from "react-icons/fi";
import { useNavigate } from "react-router-dom";

interface Speaker {
  id: number;
  name: string;
  email: string;
  phone: string;
}

const Speakers = () => {
  const [speakers, setSpeakers] = useState<Speaker[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const [deleteModal, setDeleteModal] = useState<{ open: boolean; id: number | null }>({ open: false, id: null, });

  useEffect(() => {
    const fetchSpeakers = async () => {
      try {
        const response = await fetch(`${API_BACK}/api/speakers/`);
        if (!response.ok) throw new Error("Error loading speakers");

        const data = await response.json();
        setSpeakers(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchSpeakers();
  }, []);

  const handleEdit = (id: number) => {
    navigate(`/edit-speaker/${id}`);
  };

  const handleDelete = (id: number) => {
    setDeleteModal({ open: true, id });
  };

  const confirmDeleteSpeaker = async () => {
    if (!deleteModal.id) return;
  
    try {
      const response = await fetch(`${API_BACK}/api/speakers/${deleteModal.id}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Error deleting speaker");
  
      setSpeakers(speakers.filter((speaker) => speaker.id !== deleteModal.id));
      setDeleteModal({ open: false, id: null });
    } catch (err: any) {
      alert("There was an error deleting the speaker.");
    }
  };

  return (
    <div className="min-h-screen w-screen bg-gray-100">
      <Navbar />

      {deleteModal.open && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg text-center w-96">
            <h2 className="text-2xl font-bold text-red-600">Eliminar Conferenciante</h2>
            <p className="text-gray-700 mt-2">¿Estás seguro de que quieres eliminar este conferenciante?</p>
            <div className="mt-4 flex justify-center gap-4">
              <button
                onClick={() => setDeleteModal({ open: false, id: null })}
                className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition"
              >
                Cancelar
              </button>
              <button
                onClick={confirmDeleteSpeaker}
                className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition"
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
      
      <div className="flex justify-center items-center h-full">
        <div className="w-full max-w-5xl bg-white p-6 sm:p-8 rounded-xl shadow-lg"
          >
          <h1 className="text-3xl font-bold text-gray-900 mb-4 text-center">
            Speakers List
          </h1>
          {loading && <p className="text-center text-gray-600">Loading...</p>}
          {error && <p className="text-center text-red-500">{error}</p>}
          {!loading && !error && speakers.length === 0 && (
            <p className="text-center text-gray-600">There are no speakers available</p>
          )}

          <div className="hidden sm:block overflow-x-auto">   
            <table className="w-full table-auto border-collapse border border-gray-200">
              <thead>
                <tr className="bg-black text-white">
                  <th className="border border-gray-300 px-4 py-2">Name</th>
                  <th className="border border-gray-300 px-4 py-2">Email</th>
                  <th className="border border-gray-300 px-4 py-2">Phone</th>
                  <th className="border border-gray-300 px-4 py-2">Action</th>
                </tr>
              </thead>
              <tbody>
                {speakers.map((speaker) => (
                  <tr key={speaker.id} className="border-b hover:bg-gray-100">
                    <td className="border border-gray-300 px-4 py-2 text-center">{speaker.name}</td>
                    <td className="border border-gray-300 px-4 py-2 text-center">{speaker.email}</td>
                    <td className="border border-gray-300 px-4 py-2 text-center">{speaker.phone}</td>
                    <td className="border border-gray-300 px-4 py-2 flex justify-center items-center space-x-3 min-h-[60px]">
                      <button
                        onClick={() => handleEdit(speaker.id)}
                        className="border border-blue-500 text-blue-500 hover:bg-blue-500 hover:text-white px-3 py-2 rounded-lg shadow-md transition transform hover:scale-105 flex items-center justify-center"
                        title="Edit"
                      >
                        <FiEdit size={18} />
                      </button>
                      <button
                        onClick={() => handleDelete(speaker.id)}
                        className="border border-red-500 text-red-500 hover:bg-red-500 hover:text-white px-3 py-2 rounded-lg shadow-md transition transform hover:scale-105 flex items-center justify-center"
                        title="Delete"
                      >
                        <FiTrash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="block sm:hidden">
            {speakers.map((speaker) => (
              <div key={speaker.id} className="bg-white shadow-md rounded-lg p-4 mb-3 border-l-4 border-blue-500">
                <h3 className="text-lg font-bold text-gray-900">{speaker.name}</h3>
                <p className="text-sm text-gray-600 mt-1">
                  <span className="font-semibold text-gray-700">📧 Email:</span> {speaker.email}
                </p>
                <p className="text-sm text-gray-600 mt-1">
                  <span className="font-semibold text-gray-700">📞 Teléfono:</span> {speaker.phone}
                </p>
                <div className="flex justify-end gap-2 mt-3">
                  <button
                    onClick={() => handleEdit(speaker.id)}
                    className="border border-blue-500 text-blue-500 hover:bg-blue-500 hover:text-white px-3 py-2 rounded-lg transition"
                    title="Editar"
                  >
                    <FiEdit size={18} />
                  </button>
                  <button
                    onClick={() => handleDelete(speaker.id)}
                    className="border border-red-500 text-red-500 hover:bg-red-500 hover:text-white px-3 py-2 rounded-lg transition"
                    title="Eliminar"
                  >
                    <FiTrash2 size={18} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Speakers;
