import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { API_BACK } from "../config";

const EditConference = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [conference, setConference] = useState({ 
    title: "", 
    summary: "", 
    date_time: "", 
    link: "", 
    capacity: 0, 
    speaker_id: "" 
  });
  const [speakers, setSpeakers] = useState<{ id: string; name: string }[]>([]);

  useEffect(() => {
    const fetchConference = async () => {
      const response = await fetch(`${API_BACK}/api/conferences/${id}`);
      if (!response.ok) return;
      const data = await response.json();
      setConference(data);
    };
    fetchConference();
  }, [id]);

  useEffect(() => {
    const fetchSpeakers = async () => {
      try {
        const response = await fetch(`${API_BACK}/api/speakers/`);
        if (!response.ok) throw new Error("Error while fetching speakers");
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
    const response = await fetch(`${API_BACK}/api/conferences/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(conference),
    });
    if (response.ok) {
      navigate("/admin/conferences");
    } else {
      alert("Error while updating conference");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="fixed inset-0 flex items-center justify-center">
        <div className="w-full max-w-2xl mx-4 bg-white rounded-lg shadow-lg p-6 overflow-y-auto max-h-[90vh]">
        <h1 className="text-3xl font-bold text-center text-gray-900 mb-6">Edit Conference</h1>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
            <label className="block text-lg font-medium text-gray-700">Title</label>
            <input
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-lg"
              value={conference.title}
              onChange={(e) => setConference({ ...conference, title: e.target.value })}
              required
            />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Summary</label>
              <textarea
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                value={conference.summary}
                onChange={(e) => setConference({ ...conference, summary: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Date</label>
              <input
                type="datetime-local"
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                value={conference.date_time}
                onChange={(e) => setConference({ ...conference, date_time: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Available Places</label>
              <input
                type="number"
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                value={conference.capacity}
                onChange={(e) => setConference({ ...conference, capacity: Number(e.target.value) })}
                required
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Link to Conference</label>
              <input
                type="url"
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                value={conference.link}
                onChange={(e) => setConference({ ...conference, link: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Speaker</label>
              <select
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                value={conference.speaker_id}
                onChange={(e) => setConference({ ...conference, speaker_id: e.target.value })}
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
                className="w-full bg-gray-600 text-white py-3 px-4 rounded-lg hover:bg-gray-700 
                focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 
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
};

export default EditConference;