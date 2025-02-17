import { useEffect } from "react";
import { Routes, Route, useNavigate } from "react-router-dom";
import Login from "./pages/Login";
import Home from "./pages/Home";
import Conferences from "./pages/Conferences";
import AdminConferences from "./pages/AdminConferences";
import EditConference from "./pages/EditConference";
import CreateConference from "./pages/CreateConference";
import AdminSpeakers from "./pages/AdminSpeakers";
import EditSpeaker from "./pages/EditSpeaker";
import Register from "./pages/Register";
import CreateSpeaker from "./pages/CreateSpeaker";

function App() {
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (window.location.pathname === "/") {
      if (token) {
        navigate("/Home");
      } else {
        navigate("/login");
      }
    }
  }, [navigate]);

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/Home" element={<Home />} />
      <Route path="/Conferences" element={<Conferences />} />
      <Route path="/Admin/Conferences" element={<AdminConferences />} />
      <Route path="/edit-conference/:id" element={<EditConference />} />
      <Route path="/create-conference" element={<CreateConference />} />
      <Route path="/Admin/Speakers" element={<AdminSpeakers />} />
      <Route path="/edit-speaker/:id" element={<EditSpeaker />} />
      <Route path="/Register" element={<Register />} />
      <Route path="/create-speaker" element={<CreateSpeaker />} />          
    </Routes>
  );
}

export default App;
