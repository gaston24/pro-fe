import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { API_BACK } from "../config";

const CreateSpeaker = () => {
  const navigate = useNavigate();
  const [speaker, setSpeaker] = useState({ title: "", summary: "", date_time: "", link: "", capacity: 0, speaker_id: ""});
  const [speakers, setSpeakers] = useState<{ id: string; name: string }[]>([]);
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
        body: JSON.stringify(speaker),
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
              <label className="block text-lg font-medium text-gray-700">Title</label>
              <input
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-lg"
                value={speaker.title}
                onChange={(e) => setSpeaker({ ...speaker, title: e.target.value })}
                required
              />
            </div>
  
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Summary</label>
              <textarea
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                value={speaker.summary}
                onChange={(e) => setSpeaker({ ...speaker, summary: e.target.value })}
                required
              />
            </div>
  
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Date</label>
              <input
                type="datetime-local"
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                value={speaker.date_time}
                onChange={(e) => setSpeaker({ ...speaker, date_time: e.target.value })}
                required
              />
            </div>
  
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Available Places</label>
              <input
                type="number"
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                value={speaker.capacity}
                onChange={(e) => setSpeaker({ ...speaker, capacity: Number(e.target.value) })}
                required
              />
            </div>
  
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Link to Speaker</label>
              <input
                type="url"
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                value={speaker.link}
                onChange={(e) => setSpeaker({ ...speaker, link: e.target.value })}
                required
              />
            </div>
  
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Speaker</label>
              <select
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                value={speaker.speaker_id}
                onChange={(e) => setSpeaker({ ...speaker, speaker_id: e.target.value })}
                required
              >
                <option value="">Choose Speaker</option>
                {speakers.map((speaker) => (
                  <option key={speaker.id} value={speaker.id}>
                    {speaker.name}
                  </option>
                ))}
              </select>
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
