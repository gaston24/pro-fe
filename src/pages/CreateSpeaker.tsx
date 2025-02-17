import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { API_BACK } from "../config";

const CreateSpeaker = () => {
  const navigate = useNavigate();
  const [speaker, setSpeaker] = useState({ name: "", email: "", phone: "" });
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  useEffect(() => {
    const fetchSpeakers = async () => {
      try {
        const response = await fetch(`${API_BACK}/api/speakers/`);
        if (!response.ok) throw new Error("Error al cargar los speakers");

        const data = await response.json();
        setSpeakers(data);
      } catch (error) {
        console.error(error);
      }
    };

    fetchSpeakers();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
  
    try {
      const response = await fetch(`${API_BACK}/api/speakers/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: speaker.name,
          email: speaker.email,
          phone: speaker.phone,
        }),
      });
  
      if (!response.ok) throw new Error("Error while creating speaker");
  
      setShowSuccessModal(true);
    } catch (error) {
      alert("Error while creating speaker");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      {showSuccessModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg text-center w-96">
            <h2 className="text-2xl font-bold text-green-600">Speaker Created</h2>
            <p className="text-gray-700 mt-2">Your Speaker has been created</p>
            <button
              onClick={() => navigate("/admin/speakers")}
              className="mt-4 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition"
            >
              Go to Speakers
            </button>
          </div>
        </div>
      )}
  
      <div className="fixed inset-0 flex items-center justify-center">
        <div className="w-full max-w-2xl mx-4 bg-white rounded-lg shadow-lg p-6 overflow-y-auto max-h-[90vh]">
          <h1 className="text-3xl font-bold text-center text-gray-900 mb-6">Create Speaker</h1>
  
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
              <label className="block text-sm font-medium text-gray-700">Email</label>
                <input
                  type="email"
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                  value={speaker.email}
                  onChange={(e) => setSpeaker({ ...speaker, email: e.target.value })}
                  required
                />
            </div>
  
            <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Phone</label>
            <input
              type="tel"
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
              value={speaker.phone}
              onChange={(e) => setSpeaker({ ...speaker, phone: e.target.value })}
              required
            />
            </div>
        
            <div className="flex justify-end mt-6">
              <button
                type="submit"
                className="w-full bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 
                focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 
                transition-transform transform hover:scale-105 text-lg font-semibold"
              >
                Create Speaker
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateSpeaker;
