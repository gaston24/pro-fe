import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Trash2, Save, Camera, Check } from 'lucide-react';
import Navbar from '../components/Navbar';
import { API_URL } from '../config';
import BarcodeScannerComponent from 'react-qr-barcode-scanner';

interface Entity {
  id: number;
  code: string;
  name: string;
  barCode: string;
}

interface ArticleItem {
  articleId: number;
  articleCode: string;
  articleName: string;
  quantity: number;
  price?: number;
  barCode?: string;
}

const NewInvoice: React.FC = () => {
  const navigate = useNavigate();

  // State management
  const [clients, setClients] = useState<Entity[]>([]);
  const [articles, setArticles] = useState<Entity[]>([]);
  const [selectedClient, setSelectedClient] = useState<Entity | null>(null);
  const [documentItems, setDocumentItems] = useState<ArticleItem[]>([]);
  const [comments, setComments] = useState<string>('');
  const [selectedArticle, setSelectedArticle] = useState<Entity | null>(null);
  const [articleQuantity, setArticleQuantity] = useState<number>(1);
  const [showScanner, setShowScanner] = useState<boolean>(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showFinalModal, setShowFinalModal] = useState(false);
  const [invoiceNumber, setInvoiceNumber] = useState<string | null>(null);

  // Fetch clients and articles
  useEffect(() => {
    const fetchClients = async () => {
      try {
        const response = await fetch(`${API_URL}/client`);
        const data = await response.json();
        setClients(data);
  
        // Preseleccionar el cliente con ID 1 (Consumidor Final)
        const defaultClient = data.find((cli: Entity) => cli.id === 1);
        setSelectedClient(defaultClient || null);
      } catch (error) {
        console.error("Error fetching clients", error);
      }
    };

    const fetchArticles = async () => {
      try {
        const response = await fetch(`${API_URL}/articles`);
        const data = await response.json();
        setArticles(data);
      } catch (error) {
        console.error('Error fetching articles', error);
      }
    };

    fetchClients();
    fetchArticles();
  }, []);

  // Add article to document
  const handleAddArticle = () => {
    if (selectedArticle && articleQuantity > 0) {
      const existingItemIndex = documentItems.findIndex(
        (item) => item.articleId === selectedArticle.id
      );

      if (existingItemIndex !== -1) {
        const updatedItems = [...documentItems];
        updatedItems[existingItemIndex].quantity += articleQuantity;
        setDocumentItems(updatedItems);
      } else {
        setDocumentItems([
          ...documentItems,
          {
            articleId: selectedArticle.id,
            articleCode: selectedArticle.code,
            articleName: selectedArticle.name,
            quantity: articleQuantity,
            price: selectedArticle.price,
          },
        ]);
      }

      setSelectedArticle(null);
      setArticleQuantity(1);
    }
  };

  // Handle barcode scanning
  const handleScan = (barcode: string) => {
    const foundArticle = articles.find((article) => (article.code === barcode || article.barCode === barcode));
    if (foundArticle) {

      setSelectedArticle(foundArticle);
      setArticleQuantity(1);
      handleAddArticle();
      setShowScanner(false);

    } else {
      alert('Artículo no encontrado' + barcode);
      setShowScanner(false);
    }
  };

  // crear factura
  const handleCreateInvoice = async () => {
    setShowConfirmModal(false);
    setLoading(true);
  
    try {
      // Step 1: Enviar request a /picking/null/pedido
      const pickingResponse = await fetch(`${API_URL}/picking/null/pedido`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pickingData: documentItems.map((item) => ({
            articleCode: item.articleCode,
            locationCode: "A1", 
            quantity: item.quantity,
            price: item.price || 0, 
            cost: item.price || 0, 
          })),
        }),
      });
  
      if (!pickingResponse.ok) throw new Error("Error al crear el picking");
  
      const pickingData = await pickingResponse.json();
      const pickingId = pickingData?.data?.id;
  
      if (!pickingId) {
        throw new Error("El ID del picking es inválido o no fue devuelto");
      }
  
      await new Promise((resolve) => setTimeout(resolve, 2000));
  
      // Step 2: Enviar request a /movements/picking-document/{idPicking}
      const movementResponse = await fetch(`${API_URL}/movements/picking-document/${pickingId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          headerData: {
            receiptNumber: 3, 
            issueDate: new Date().toISOString().split("T")[0], 
            thirdPartyCode: selectedClient?.id.toString(), 
            compType: "factura", 
            bookId: 3, 
            statusId: 5,
            comments: comments,
            controlUser: JSON.parse(localStorage.getItem("user") || "{}").username || "unknown",
          },
        }),
      });
  
      if (!movementResponse.ok) throw new Error("Error creando el movimiento");
  
      const movementData = await movementResponse.json();
      const receiptNumber = movementData.data.header.compNumber; 
  
      setInvoiceNumber(receiptNumber); 
      setShowFinalModal(true); 
  
    } catch (error) {
      console.error("Error al crear la factura:", error);
    } finally {
      setLoading(false);
    }
  };
  

  return (
    <div className="min-h-screen w-screen bg-gray-100">
      <Navbar />
      <div className="flex justify-center items-center h-full mt-5">
        <div className="w-full max-w-5xl bg-white p-6 sm:p-8 rounded-xl shadow-lg">
          <h1 className="text-3xl font-bold text-gray-900 mb-4 text-center">Nueva Factura</h1>
  
          <div className="grid md:grid-cols-2 gap-6">
            {/* Client Selection */}
            <div>
              <label className="block mb-2 font-semibold">Cliente</label>
              <select
                value={selectedClient?.id || ''}
                onChange={(e) => {
                  const client = clients.find((cli) => cli.id === Number(e.target.value));
                  setSelectedClient(client || null);
                }}
                className="w-full p-2 border rounded"
              >
                <option value="">Seleccionar Cliente</option>
                {clients.map((client) => (
                  <option key={client.id} value={client.id}>
                    {client.name}
                  </option>
                ))}
              </select>
            </div>
  
            {/* Comments */}
            <div>
              <label className="block mb-2 font-semibold">Comentarios</label>
              <textarea
                value={comments}
                onChange={(e) => setComments(e.target.value)}
                className="w-full p-2 border rounded h-24"
                placeholder="Comentarios adicionales..."
              />
            </div>
          </div>
  
          {/* Article Selection */}
          <div className="mt-6">
            <h2 className="text-xl font-semibold mb-4">Artículos</h2>
            <div className="grid md:grid-cols-3 gap-4">
              <select
                value={selectedArticle?.id || ''}
                onChange={(e) => {
                  const article = articles.find((art) => art.id === Number(e.target.value));
                  setSelectedArticle(article || null);
                }}
                className="w-full p-2 border rounded"
              >
                <option value="">Seleccionar Artículo</option>
                {articles.map((article) => (
                  <option key={article.id} value={article.id}>
                    {article.name}
                  </option>
                ))}
              </select>
  
              <input
                type="number"
                value={articleQuantity}
                onChange={(e) => setArticleQuantity(Number(e.target.value))}
                min="1"
                className="w-full p-2 border rounded"
                placeholder="Cantidad"
              />
  
              <div className="flex gap-2">
                <button
                  onClick={handleAddArticle}
                  disabled={!selectedArticle}
                  className="bg-blue-500 text-white p-2 rounded flex items-center justify-center disabled:opacity-50"
                >
                  <Plus className="mr-2" /> Agregar
                </button>
  
                <button
                  onClick={() => setShowScanner(true)}
                  className="bg-gray-700 text-white p-2 rounded flex items-center justify-center"
                >
                  <Camera className="mr-2" /> Escanear
                </button>
              </div>
            </div>
  
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
  
            {/* Article List */}
            {documentItems.length > 0 && (
              <div className="mt-4 border rounded">
                {documentItems.map((item) => (
                  <div key={item.articleId} className="flex justify-between items-center p-3 border-b">
                    <div>
                      <span className="font-semibold">{item.articleName}</span>
                      <span className="ml-4 text-gray-600">Cantidad: {item.quantity}</span>
                    </div>
                    <div className="flex items-center">
                      <span className="text-gray-800 mr-4">$ {item.price?.toFixed(2)}</span>
                      <button
                        onClick={() =>
                          setDocumentItems(documentItems.filter((doc) => doc.articleId !== item.articleId))
                        }
                        className="text-red-500 hover:bg-red-50 p-2 rounded"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
  
          {/* Create Button */}
          <div className="mt-6 flex justify-end">
            <button
              onClick={() => setShowConfirmModal(true)}
              className="bg-green-500 text-white p-3 rounded flex items-center"
            >
              <Save className="mr-2" /> Crear Factura
            </button>
          </div>
        </div>
      </div>
  
      {/* Spinner */}
      {loading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="flex flex-col items-center">
            <div className="spinner-border animate-spin inline-block w-12 h-12 border-4 rounded-full text-blue-500"></div>
            <span className="mt-4 text-white font-semibold">Procesando...</span>
          </div>
        </div>
      )}
  
      {/* Confirm Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-lg w-full">
            <h3 className="text-lg font-semibold mb-4">Confirmar Pedido</h3>
            <div className="border-b pb-4">
              <h4 className="font-medium mb-2">Resumen del pedido:</h4>
              {documentItems.map((item) => (
                <div key={item.articleId} className="flex justify-between text-sm">
                  <span>{`${item.articleName} x ${item.quantity}`}</span>
                  <span>${(item.price || 0) * item.quantity}</span>
                </div>
              ))}
            </div>
            <div className="flex justify-between font-bold mt-4">
              <span>Total</span>
              <span>${documentItems.reduce((sum, item) => sum + (item.price || 0) * item.quantity, 0).toFixed(2)}</span>
            </div>
            <div className="flex space-x-4 mt-4">
              <button
                onClick={() => setShowConfirmModal(false)}
                className="flex-1 py-2 border rounded-lg hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleCreateInvoice}
                className="flex-1 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}
  
      {/* Success Modal */}
      {invoiceNumber && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-lg w-full text-center">
            <h3 className="text-lg font-semibold mb-4">Factura Creada</h3>
            <p className="text-gray-700">Número de comprobante: <span className="font-bold">{invoiceNumber}</span></p>
            <button
              onClick={() => navigate("/Billing")}
              className="mt-4 bg-green-500 text-white px-4 py-2 rounded-lg"
            >
              Aceptar
            </button>
          </div>
        </div>
      )}

      {showFinalModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-md text-center">
            <h2 className="text-2xl font-bold mb-4">Factura Generada</h2>
            <p className="text-lg text-gray-700 mb-6">Factura <span className="font-bold">{invoiceNumber}</span> generada con éxito.</p>
            <button
              onClick={() => window.location.reload()}
              className="bg-green-500 text-white px-6 py-3 rounded-lg hover:bg-green-600 transition-colors"
            >
              Aceptar
            </button>
          </div>
        </div>
      )}
    </div>
  );
  
};

export default NewInvoice;
