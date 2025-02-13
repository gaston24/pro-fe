import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import { Eye, Trash2, Search } from "lucide-react";
import { API_URL } from "../config";

interface Article {
  id: number;
  code: string;
  name: string;
  description: string;
  category: string;
  price: number;
  urlImage: string;
}

interface MasterData {
  colors: Array<{id: number; name: string; code: string}>;
  fits: Array<{id: number; name: string; code: string}>;
  sizes: Array<{id: number; name: string}>;
}

const ArticleList = () => {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const [deleteArticleId, setDeleteArticleId] = useState<number | null>(null);
  const [masterData, setMasterData] = useState<MasterData | null>(null);
  const [selectedColor, setSelectedColor] = useState<string>("");
  const [selectedFit, setSelectedFit] = useState<string>("");
  const [selectedSize, setSelectedSize] = useState<string>("");
  const isAddButtonDisabled = !selectedColor && !selectedFit && !selectedSize;
  const [deleteVariant, setDeleteVariant] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [filteredArticles, setFilteredArticles] = useState<Article[]>([]);


  const formFields = {
    name: {
      label: 'Nombre',
      type: 'text',
    },
    description: {
      label: 'Descripción',
      type: 'text',
    },
    price: {
      label: 'Precio',
      type: 'number',
    },
    cost: {
      label: 'Costo',
      type: 'number',
    },
    brand: {
      label: 'Marca',
      type: 'text',
    },
    category: {
      label: 'Categoría',
      type: 'text',
    },
    supplier: {
      label: 'Proveedor',
      type: 'text',
    }
  };
  
  const [images, setImages] = useState<string[]>([]);
  const [currentImageIndex, setCurrentImageIndex] = useState<number>(0);

  const fetchImages = async (category: string, articleCode: string, urlImage: string )  => {
    try {
      const temporada = urlImage.split("/")[0];
      const response = await fetch(`${API_URL}/upload-images/${temporada}/${category}/${articleCode}?type=normal`);
      if (!response.ok) throw new Error("No se encontraron imágenes");

      const data = await response.json();
      console.log("Imágenes obtenidas:", data.images);

      const arrayFotos: any = [];
      data.images.forEach((element: string) => {
        console.log(element);
        
        arrayFotos.push(`${API_URL}/images/${element}`);
      });
      console.log("Imágenes obtenidas:", data.images);

      setImages(arrayFotos);
      setCurrentImageIndex(0);
    } catch (err: any) {
      console.error("Error obteniendo imágenes:", err.message);
    }
  };

  useEffect(() => {
    const fetchArticles = async () => {
      try {
        const response = await fetch(`${API_URL}/articleAvailables`);
        if (!response.ok) throw new Error("Error al cargar artículos");
        const data = await response.json();
        setArticles(data);
        setFilteredArticles(data); // Inicializar los artículos filtrados
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchArticles();
  }, []);

  useEffect(() => {
    if (selectedArticle) {
      setSelectedColor("");
      setSelectedFit("");
      setSelectedSize("");
    }
  }, [selectedArticle]);
  

  useEffect(() => {
    const fetchMasterData = async () => {
      try {
        const response = await fetch(`${API_URL}/maestros/get-all`);
        if (!response.ok) throw new Error("Error al cargar datos maestros");

        const data = await response.json();
        setMasterData(data);
      } catch (err: any) {
        console.error("Error al cargar datos maestros:", err);
      }
    };

    if (selectedArticle) {
      fetchMasterData();
    }
  }, [selectedArticle]);

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
      const response = await fetch(`${API_URL}/article/${deleteArticleId}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Error al eliminar el articulo");

      setArticles((prevArticles) =>
        prevArticles.filter((article) => article.id !== deleteArticleId)
      );
      setDeleteArticleId(null);
    } catch (err: any) {
      alert("Error al eliminar articulo");
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

      if (!response.ok) throw new Error("Error al actualizar articulo");

      setArticles((prevArticles) =>
        prevArticles.map((article) =>
          article.id === selectedArticle.id ? selectedArticle : article
        )
      );

      setSelectedArticle(null);
    } catch (err: any) {
      alert("Error al actualizar articulo");
    }
  };

  const handleDeleteVariant = async () => {
    if (!selectedArticle || !deleteVariant) return;
  
    // Convertir string en array y filtrar la variante eliminada
    const updatedVariants = selectedArticle.available?.code_available
      .split(",")
      .map((v) => v.trim())
      .filter((v) => v !== deleteVariant);
  
    // Convertir de nuevo a string
    const updatedAvailableString = updatedVariants.join(", ");
  
    try {
      const response = await fetch(
        `${API_URL}/articleAvailables/update-availables/${selectedArticle.code}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ available: updatedAvailableString }),
        }
      );
  
      if (!response.ok) throw new Error("Error al actualizar variantes");
  
      // Actualizar el estado del artículo seleccionado para reflejar la eliminación inmediatamente
      setSelectedArticle((prevArticle) =>
        prevArticle
          ? {
              ...prevArticle,
              available: { ...prevArticle.available, code_available: updatedAvailableString },
            }
          : null
      );
  
      // Actualizar el listado de artículos en el estado principal
      setArticles((prevArticles) =>
        prevArticles.map((article) =>
          article.id === selectedArticle.id
            ? { ...article, available: { code_available: updatedAvailableString } }
            : article
        )
      );
  
      setDeleteVariant(null); // Cerrar el modal
    } catch (err: any) {
      alert("Error al eliminar la variante");
    }
  };


  const handleAddVariant = async () => {
    if (!selectedColor && !selectedFit && !selectedSize) {
      alert("Por favor selecciona alguna variante");
      return;
    }
  
    const selectSizeString = selectedSize ? `- ${selectedSize}` : "";
    const selectedFitString = selectedFit ? `- ${selectedFit}` : "";
  
    const newVariant = `${selectedColor}${selectSizeString}${selectedFitString}`;
  
    if (!selectedArticle) return;
  
    // Convertir string en array y agregar la nueva variante
    const updatedVariants = selectedArticle.available?.code_available
      ? [...selectedArticle.available.code_available.split(",").map(v => v.trim()), newVariant]
      : [newVariant];
  
    // Convertir de nuevo a string
    const updatedAvailableString = updatedVariants.join(", ");
  
    try {
      const response = await fetch(`${API_URL}/articleAvailables/update-availables/${selectedArticle.code}`, {
        headers: { "Content-Type": "application/json" },
        method: "PUT",
        body: JSON.stringify({ available: updatedAvailableString }),
      });
  
      if (!response.ok) throw new Error("Error al agregar variante");
  
      setSelectedArticle(prevArticle =>
        prevArticle
          ? {
              ...prevArticle,
              available: { ...prevArticle.available, code_available: updatedAvailableString },
            }
          : null
      );
  
      setArticles(prevArticles =>
        prevArticles.map(article =>
          article.id === selectedArticle.id
            ? { ...article, available: { code_available: updatedAvailableString } }
            : article
        )
      );
  
      alert("Variante agregada correctamente");
  
      setSelectedColor("");
      setSelectedFit("");
      setSelectedSize("");
    } catch (err: any) {
      alert("Error al agregar variante");
    }
  };
  
  

  {/* ... resto del código hasta el modal de edición ... */}

  return (
    <div className="min-h-screen w-screen bg-gray-100">
      <Navbar />

      <div className="flex justify-center items-center h-full">
        <div className="w-full max-w-5xl bg-white p-6 sm:p-8 rounded-xl shadow-lg">
          <h1 className="text-3xl font-bold text-gray-900 mb-4 text-center">
            Lista de Artículos
          </h1>

          <div className="flex justify-center mb-6">
            <Search className="justify-left left-3 top-1 mt-2 text-gray-500 w-10 h-6" />
            <input
              type="text"
              className="w-full max-w-lg pl-10 pr-4 py-2 border rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500"
              placeholder="Buscar productos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {loading && <p className="text-center text-gray-600">Cargando...</p>}
          {error && <p className="text-center text-red-500">{error}</p>}
          {!loading && !error && articles.length === 0 && (
            <p className="text-center text-gray-600">No hay artículos disponibles</p>
          )}

          <div className="hidden sm:block overflow-x-auto">
            <table className="w-full table-auto border-collapse border border-gray-200 text-gray-900">
              <thead>
                <tr className="bg-black text-white">
                  <th className="border border-gray-300 px-2 py-2">ID</th>
                  <th className="border border-gray-300 px-2 py-2">Codigo</th>
                  <th className="border border-gray-300 px-2 py-2">Nombre</th>
                  <th className="border border-gray-300 px-2 py-2">Descripción</th>
                  <th className="border border-gray-300 px-2 py-2">Categoría</th>
                  <th className="border border-gray-300 px-2 py-2">Precio</th>
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
                    <td className="border border-gray-300 px-2 py-2 text-center">${article.price}</td>
                    <td className="border border-gray-300 px-2 py-2 flex justify-center gap-2">
                    <button
                          onClick={() => {
                            setSelectedArticle(article);
                            fetchImages(article.category, article.name, article.urlImage);
                          }}
                          className="text-gray-700 hover:text-black p-2 rounded-md transition-all"
                        >
                          <Eye className="w-5 h-5" />
                        </button>
                      <button 
                      onClick={() => setDeleteArticleId(article.id)}
                      className="text-red-600 hover:text-red-800 p-2 rounded-md transition-all">
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="block sm:hidden">
            {articles.map((article) => (
              <div 
                key={article.id} 
                className="bg-yellow-50 border-l-4 border-yellow-400 shadow-md rounded-lg p-4 mb-3"
              >
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold text-gray-900">{article.name}</h3>
                  <span className="text-gray-500 text-sm">ID: {article.id}</span>
                </div>
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold text-gray-900">{article.code}</h3>
                  <span className="text-gray-500 text-sm">Codigo: {article.id}</span>
                </div>
                <p className="text-sm text-gray-600 mt-1">
                  <span className="font-semibold text-yellow-700">Descripción:</span> {article.description}
                </p>
                <p className="text-sm text-gray-600 mt-1">
                  <span className="font-semibold text-yellow-700">Categoría:</span> {article.category}
                </p>
                <p className="text-sm text-gray-800 font-bold mt-2">
                  <span className="font-semibold text-yellow-700">Precio:</span> ${article.price}
                </p>
                <div className="mt-3 flex justify-between">
                <button
                  onClick={() => {
                    setSelectedArticle(article);
                    fetchImages(article.category, article.name, article.urlImage);
                  }}
                  className="text-gray-700 hover:text-black p-2 rounded-md transition-all"
                >
                  <Eye className="w-5 h-5" />
                </button>
                  <button 
                  onClick={() => setDeleteArticleId(article.id)}
                  className="bg-gray-700 hover:bg-black text-white p-2 rounded-md">
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>

        </div>
      {deleteArticleId && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-lg shadow-xl text-center">
            <p className="text-lg font-bold mb-4">
              ¿Estás seguro de eliminar este articulo?
            </p>
            <div className="flex justify-center gap-4">
              <button
                onClick={handleDelete}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md"
              >
                Confirmar
              </button>
              <button
                onClick={() => setDeleteArticleId(null)}
                className="bg-gray-400 hover:bg-gray-500 text-white px-4 py-2 rounded-md"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

        {selectedArticle && (
        <div 
          className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50"
          onClick={() => setSelectedArticle(null)} 
        >
        <div 
          className="bg-white p-6 rounded-lg shadow-xl w-full max-w-lg max-h-[80vh] overflow-y-auto relative"
          onClick={(e) => e.stopPropagation()} 
        >
            
        <div className="relative w-full max-w-lg mx-auto">
          <button
            className="absolute top-1/2 left-0 transform -translate-y-1/2 bg-gray-700 text-white p-2 rounded-full shadow-md"
            onClick={() => setCurrentImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1))}
          >
            {"<"}
          </button>

          <div className="relative w-full flex justify-center items-center overflow-hidden">
            <img
              src={`${images[currentImageIndex]}`}
              alt={selectedArticle.name}
              className="w-full h-64 object-contain rounded-md transition-transform duration-300 ease-in-out hover:scale-150 hover:translate-x-5 hover:cursor-zoom-in"
            />
          </div>

          <button
            className="absolute top-1/2 right-0 transform -translate-y-1/2 bg-gray-700 text-white p-2 rounded-full shadow-md"
            onClick={() => setCurrentImageIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1))}
          >
            {">"}
          </button>
        </div>

            <h2 className="text-2xl font-bold text-gray-900 text-center mt-4">
              {selectedArticle.name}
            </h2>

            <form className="space-y-4 mt-6">
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
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring focus:ring-indigo-200"
                  />
                </div>
              ))}
            </form>

            {/* Selector de características */}
            {masterData && (
              <div className="mt-6 mb-4">
                
                {/* Listado de variantes */}
                <div className="mt-6">
                  <h3 className="text-lg font-semibold mb-2">Variantes Disponibles</h3>

                  {selectedArticle.available?.code_available?.trim() ? (
                    <ul>
                      {selectedArticle.available.code_available
                        .split(",")
                        .map((variant, index) => (
                          <li
                            key={index}
                            className="flex justify-between items-center border-gray-300 py-2"
                          >
                            <span>{variant.trim()}</span>
                            <button
                              onClick={() => setDeleteVariant(variant.trim())}
                              className="text-red-600 hover:text-red-800"
                            >
                              <Trash2 className="w-5 h-5" />
                            </button>
                          </li>
                        ))}
                    </ul>
                  ) : (
                    <p className="text-gray-500">No hay variantes disponibles</p>
                  )}
                </div>

                
                <h3 className="text-lg font-semibold mb-4 mt-6">Agregar Variante</h3>
                <div className="grid grid-cols-3 gap-4">
                  {/* Dropdown de Colores */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Color
                    </label>
                    <select
                      value={selectedColor}
                      onChange={(e) => setSelectedColor(e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value=""></option>
                      {masterData.colors.map((color) => (
                        <option key={color.id} value={`${color.name} (${color.code})`}>
                          {color.name} - ({color.code})
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Dropdown de Tallas */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Talla
                    </label>
                    <select
                      value={selectedSize}
                      onChange={(e) => setSelectedSize(e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value=""></option>
                      {masterData.sizes.map((size) => (
                        <option key={size.id} value={size.name}>
                          {size.name} 
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Dropdown de Fits */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Fit
                    </label>
                    <select
                      value={selectedFit}
                      onChange={(e) => setSelectedFit(e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value=""></option>
                      {masterData.fits.map((fit) => (
                        <option key={fit.id} value={`${fit.name} (${fit.code})`}>
                          {fit.name} - ( {fit.code} )
                        </option>
                      ))}
                    </select>
                  </div>

                </div>

                <button
                  onClick={handleAddVariant}
                  disabled={isAddButtonDisabled}
                  className={`w-full mt-4 px-4 py-2 rounded-md transition-colors
                    ${isAddButtonDisabled 
                      ? 'bg-gray-300 cursor-not-allowed text-gray-500'
                      : 'bg-blue-600 hover:bg-blue-700 text-white'
                    }`}
                >
                  Agregar Variante
                </button>
              </div>
            )}

            {/* Botones de guardar y cancelar */}
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={handleUpdateArticle}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md"
              >
                Guardar
              </button>
              <button
                type="button"
                onClick={() => setSelectedArticle(null)}
                className="bg-gray-400 hover:bg-gray-500 text-white px-4 py-2 rounded-md"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de confirmación */}
      {deleteVariant && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-lg shadow-xl text-center">
            <p className="text-lg font-bold mb-4">
              ¿Eliminar la variante "{deleteVariant}"?
            </p>
            <button onClick={handleDeleteVariant} className="bg-red-600 text-white px-4 py-2 rounded-md mr-2">
              Confirmar
            </button>
            <button onClick={() => setDeleteVariant(null)} className="bg-gray-400 text-white px-4 py-2 rounded-md">
              Cancelar
            </button>
          </div>
        </div>
      )}

      </div>
    </div>
  );
};

export default ArticleList;