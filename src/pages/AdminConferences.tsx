import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import { API_BACK } from "../config";
import { FiEdit, FiTrash2 } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { FiPlus, FiDownload } from "react-icons/fi";

interface Conference {
  id: number;
  title: string;
  summary: string;
  date_time: string;
  link: string;
  capacity: number;
  speaker_name: string;
  speaker_id: number;
}

const Conferences = () => {
  const [conferences, setConferences] = useState<Conference[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedConference, setSelectedConference] = useState<Conference | null>(null);
  const [attendeeName, setAttendeeName] = useState<string>("");
  const [attendeeEmail, setAttendeeEmail] = useState<string>("");
  const [formError, setFormError] = useState<string>("")
  const [successMessage, setSuccessMessage] = useState<string>(""); 
  const navigate = useNavigate(); 
  const [deleteModal, setDeleteModal] = useState<{ open: boolean; id: number | null }>({ open: false, id: null, });

  const handleEdit = (id: number) => {
    navigate(`/edit-conference/${id}`);
  };
  
  const handleDelete = async (id: number) => {
    setDeleteModal({ open: true, id });
  };

  const exportAttendees = async (conferenceId: number) => {
    try {
        const response = await fetch(`${API_BACK}/api/attendees`);
      if (!response.ok) throw new Error("Error al obtener los asistentes");
  
      const data = await response.json();
      if (data.length === 0) {
        alert("No hay asistentes registrados en esta conferencia.");
        return;
      }
  
      let csvContent = "data:text/csv;charset=utf-8,";
      csvContent += "ID,Nombre,Email\n";
  
      data.forEach((attendee: { id: number; name: string; email: string }) => {
      csvContent += `${attendee.id},"${attendee.name}","${attendee.email}"\n`;
    });
  
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", `Asistentes_Conferencia_${conferenceId}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      alert("Hubo un error al exportar la lista de asistentes.");
    }
  };
   
  useEffect(() => {
    const fetchConferences = async () => {
      try {
        const speakersResponse = await fetch(`${API_BACK}/api/speakers/`);
        if (!speakersResponse.ok) throw new Error("Error al cargar los speakers");

        const speakersData = await speakersResponse.json();

        const conferencesResponse = await fetch(`${API_BACK}/api/conferences/`);
        if (!conferencesResponse.ok) throw new Error("Error al cargar conferencias");

        const conferencesData = await conferencesResponse.json();

        const conferencesWithSpeakers = conferencesData.map((conference: Conference) => {
          const speaker = speakersData.find((speaker: { id: number; name: string }) => speaker.id === conference.speaker_id);
          return { ...conference, speaker_name: speaker.name };
        });

        setConferences(conferencesWithSpeakers);
   
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
  
    fetchConferences();
  }, []);
  
  const registerForConference = async () => {
    if (!selectedConference) return;
  
    if (!attendeeName.trim() || !attendeeEmail.trim()) {
      setFormError("El nombre y el correo electrónico son obligatorios.");
      return;
    }
  
    try {
      setFormError("");
      const response = await fetch(`${API_BACK}/api/attendees-register-to-conference`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          conference_id: selectedConference.id,
          name: attendeeName,
          email: attendeeEmail,
        }),
      });
  
      if (!response.ok) {
        throw new Error("Error al registrarse en la conferencia.");
      }
  
      setSuccessMessage("¡Te has registrado exitosamente!");
      setFormError("");
  
      setConferences(prevConferences =>
        prevConferences.map(conf =>
          conf.id === selectedConference.id ? { ...conf, capacity: conf.capacity - 1 } : conf
        )
      );
  
      setSelectedConference(prev => (prev ? { ...prev, capacity: prev.capacity - 1 } : prev));
  
      setAttendeeName("");
      setAttendeeEmail("");
  
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (error) {
      console.error(error);
      setFormError("Hubo un problema al registrarse.");
    }
  };

  const confirmDeleteConference = async () => {
    if (!deleteModal.id) return;
  
    try {
      const response = await fetch(`${API_BACK}/api/conferences/${deleteModal.id}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Error al eliminar la conferencia");
  
      setConferences(conferences.filter((conference) => conference.id !== deleteModal.id));
      setDeleteModal({ open: false, id: null });
    } catch (err: any) {
      alert("Hubo un error al eliminar la conferencia.");
    }
  };

  return (
    <div className="min-h-screen w-screen bg-gray-100">
      <Navbar />

      <div className="flex justify-center items-center h-full">
        {deleteModal.open && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
            <div className="bg-white p-6 rounded-lg shadow-lg text-center w-96">
              <h2 className="text-2xl font-bold text-red-600">Eliminar Conferencia</h2>
              <p className="text-gray-700 mt-2">¿Estás seguro de que quieres eliminar esta conferencia?</p>
              <div className="mt-4 flex justify-center gap-4">
                <button
                  onClick={() => setDeleteModal({ open: false, id: null })}
                  className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition"
                >
                  Cancelar
                </button>
                <button
                  onClick={confirmDeleteConference}
                  className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition"
                >
                  Eliminar
                </button>
              </div>
            </div>
          </div>
        )}
        <div className="w-full max-w-5xl bg-white p-6 sm:p-8 rounded-xl shadow-lg">
        <div className="flex justify-end gap-2 mb-4">
  
        <button
            onClick={() => navigate("/create-conference")}
            className="flex items-center gap-2 bg-green-500 text-white px-3 py-2 rounded-md text-sm hover:bg-green-600 transition"
        >
            <FiPlus size={16} />
            Nueva Conferencia
        </button>
        </div>

            <h1 className="text-3xl font-bold text-gray-900 mb-4 text-center">
            Lista de Conferencias
            </h1>
          {loading && <p className="text-center text-gray-600">Cargando...</p>}
          {error && <p className="text-center text-red-500">{error}</p>}
          {!loading && !error && conferences.length === 0 && (
            <p className="text-center text-gray-600">No hay conferencias disponibles</p>
          )}

          <div className="hidden sm:block overflow-x-auto">
            <table className="w-full table-auto border-collapse border border-gray-200">
              <thead>
              <tr className="bg-black text-white">
                <th className="border border-gray-300 px-4 py-2">Título</th>
                <th className="border border-gray-300 px-4 py-2">Resumen</th>
                <th className="border border-gray-300 px-4 py-2">Fecha y Hora</th>
                <th className="border border-gray-300 px-4 py-2">Cupos Disponibles</th>
                <th className="border border-gray-300 px-4 py-2">Link</th>
                <th className="border border-gray-300 px-4 py-2">Speaker</th>
                <th className="border border-gray-300 px-4 py-2">Acción</th>
              </tr>
            </thead>
            <tbody>
            {conferences.map((conference) => (
                <tr key={conference.id} className="border-b hover:bg-gray-100">
                  <td className="border border-gray-300 px-4 py-2">{conference.title}</td>
                  <td className="border border-gray-300 px-4 py-2">{conference.summary}</td>
                  <td className="border border-gray-300 px-4 py-2 text-center">
                    {new Date(conference.date_time).toLocaleString()}
                  </td>
                  <td className="border border-gray-300 px-4 py-2 text-center">{conference.capacity}</td>
                  
                  <td className="border border-gray-300 px-4 py-2 text-center">
                  <a 
                    href={conference.link} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="text-blue-600 underline block text-ellipsis overflow-hidden whitespace-nowrap max-w-[120px]"
                    title={conference.link}
                  >
                    {conference.link}
                  </a>
                </td>
                  <td className="border border-gray-300 px-4 py-2 text-center">
                    {conference.speaker_name}
                  </td>

                  <td className="border border-gray-300 px-4 py-2 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => exportAttendees(conference.id)}
                        className="border border-green-500 text-green-500 hover:bg-green-500 hover:text-white p-2 rounded-lg transition-colors"
                        title="Listar Asistentes"
                      >
                        <FiDownload size={18} />
                      </button>
                      <button
                        onClick={() => handleEdit(conference.id)}
                        className="border border-blue-500 text-blue-500 hover:bg-blue-500 hover:text-white p-2 rounded-lg transition-colors"
                        title="Editar"
                      >
                        <FiEdit size={18} />
                      </button>
                      <button
                        onClick={() => handleDelete(conference.id)}
                        className="border border-red-500 text-red-500 hover:bg-red-500 hover:text-white p-2 rounded-lg transition-colors"
                        title="Eliminar"
                      >
                        <FiTrash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
            </table>
          </div>
          <div className="block sm:hidden">
            {conferences.map((conference) => (
              <div key={conference.id} className="bg-white shadow-md rounded-lg p-4 mb-3 border-l-4 border-blue-500">
                <h3 className="text-lg font-bold text-gray-900">{conference.title}</h3>
                <p className="text-sm text-gray-600 mt-1">{conference.summary}</p>
                <p className="text-sm text-gray-600 mt-1">
                  <span className="font-semibold text-gray-700">Fecha:</span> {new Date(conference.date_time).toLocaleString()}
                </p>
                <p className="text-sm text-gray-600 mt-1">
                  <span className="font-semibold text-gray-700">Cupos Disponibles:</span> {conference.capacity}
                </p>
                <a href={conference.link} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">
                  Ver Conferencia
                </a>
              </div>
            ))}
          </div>
        </div>
      </div>
      {selectedConference && (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
    <div className="bg-white rounded-lg shadow-lg w-full max-w-lg p-6">
      <h2 className="text-2xl font-bold text-gray-900">{selectedConference.title}</h2>
      <p className="text-gray-700 mt-2">{selectedConference.summary}</p>
      <p className="text-gray-600 mt-2">
        <strong>Fecha y Hora:</strong> {new Date(selectedConference.date_time).toLocaleString()}
      </p>
      <p className="text-gray-600 mt-2">
        <strong>Cupos Disponibles:</strong> {selectedConference.capacity}
      </p>
      <div className="mt-4">
        <label className="block text-sm font-medium text-gray-700">Nombre</label>
        <input
          type="text"
          value={attendeeName}
          onChange={(e) => setAttendeeName(e.target.value)}
          className="w-full border border-gray-300 p-2 rounded mt-1"
          placeholder="Ingresa tu nombre"
        />

        <label className="block text-sm font-medium text-gray-700 mt-2">Correo Electrónico</label>
        <input
          type="email"
          value={attendeeEmail}
          onChange={(e) => setAttendeeEmail(e.target.value)}
          className="w-full border border-gray-300 p-2 rounded mt-1"
          placeholder="Ingresa tu email"
          required
        />
        {formError && <p className="text-red-500 text-sm mt-2">{formError}</p>}
        {successMessage && <p className="text-green-500 text-sm mt-2">{successMessage}</p>}
      </div>

      <div className="flex justify-between items-center mt-4">
        <a
          href={selectedConference.link}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 underline"
        >
          Ir a la Conferencia
        </a>
        <button
          onClick={registerForConference}
          className={`px-4 py-2 rounded ${
            selectedConference.capacity > 0 && attendeeName.trim() && attendeeEmail.trim()
              ? "bg-green-500 text-white"
              : "bg-gray-400 text-gray-700 cursor-not-allowed"
          }`}
          disabled={
            selectedConference.capacity === 0 ||
            !attendeeName.trim() ||
            !attendeeEmail.trim() ||
            !!successMessage
          }
        >
          Registrarse como Asistente
        </button>
        <button
          onClick={() => setSelectedConference(null)}
          className="bg-red-500 text-white px-4 py-2 rounded"
        >
          Cerrar
        </button>
      </div>
    </div>
  </div>
)}
    </div>
  );
};

export default Conferences;

