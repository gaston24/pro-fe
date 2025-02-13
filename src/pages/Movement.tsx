import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Plus, Trash2, Save, Camera } from "lucide-react";
import Navbar from "../components/Navbar";
import { API_URL } from "../config";
import BarcodeScannerComponent from "react-qr-barcode-scanner";

interface Entity {
  id: number;
  code: string;
  name: string;
  barCode: string;
}

interface ArticleItem {
  articleId: number;
  articleCode: string;
  locationCode: string;
  quantity: number;
  barCode?: string;
}

interface ComparedArticle {
  articleCode: string;
  docQuantity: number;
  pickQuantity: number;
  difference: number;
}

const MovementPage: React.FC = () => {
  const navigate = useNavigate();
  const { type, documentId } = useParams<{ type: string; documentId: string }>();

  const [articles, setArticles] = useState<Entity[]>([]);
  const [selectedArticle, setSelectedArticle] = useState<Entity | null>(null);
  const [locationCode, setLocationCode] = useState<string>("");
  const [quantity, setQuantity] = useState<number>(1);
  const [movementItems, setMovementItems] = useState<ArticleItem[]>([]);
  const [showScanner, setShowScanner] = useState<boolean>(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [comparisonData, setComparisonData] = useState<ComparedArticle[] | null>(null);

  // Fetch articles on mount
  useEffect(() => {
    const fetchArticles = async () => {
      try {
        const response = await fetch(`${API_URL}/articles`);
        const data = await response.json();
        setArticles(data);
      } catch (error) {
        console.error("Error fetching articles", error);
      }
    };
    fetchArticles();
  }, []);

  useEffect(() => {
    if (!type || !documentId) {
      console.error("Tipo de documento o ID no definido.");
      navigate("/error");
    }
  }, [type, documentId]);

  const handleAddItem = () => {
    if (selectedArticle && locationCode && quantity > 0) {
      setMovementItems([
        ...movementItems,
        {
          articleId: selectedArticle.id,
          articleCode: selectedArticle.code,
          locationCode,
          quantity,
        },
      ]);
      setSelectedArticle(null);
      setLocationCode("");
      setQuantity(1);
    }
  };

  const handleCreateMovement = async () => {
    if (!type || !documentId) {
      alert("Tipo de documento o ID no válido.");
      return;
    }
  
    setShowConfirmModal(false);
    setLoading(true);
  
    try {
      // Crear el picking
      const response = await fetch(`${API_URL}/picking/${documentId}/${type}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pickingData: movementItems }),
      });
  
      if (!response.ok) throw new Error("Error creando el picking");
  
      await new Promise((resolve) => setTimeout(resolve, 2000)); 
  
      const { data } = await response.json(); 
      const pickingId = data.id; 
  
      // Crear el movimiento utilizando el pickingId obtenido
      const createMovement = await fetch(`${API_URL}/movements/picking/${pickingId}`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });
  
      if (!createMovement.ok) throw new Error("Error creando el movimiento");
  
      // Cambiar el estado del documento a 5
      const changeStatusResponse = await fetch(
        `${API_URL}/documents/change-status/${documentId}/5`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
        }
      );
  
      if (!changeStatusResponse.ok) throw new Error("Error cambiando el estado del documento");
  
      // Obtener datos de comparación
      const matchResponse = await fetch(`${API_URL}/documents/match/${documentId}`);
      if (!matchResponse.ok) throw new Error("Error obteniendo datos de comparación");
  
      const matchData = await matchResponse.json();
      setComparisonData(matchData.articlesCompared); // Almacena los datos de comparación
  
    } catch (error) {
      console.error("Error al crear el movimiento:", error);
      alert("Error al crear el movimiento");
    } finally {
      setLoading(false);
    }
  };
  

  const handleScan = (barcode: string) => {
    const foundArticle = articles.find((article) => (article.code === barcode || article.barCode === barcode));
    if (foundArticle) {
      setSelectedArticle(foundArticle);
      setLocationCode("");
      setQuantity(1);
      setShowScanner(false);
    } else {
      alert("Artículo no encontrado: " + barcode);
      setShowScanner(false);
    }
  };

  return (
    <div className="min-h-screen w-screen bg-gray-100">
      <Navbar />
      <div className="flex justify-center items-center h-full mt-5">
        <div className="w-full max-w-5xl bg-white p-6 sm:p-8 rounded-xl shadow-lg">
          <h1 className="text-3xl font-bold text-gray-900 mb-4 text-center">
            {type === "ingreso" ? "Ingresar Mercadería" : "Egresar Mercadería"}
          </h1>

          <div className="grid md:grid-cols-3 gap-4">
            <select
              value={selectedArticle?.id || ""}
              onChange={(e) => {
                const article = articles.find((art) => art.id === Number(e.target.value));
                setSelectedArticle(article || null);
              }}
              className="p-2 border rounded"
            >
              <option value="">Seleccionar Código</option>
              {articles.map((article) => (
                <option key={article.id} value={article.id}>
                  {article.name} ({article.code})
                </option>
              ))}
            </select>

            <input
              type="text"
              value={locationCode}
              onChange={(e) => setLocationCode(e.target.value)}
              placeholder="Ubicación"
              className="p-2 border rounded"
            />
            <input
              type="number"
              value={quantity}
              onChange={(e) => setQuantity(Number(e.target.value))}
              min="1"
              className="p-2 border rounded"
              placeholder="Cantidad"
            />
          </div>

          <div className="mt-4 flex justify-end gap-2">
            <button
              onClick={handleAddItem}
              className="bg-blue-500 text-white p-2 rounded flex items-center"
            >
              <Plus className="mr-2" /> Agregar
            </button>
            <button
              onClick={() => setShowScanner(true)}
              className="bg-gray-700 text-white p-2 rounded flex items-center"
            >
              <Camera className="mr-2" /> Escanear
            </button>
          </div>

          {movementItems.length > 0 && (
            <div className="mt-6 border rounded">
              {movementItems.map((item, index) => (
                <div key={index} className="flex justify-between items-center p-3 border-b">
                  <div>
                    <span className="font-semibold">{item.articleCode}</span>
                    <span className="ml-4 text-gray-600">Ubicación: {item.locationCode}</span>
                    <span className="ml-4 text-gray-600">Cantidad: {item.quantity}</span>
                  </div>
                  <button
                    onClick={() => setMovementItems(movementItems.filter((_, i) => i !== index))}
                    className="text-red-500 hover:bg-red-50 p-2 rounded"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="mt-6 flex justify-end">
            <button
              onClick={() => setShowConfirmModal(true)}
              className="bg-green-500 text-white p-3 rounded flex items-center"
            >
              <Save className="mr-2" /> Confirmar Movimiento
            </button>
          </div>
        </div>
      </div>

      {/* Modal de Comparación */}
      {comparisonData && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-4xl w-full">
            <h3 className="text-lg font-semibold mb-4">Comparación de Documento y Picking</h3>
            <table className="w-full table-auto border-collapse border border-gray-300">
              <thead>
                <tr className="bg-gray-200">
                  <th className="border border-gray-300 p-2">Código Artículo</th>
                  <th className="border border-gray-300 p-2">Cantidad Documento</th>
                  <th className="border border-gray-300 p-2">Cantidad Picking</th>
                </tr>
              </thead>
              <tbody>
                {comparisonData.map((item) => (
                  <tr key={item.articleCode}>
                    <td className="border border-gray-300 p-2">{item.articleCode}</td>
                    <td className="border border-gray-300 p-2">{item.docQuantity}</td>
                    <td className="border border-gray-300 p-2">{item.pickQuantity}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="flex justify-end mt-4">
              <button
                onClick={() => navigate("/ListDocuments")}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg"
              >
                Aceptar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Barcode Scanner Modal */}
      {showScanner && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg">
            <h2 className="text-xl font-bold mb-4">Escanea el código de barras</h2>
            <BarcodeScannerComponent
              width={300}
              height={300}
              onUpdate={(err, result) => {
                if (result) handleScan(result.text);
              }}
            />
            <button
              onClick={() => setShowScanner(false)}
              className="mt-4 bg-red-500 text-white px-4 py-2 rounded"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      {showConfirmModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-lg w-full">
            <h3 className="text-lg font-semibold mb-4">Confirmar Movimiento</h3>
            <div className="border-b pb-4">
              <h4 className="font-medium mb-2">Resumen del movimiento:</h4>
              {movementItems.map((item, index) => (
                <div key={index} className="flex justify-between text-sm">
                  <span>{`${item.articleCode} - ${item.locationCode} x ${item.quantity}`}</span>
                </div>
              ))}
            </div>
            <div className="flex space-x-4 mt-4">
              <button
                onClick={() => setShowConfirmModal(false)}
                className="flex-1 py-2 border rounded-lg hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleCreateMovement}
                className="flex-1 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}

      {loading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="spinner-border animate-spin w-12 h-12 border-4 rounded-full text-blue-500"></div>
        </div>
      )}
    </div>
  );
};

export default MovementPage;
