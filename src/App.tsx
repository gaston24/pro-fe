import { useEffect } from "react";
import { Routes, Route, useNavigate } from "react-router-dom";
import Login from "./pages/Login";
import Home from "./pages/Home";
import Clients from "./pages/Clients";
import Articles from "./pages/Articles";
import Orders from "./pages/Orders";
import Sellers from "./pages/Sellers";
import ArticleNew from "./pages/ArticleNew";
import NewOrder from "./pages/NewOrder";
import ListDocuments from "./pages/Documents";
import NewDocument from "./pages/NewDocument";
import Billing from "./pages/Billing";
import Movement from "./pages/Movement";
import Locations from "./pages/Locations";
import MasterArticles from "./pages/MasterArticles";
import Stock from "./pages/Stock";

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
      <Route path="/Sellers" element={<Sellers />} />
      <Route path="/Clients" element={<Clients />} />
      <Route path="/Articles" element={<Articles />} />
      <Route path="/ArticleNew" element={<ArticleNew />} />
      <Route path="/Orders" element={<Orders />} />
      <Route path="/NewOrder" element={<NewOrder />} />
      <Route path="/ListDocuments" element={<ListDocuments />} />
      <Route path="/NewDocument/:type" element={<NewDocument />} />
      <Route path="/Billing" element={<Billing />} />
      <Route path="/movement/:type/:documentId" element={<Movement />} />
      <Route path="/Locations" element={<Locations />} />
      <Route path="/MasterArticles" element={<MasterArticles />} />
      <Route path="/Stock" element={<Stock />} />
    </Routes>
  );
}

export default App;
