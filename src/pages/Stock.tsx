import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import { ChevronDown, Package, MapPin, Clock, Search, Layers, Loader } from "lucide-react";
import { API_URL } from "../config";

interface StockItem {
  id: number;
  articleCode: string;
  name: string;
  description: string;
  locationCode: string;
  quantity: number;
  updatedAt: string;
}

interface Movement {
  id: number;
  articleCode: string;
  locationCode: string;
  batchCode: string | null;
  quantity: number;
  type: string;
  createdAt: string;
}

const StockPage = () => {
  const [stock, setStock] = useState<StockItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedItems, setExpandedItems] = useState<string[]>([]);
  const [expandedLocations, setExpandedLocations] = useState<{ [key: string]: Movement[] | null }>({});
  const [loadingMovements, setLoadingMovements] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>("");

  useEffect(() => {
    const fetchStock = async () => {
      try {
        const response = await fetch(`${API_URL}/stock`);
        if (!response.ok) throw new Error("Error al cargar el stock");
        const data = await response.json();
        setStock(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchStock();
  }, []);

  const toggleExpand = (articleCode: string) => {
    setExpandedItems((prev) =>
      prev.includes(articleCode)
        ? prev.filter((code) => code !== articleCode)
        : [...prev, articleCode]
    );
  };

  const toggleLocationExpand = async (articleCode: string, locationCode: string) => {
    const key = `${articleCode}-${locationCode}`;
    if (expandedLocations[key]) {
      setExpandedLocations((prev) => ({ ...prev, [key]: null }));
    } else {
      setLoadingMovements(key);
      try {
        const response = await fetch(`${API_URL}/movements/article-location/${articleCode}/${locationCode}`);
        if (!response.ok) throw new Error("Error al cargar movimientos");
        const data = await response.json();
        setExpandedLocations((prev) => ({ ...prev, [key]: data }));
      } catch (err) {
        alert("Error al cargar movimientos.");
      } finally {
        setLoadingMovements(null);
      }
    }
  };

  const getTotalQuantity = (articleCode: string) => {
    return stock
      .filter((item) => item.articleCode === articleCode)
      .reduce((total, item) => total + item.quantity, 0);
  };

  const groupedStock = stock.reduce((acc: any, item) => {
    if (!acc[item.articleCode]) acc[item.articleCode] = [];
    acc[item.articleCode].push(item);
    return acc;
  }, {});

  const filteredStock = searchTerm
    ? Object.keys(groupedStock).filter((articleCode) =>
        articleCode.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : Object.keys(groupedStock);

  return (
    <div className="min-h-screen w-screen bg-gray-100">
      <Navbar />
      <div className="max-w-5xl mx-auto mt-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-8 flex items-center justify-center gap-3">
          <Layers className="w-8 h-8 text-blue-600" />
          Control de Stock
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

        {loading && (
          <div className="text-center p-8 bg-white rounded-xl shadow-lg">
            <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-gray-600">Cargando inventario...</p>
          </div>
        )}

        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-xl shadow-lg mb-6">
            {error}
          </div>
        )}

        {!loading && filteredStock.length === 0 && (
          <div className="text-center p-8 bg-white rounded-xl shadow-lg">
            <Package className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-600">No hay stock disponible</p>
          </div>
        )}

        <div className="space-y-4">
          {filteredStock.map((articleCode) => {
            const items = groupedStock[articleCode];
            const firstItem = items[0];
            const isExpanded = expandedItems.includes(articleCode);

            return (
              <div
                key={articleCode}
                className={`bg-white rounded-xl shadow-lg overflow-hidden transition-all duration-200 hover:shadow-2xl ${
                  isExpanded ? "border border-blue-600" : ""
                }`}
              >
                <button onClick={() => toggleExpand(articleCode)} className="w-full text-left p-4 focus:outline-none">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h2 className="text-xl font-semibold text-gray-800 truncate">
                          {articleCode} - {firstItem.name}
                        </h2>
                        <span className="px-3 py-1 bg-blue-100 text-blue-700 text-sm font-medium rounded-full">
                          Stock: {getTotalQuantity(articleCode)}
                        </span>
                      </div>
                      <p className="text-gray-600">{firstItem.description}</p>
                    </div>
                    <ChevronDown className={`w-6 h-6 text-gray-400 ${isExpanded ? "rotate-180" : ""}`} />
                  </div>
                </button>

                {isExpanded && (
                  <div className="px-6 pb-6">
                    <div className="bg-gray-100 rounded-xl overflow-hidden mt-2">
                    {items.map((item) => (
                      <div key={item.id} 
                        className="border-b border-gray-200 ml-4 pb-4 mt-4 cursor-pointer rounded-lg" 
                        onClick={() => toggleLocationExpand(item.articleCode, item.locationCode)}
                        >
                          <div className="flex items-center justify-between mr-4">
                            <div className="flex items-center gap-2">
                              <MapPin className="w-5 h-5 text-gray-400" />
                              <span className="font-medium">{item.locationCode}</span>
                              <span className="ml-4 text-sm text-gray-700">Total: {item.quantity}</span>
                            </div>
                            <ChevronDown
                              className={`w-5 h-5 transition-transform duration-200 ${
                                expandedLocations[`${item.articleCode}-${item.locationCode}`] ? "rotate-180" : ""
                              }`}
                            />
                          </div>

                          {expandedLocations[`${item.articleCode}-${item.locationCode}`] === null &&
                            loadingMovements === `${item.articleCode}-${item.locationCode}` && (
                              <div className="flex justify-center py-4">
                                <Loader className="w-6 h-6 animate-spin text-blue-500" />
                              </div>
                          )}

                          {expandedLocations[`${item.articleCode}-${item.locationCode}`] && (
                            <div className="mt-4 pl-4 mr-4 bg-gray-200 rounded-lg">
                              {expandedLocations[`${item.articleCode}-${item.locationCode}`]
                                ?.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                                .map((movement) => (
                                  <div
                                    key={movement.id}
                                    className="flex justify-left items-center py-2 border-b border-gray-100"
                                  >
                                    <span className="text-sm text-gray-500 mr-5">
                                      Fecha: {new Date(movement.createdAt).toLocaleDateString()}
                                    </span>
                                    <span className="text-sm font-semibold">{movement.type === "E" ? "+" : "-"}{movement.quantity}</span>
                                  </div>
                                ))}
                            </div>
                          )}
                        </div>
                      ))}

                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default StockPage;
