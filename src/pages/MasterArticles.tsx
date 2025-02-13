import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import { Eye, Trash2, Search, PlusCircle, Edit } from "lucide-react";
import { API_URL } from "../config";

interface Article {
  id?: number;
  code: string;
  baseCode: string;
  name: string;
  alias: string;
  description: string;
  price: number;
  cost: number;
  comments: string;
  brand: string;
  category: string;
  supplier: string;
  urlImage: string;
  codigoBarra?: string;
}

const MasterArticleList = () => {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const [deleteArticleId, setDeleteArticleId] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [filteredArticles, setFilteredArticles] = useState<Article[]>([]);
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [newArticle, setNewArticle] = useState<Article>({
    code: "",
    baseCode: "",
    name: "",
    alias: "",
    description: "",
    price: 0,
    cost: 0,
    comments: "",
    brand: "",
    category: "",
    supplier: "",
    urlImage: "",
    codigoBarra: "",
  });

  const formFields = {
    code: { label: "Código", type: "text" },
    baseCode: { label: "Código Base", type: "text" },
    name: { label: "Nombre", type: "text" },
    alias: { label: "Alias", type: "text" },
    description: { label: "Descripción", type: "text" },
    price: { label: "Precio", type: "number" },
    cost: { label: "Costo", type: "number" },
    comments: { label: "Comentarios", type: "text" },
    brand: { label: "Marca", type: "text" },
    category: { label: "Categoría", type: "text" },
    supplier: { label: "Proveedor", type: "text" },
    urlImage: { label: "URL de Imagen", type: "text" },
    codigoBarra: { label: "Código de Barra", type: "text" },
  };

  useEffect(() => {
    const fetchArticles = async () => {
      try {
        const response = await fetch(`${API_URL}/articles`);
        if (!response.ok) throw new Error("Error al cargar artículos");
        const data = await response.json();
        setArticles(data);
        setFilteredArticles(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchArticles();
  }, []);

  useEffect(() => {
    const lowerCaseTerm = searchTerm.toLowerCase();
    const filtered = articles.filter(
      (article) =>
        article.name.toLowerCase().includes(lowerCaseTerm) ||
        article.description.toLowerCase().includes(lowerCaseTerm) ||
        article.code.toLowerCase().includes(lowerCaseTerm)
    );
    setFilteredArticles(filtered);
  }, [searchTerm, articles]);

  const handleDelete = async () => {
    if (!deleteArticleId) return;
    try {
      const response = await fetch(`${API_URL}/articles/${deleteArticleId}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Error al eliminar el artículo");

      setArticles((prevArticles) =>
        prevArticles.filter((article) => article.id !== deleteArticleId)
      );
      setDeleteArticleId(null);
    } catch (err: any) {
      alert("Error al eliminar el artículo");
    }
  };

  const handleUpdateArticle = async () => {
    if (!selectedArticle) return;
    try {
      const response = await fetch(`${API_URL}/articles/${selectedArticle.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(selectedArticle),
      });
      if (!response.ok) throw new Error("Error al actualizar el artículo");

      setArticles((prevArticles) =>
        prevArticles.map((article) =>
          article.id === selectedArticle.id ? selectedArticle : article
        )
      );
      setSelectedArticle(null);
    } catch (err: any) {
      alert("Error al actualizar el artículo");
    }
  };

  const handleAddArticle = async () => {
    try {
      const response = await fetch(`${API_URL}/articles`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newArticle),
      });

      if (!response.ok) throw new Error("Error al agregar el artículo");

      const addedArticle = await response.json();
      setArticles((prevArticles) => [...prevArticles, addedArticle]);
      setShowAddModal(false);
      setNewArticle({
        code: "",
        baseCode: "",
        name: "",
        alias: "",
        description: "",
        price: 0,
        cost: 0,
        comments: "",
        brand: "",
        category: "",
        supplier: "",
        urlImage: "",
      });
    } catch (err: any) {
      alert("Error al agregar el artículo");
    }
  };

  return (
    <div className="min-h-screen w-screen bg-gray-100">
      <Navbar />
      <div className="flex justify-center items-center h-full">
        <div className="w-full max-w-5xl bg-white p-6 sm:p-8 rounded-xl shadow-lg">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-3xl font-bold text-gray-900">Maestro de Artículos</h1>
            <button
              onClick={() => setShowAddModal(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-md flex items-center"
            >
              <PlusCircle className="w-5 h-5 mr-2" />
              Agregar Artículo
            </button>
          </div>

          <div className="flex justify-center mb-6">
            <Search className="justify-left left-3 top-1 mt-2 text-gray-500 w-10 h-6" />
            <input
              type="text"
              className="w-full max-w-lg pl-10 pr-4 py-2 border rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500"
              placeholder="Buscar artículos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {loading && <p className="text-center text-gray-600">Cargando...</p>}
          {error && <p className="text-center text-red-500">{error}</p>}
          {!loading && !error && filteredArticles.length === 0 && (
            <p className="text-center text-gray-600">No hay artículos disponibles</p>
          )}

          <div className="overflow-x-auto">
            <table className="w-full table-auto border-collapse border border-gray-200 text-gray-900">
              <thead>
                <tr className="bg-black text-white">
                  <th className="border border-gray-300 px-2 py-2">ID</th>
                  <th className="border border-gray-300 px-2 py-2">Código</th>
                  <th className="border border-gray-300 px-2 py-2">Nombre</th>
                  <th className="border border-gray-300 px-2 py-2">Descripción</th>
                  <th className="border border-gray-300 px-2 py-2">Categoría</th>
                  <th className="border border-gray-300 px-2 py-2">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredArticles.map((article) => (
                  <tr key={article.id} className="border-b hover:bg-gray-100">
                    <td className="border border-gray-300 px-2 py-2 text-center">{article.id}</td>
                    <td className="border border-gray-300 px-2 py-2">{article.code}</td>
                    <td className="border border-gray-300 px-2 py-2">{article.name}</td>
                    <td className="border border-gray-300 px-2 py-2">{article.description}</td>
                    <td className="border border-gray-300 px-2 py-2">{article.category}</td>
                    <td className="border border-gray-300 px-2 py-2 flex justify-center gap-2">
                      <button
                        onClick={() => setSelectedArticle(article)}
                        className="text-gray-700 hover:text-black p-2 rounded-md"
                      >
                        <Edit className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => setDeleteArticleId(article.id)}
                        className="text-red-600 hover:text-red-800 p-2 rounded-md"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modal de agregar artículo */}
      {showAddModal && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center"
          onClick={() => setShowAddModal(false)} 
        >
          <div
            className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full max-h-[80vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()} 
          >
            <h3 className="text-lg font-bold mb-4">Agregar Nuevo Artículo</h3>
            <form className="space-y-4">
              {Object.entries(formFields).map(([key, field]) => (
                <div key={key}>
                  <label className="block text-sm font-medium text-gray-700">
                    {field.label}
                  </label>
                  <input
                    type={field.type}
                    name={key}
                    value={(newArticle as any)[key]}
                    onChange={(e) =>
                      setNewArticle({ ...newArticle, [key]: e.target.value })
                    }
                    className="w-full p-2 border border-gray-300 rounded-md"
                  />
                </div>
              ))}
            </form>
            <div className="flex justify-end gap-2 mt-4">
              <button
                onClick={handleAddArticle}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md"
              >
                Guardar
              </button>
              <button
                onClick={() => setShowAddModal(false)}
                className="bg-gray-400 hover:bg-gray-500 text-white px-4 py-2 rounded-md"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de edición de artículo */}
      {selectedArticle && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center"
          onClick={() => setSelectedArticle(null)} 
        >
          <div
            className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full max-h-[80vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()} 
          >
            <h3 className="text-lg font-bold mb-4">Editar Artículo</h3>
            <form className="space-y-4">
              {Object.entries(formFields).map(([key, field]) => (
                <div key={key}>
                  <label className="block text-sm font-medium text-gray-700">
                    {field.label}
                  </label>
                  <input
                    type={field.type}
                    name={key}
                    value={(selectedArticle as any)[key]}
                    onChange={(e) =>
                      setSelectedArticle({ ...selectedArticle, [key]: e.target.value })
                    }
                    className="w-full p-2 border border-gray-300 rounded-md"
                  />
                </div>
              ))}
            </form>
            <div className="flex justify-end gap-2 mt-4">
              <button
                onClick={handleUpdateArticle}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md"
              >
                Guardar
              </button>
              <button
                onClick={() => setSelectedArticle(null)}
                className="bg-gray-400 hover:bg-gray-500 text-white px-4 py-2 rounded-md"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}



      {/* Modal de confirmación de eliminación */}
      {deleteArticleId && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-lg shadow-xl text-center">
            <p className="text-lg font-bold mb-4">
              ¿Estás seguro de eliminar este artículo?
            </p>
            <button
              onClick={handleDelete}
              className="bg-red-600 text-white px-4 py-2 rounded-md mr-2"
            >
              Confirmar
            </button>
            <button
              onClick={() => setDeleteArticleId(null)}
              className="bg-gray-400 text-white px-4 py-2 rounded-md"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default MasterArticleList;
