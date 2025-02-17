import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import { API_BACK } from "../config";

interface Conference {
  id: number;
  title: string;
  summary: string;
  date_time: string;
  link: string;
  capacity: number;
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

  useEffect(() => {
    const fetchConferences = async () => {
      try {
        const response = await fetch(`${API_BACK}/api/conferences/`);
        if (!response.ok) throw new Error("Error al cargar conferencias");
  
        const data = await response.json();
        setConferences(data);
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
      const response = await fetch(`${API_BACK}/api/attendees`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: attendeeName,
          email: attendeeEmail,
        }),
      });
      const data = await response.json();
      console.log(data.id);

      if (!response.ok) {
        throw new Error("Error al registrarse en la conferencia.");
      }
      console.log(selectedConference.id,'scid');
      const registerToConferenceResponse = await fetch(`${API_BACK}/api/attendees/${data.id}/register-to-conference`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          conference_id: selectedConference.id,
        }),
      });
      console.log(registerToConferenceResponse, 'rfc');
      if (!registerToConferenceResponse.ok) {
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

  return (
    <div className="min-h-screen w-screen bg-gray-100">
      <Navbar />

      <div className="flex justify-center items-center h-full">
        <div className="w-full max-w-5xl bg-white p-6 sm:p-8 rounded-xl shadow-lg">
        <h1 className="text-3xl font-bold text-gray-900 mb-4 text-center">
          Lista de Conferencias
        </h1>

          {loading && <p className="text-center text-gray-600">Cargando...</p>}
          {error && <p className="text-center text-red-500">{error}</p>}
          {!loading && !error && conferences.length === 0 && (
            <p className="text-center text-gray-600">No hay conferencias disponibles</p>
          )}

          <div className="hidden sm:block overflow-x-auto">
          <table className="w-full table-auto border border-gray-300 rounded-lg shadow-md">
            <thead>
            <tr className="bg-gray-900 text-white text-lg">
                <th className="border border-gray-300 px-4 py-2">Título</th>
                <th className="border border-gray-300 px-4 py-2">Resumen</th>
                <th className="border border-gray-300 px-4 py-2">Fecha y Hora</th>
                <th className="border border-gray-300 px-4 py-2">Cupos Disponibles</th>
                <th className="border border-gray-300 px-4 py-2">Enlace</th>
              </tr>
            </thead>
            <tbody>
              {conferences.map((conference) => (
                <tr key={conference.id} className="border-b hover:bg-gray-200 transition">
                  <td className="border border-gray-300 px-4 py-2">{conference.title}</td>
                  <td className="border border-gray-300 px-4 py-2">{conference.summary}</td>
                  <td className="border border-gray-300 px-4 py-2 text-center">{new Date(conference.date_time).toLocaleString()}</td>
                  <td className="border border-gray-300 px-4 py-2 text-center">{conference.capacity}</td>
                  <td className="border border-gray-300 px-4 py-2">
                  <button
                    onClick={() => setSelectedConference(conference)}
                    className="text-blue-600 hover:text-blue-800 text-xs underline transition"
                  >
                    Ver Detalles
                  </button>
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
                  <span className="font-semibold text-gray-700">📅 Fecha:</span> {new Date(conference.date_time).toLocaleString()}
                </p>
                <p className="text-sm text-gray-600 mt-1">
                  <span className="font-semibold text-gray-700">🎟 Cupos Disponibles:</span> {conference.capacity}
                </p>

                <div className="flex justify-end mt-3">
                  <button
                    onClick={() => setSelectedConference(conference)}
                    className="border border-blue-500 text-blue-500 hover:bg-blue-500 hover:text-white px-4 py-2 rounded-lg transition"
                  >
                    Ver Detalles
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      {selectedConference && (
  <div className="fixed inset-0 bg-gray-900 bg-opacity-40 flex justify-center items-center z-50">
    <div className="bg-white rounded-lg shadow-lg w-full max-w-lg p-6">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-900">{selectedConference.title}</h2>
        <p className="text-gray-600 mt-2">{selectedConference.summary}</p>
        <div className="mt-4 flex justify-center space-x-4">
          <p className="text-gray-700"><strong>📅 Fecha:</strong> {new Date(selectedConference.date_time).toLocaleString()}</p>
          <p className="text-gray-700"><strong>🎟 Cupos:</strong> {selectedConference.capacity}</p>
        </div>
      </div>
      <div className="mt-4">
        <label className="block text-sm font-medium text-gray-700">Nombre</label>
        <input
          type="text"
          value={attendeeName}
          onChange={(e) => setAttendeeName(e.target.value)}
          className="w-full border border-gray-300 p-3 rounded-lg mt-2 focus:ring-2 focus:ring-blue-500 outline-none"
          placeholder="👤 Ingresa tu nombre"
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

      <div className="mt-4 flex flex-col sm:flex-row sm:justify-between items-center gap-3">
        <a
          href={selectedConference.link}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 underline w-full sm:w-auto text-center"
        >
          Ir a la Conferencia
        </a>
        
        <button
          onClick={registerForConference}
          className={`w-full sm:w-auto px-4 py-2 rounded text-center ${
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
          className="w-full sm:w-auto bg-red-500 text-white px-4 py-2 rounded text-center"
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

