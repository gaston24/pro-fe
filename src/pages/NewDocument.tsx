import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Users, 
  Package, 
  Plus, 
  Trash2, 
  Save, 
  Check 
} from 'lucide-react';
import Navbar from '../components/Navbar';
import { API_URL } from '../config';

interface Entity {
  id: number;
  code: string;
  name: string;
}

interface ArticleItem {
  articleId: number;
  articleCode: string;
  articleName: string;
  quantity: number;
}

interface controlUser {
  username: string;
}

const NewDocument: React.FC = () => {
  const { type } = useParams<{ type: string }>();
  const navigate = useNavigate();

  // State management
  const [entities, setEntities] = useState<Entity[]>([]);
  const [articles, setArticles] = useState<Entity[]>([]);
  const [selectedEntity, setSelectedEntity] = useState<Entity | null>(null);
  const [documentItems, setDocumentItems] = useState<ArticleItem[]>([]);
  const [comments, setComments] = useState<string>('');
  const [selectedArticle, setSelectedArticle] = useState<Entity | null>(null);
  const [articleQuantity, setArticleQuantity] = useState<number>(1);
  const [showConfirmModal, setShowConfirmModal] = useState<boolean>(false);

  // Fetch entities based on document type
  useEffect(() => {
    if (type !== 'remito' && type !== 'pedido') {
      navigate('/ListDocuments');  // Redirige si el tipo no es válido
      return;
    }
  
    const fetchEntities = async () => {
      const endpoint = type === 'remito' ? '/supplier' : '/client';
      try {
        const response = await fetch(`${API_URL}${endpoint}`);
        const data = await response.json();
        setEntities(data);
      } catch (error) {
        console.error('Error fetching entities', error);
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
  
    fetchEntities();
    fetchArticles();
  }, [type, navigate]);
  

  // Add article to document
  const handleAddArticle = () => {
    if (selectedArticle && articleQuantity > 0) {
      const existingItemIndex = documentItems.findIndex(
        item => item.articleId === selectedArticle.id
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
            quantity: articleQuantity
          }
        ]);
      }

      // Reset article selection
      setSelectedArticle(null);
      setArticleQuantity(1);
    }
  };

  // Remove article from document
  const handleRemoveArticle = (articleId: number) => {
    setDocumentItems(documentItems.filter(item => item.articleId !== articleId));
  };

  // Create document
  const handleCreateDocument = async () => {
    if (!selectedEntity || documentItems.length === 0) return;

    const receiptNumber = (type === 'remito') ? 5 : 4;
    const movementType = (type === 'remito') ? 'E' : 'S';
    const user = localStorage.getItem('user');
    const controlUser = user ? JSON.parse(user).username : '';

    try {
      const payload = {
        documentHeaderData: {
          receiptNumber,
          issueDate: new Date().toISOString().split('T')[0],
          thirdPartyCode: selectedEntity.id,
          compType: type,
          bookId: receiptNumber,
          statusId: 1,
          comments,
          controlUser: controlUser
        },
        documentData: documentItems.map(item => ({
          articleCode: item.articleCode,
          quantity: item.quantity,
          type: movementType,
          price: 0,
          cost: 0
        }))
      };

      const response = await fetch(`${API_URL}/documents`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        setShowConfirmModal(true);
      }
    } catch (error) {
      console.error('Error creating document', error);
    }
  };

  return (
    <div className="min-h-screen w-screen bg-gray-100">
      <Navbar />
      <div className="flex justify-center items-center h-full mt-5">
        <div className="w-full max-w-5xl bg-white p-6 sm:p-8 rounded-xl shadow-lg">
          <h1 className="text-3xl font-bold text-gray-900 mb-4 text-center">
            Nuevo {type}
          </h1>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Entity Selection */}
            <div>
              <label className="block mb-2 font-semibold">
                {type === 'remito' ? 'Proveedor' : 'Cliente'}
              </label>
              <select
                value={selectedEntity?.id || ''}
                onChange={(e) => {
                  const entity = entities.find(ent => ent.id === Number(e.target.value));
                  setSelectedEntity(entity || null);
                }}
                className="w-full p-2 border rounded"
              >
                <option value="">Seleccionar</option>
                {entities.map(entity => (
                  <option key={entity.id} value={entity.id}>
                    {entity.name}
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
                  const article = articles.find(art => art.id === Number(e.target.value));
                  setSelectedArticle(article || null);
                }}
                className="w-full p-2 border rounded"
              >
                <option value="">Seleccionar Artículo</option>
                {articles.map(article => (
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

              <button
                onClick={handleAddArticle}
                disabled={!selectedArticle}
                className="bg-blue-500 text-white p-2 rounded flex items-center justify-center disabled:opacity-50"
              >
                <Plus className="mr-2" /> Agregar
              </button>
            </div>

            {/* Article List */}
            {documentItems.length > 0 && (
              <div className="mt-4 border rounded">
                {documentItems.map(item => (
                  <div 
                    key={item.articleId} 
                    className="flex justify-between items-center p-3 border-b"
                  >
                    <div>
                      <span className="font-semibold">{item.articleName}</span>
                      <span className="ml-4 text-gray-600">Cantidad: {item.quantity}</span>
                    </div>
                    <button 
                      onClick={() => handleRemoveArticle(item.articleId)}
                      className="text-red-500 hover:bg-red-50 p-2 rounded"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Create Button */}
          <div className="mt-6 flex justify-end">
            <button
              onClick={handleCreateDocument}
              disabled={!selectedEntity || documentItems.length === 0}
              className="bg-green-500 text-white p-3 rounded flex items-center disabled:opacity-50"
            >
              <Save className="mr-2" /> Crear {type.charAt(0).toUpperCase() + type.slice(1)}
            </button>
          </div>

          {/* Confirmation Modal */}
          {showConfirmModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
              <div className="bg-white p-8 rounded-lg text-center">
                <Check className="mx-auto text-green-500 mb-4" size={64} />
                <h2 className="text-2xl font-bold mb-4">
                  {type.charAt(0).toUpperCase() + type.slice(1)} Creado
                </h2>
                <p className="mb-6">El documento se ha creado exitosamente.</p>
                <div className="flex justify-center space-x-4">
                  <button
                    onClick={() => {
                      setShowConfirmModal(false);
                      navigate(`/ListDocuments`);
                    }}
                    className="bg-blue-500 text-white px-4 py-2 rounded"
                  >
                    Ir a Documentos
                  </button>
                  <button
                    onClick={() => {
                      setShowConfirmModal(false);
                      window.location.reload();
                    }}
                    className="bg-green-500 text-white px-4 py-2 rounded"
                  >
                    Nuevo {type.charAt(0).toUpperCase() + type.slice(1)}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NewDocument;