import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { API_BACK } from "../config";

const EditSpeaker = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [speaker, setSpeaker] = useState({ name: "", email: "", phone: "" });

  useEffect(() => {
    const fetchSpeaker = async () => {
      const response = await fetch(`${API_BACK}/api/speakers/${id}`);
      if (!response.ok) return;
      const data = await response.json();
      setSpeaker(data);
    };
    fetchSpeaker();
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const response = await fetch(`${API_BACK}/api/speakers/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(speaker),
    });
    if (response.ok) {
      navigate("/admin/speakers");
    } else {
      alert("Error al actualizar el conferenciante");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-6">
      <div className="fixed inset-0 flex items-center justify-center">
        <div className="w-full max-w-2xl mx-4 bg-white rounded-lg shadow-lg p-6 overflow-y-auto max-h-[90vh]">
          <h1 className="text-3xl font-bold text-center text-gray-900 mb-6">Edit Speaker</h1>
  
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="block text-lg font-medium text-gray-700">Name</label>
              <input
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-lg"
                value={speaker.name}
                onChange={(e) => setSpeaker({ ...speaker, name: e.target.value })}
                required
              />
            </div>
  
            <div className="space-y-2">
              <label className="block text-lg font-medium text-gray-700">Email</label>
              <input
                type="email"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-lg"
                value={speaker.email}
                onChange={(e) => setSpeaker({ ...speaker, email: e.target.value })}
                required
              />
            </div>
  
            <div className="space-y-2">
              <label className="block text-lg font-medium text-gray-700">Phone</label>
              <input
                type="text"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-lg"
                value={speaker.phone}
                onChange={(e) => setSpeaker({ ...speaker, phone: e.target.value })}
                required
              />
            </div>
  
            <div className="flex justify-end mt-6">
              <button
                type="submit"
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 
                focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 
                transition-transform transform hover:scale-105 text-lg font-semibold"
              >
                Save Changes
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}  

export default EditSpeaker;
