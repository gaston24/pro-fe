import React, { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import { X, Eye, Calendar, User, Filter, Plus, Minus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { API_URL } from "../config";

interface DocumentItem {
  id: number;
  articleCode: string;
  quantity: number;
  price: number;
}

interface Document {
  id: number;
  thirdPartyCode: string;
  thirdPartyType: "Cliente" | "Proveedor";
  date: string;
  compType: string;
  status: string;
  items: DocumentItem[];
  total: number;
}

interface Status {
  id: string;
  name: string;
}

const DocumentList = () => {
  const getOneWeekAgoDate = (): string => {
    const today = new Date();
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(today.getDate() - 7);
    return oneWeekAgo.toISOString().split("T")[0];
  };

  // Estado de documentos y errores
  const [documents, setDocuments] = useState<Document[]>([]);
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  // Estado de filtros
  // Estado de filtros
  const [compTypeFilter, setCompTypeFilter] = useState<string>("remito");
  const [startDate, setStartDate] = useState<string>(getOneWeekAgoDate());
  const [endDate, setEndDate] = useState<string>(new Date().toISOString().split("T")[0]);
  const [thirdPartyCode, setThirdPartyCode] = useState<string>("");
  const [statusId, setStatusId] = useState<string>("0");
  const [thirdPartyOptions, setThirdPartyOptions] = useState<{ code: string; label: string }[]>([]);
  const [statuses, setStatuses] = useState<Status[]>([]);

  // Función para capitalizar la primera letra
  const capitalizeFirstLetter = (str: string) =>
    str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();

  const getThirdPartyType = (compType: string): "Cliente" | "Proveedor" => {
    return compType.toLowerCase() === "remito" ? "Proveedor" : "Cliente";
  };

  // Obtiene los documentos con filtros por defecto o aplicados
  const fetchDocuments = async (filterParams?: any) => {
    try {
      setLoading(true);

      const defaultFilters = {
        type: "remito",
        statusId: "0",
        thirdPartyCode: "0",
        from: getOneWeekAgoDate(),
        to: new Date().toISOString().split("T")[0],
      };

      const body = JSON.stringify(filterParams || defaultFilters);

      const response = await fetch(`${API_URL}/documents/filter`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body,
      });

      if (!response.ok) throw new Error("Error al obtener los documentos");

      const data = await response.json();

      const formattedDocuments = data.map((document: any) => ({
        id: document.id,
        thirdPartyCode: document.thirdPartyCode,
        thirdPartyType: getThirdPartyType(document.compType),
        date: document.issueDate,
        compType: capitalizeFirstLetter(document.compType),
        status: document.status || "Pendiente", // Mapea status si está disponible
        items: document.documents.map((detail: any) => ({
          id: detail.id,
          articleCode: detail.articleCode,
          quantity: detail.quantity,
          price: detail.price || 0,
        })),
        total: document.documents.reduce(
          (sum: number, detail: any) => sum + detail.quantity * (detail.price || 0),
          0
        ),
      }));

      setDocuments(formattedDocuments);

      // Crear lista de Clientes/Proveedores ordenados
      const uniqueThirdParties = Array.from(
        new Map(
          formattedDocuments.map((d) => [
            d.thirdPartyCode,
            {
              code: d.thirdPartyCode,
              label: `${d.thirdPartyType} ${d.thirdPartyCode} (${d.thirdPartyType.toLowerCase()})`,
            },
          ])
        ).values()
      ).sort((a, b) => a.label.localeCompare(b.label));

      setThirdPartyOptions(uniqueThirdParties);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Obtiene los estados de documentos
  const fetchStatuses = async () => {
    try {
      const response = await fetch(`${API_URL}/statuses`);
      if (!response.ok) throw new Error("Error al obtener los estados");
      const data = await response.json();
      setStatuses(data);
    } catch (err: any) {
      console.error("Error al obtener estados:", err);
    }
  };

  // Cargar documentos y estados en el primer render
  useEffect(() => {
    fetchStatuses();
    fetchDocuments();
  }, []);

  const handleFilter = () => {
    const filterParams = {
      type: compTypeFilter || undefined,
      statusId: statusId || undefined,
      thirdPartyCode: thirdPartyCode || undefined,
      from: startDate ? new Date(startDate).toISOString() : undefined,
      to: endDate ? new Date(endDate).toISOString() : undefined,
    };

    // Eliminar valores `undefined`
    Object.keys(filterParams).forEach(
      (key) => filterParams[key] === undefined && delete filterParams[key]
    );

    fetchDocuments(filterParams);
  };

  return (
    <div className="min-h-screen w-screen bg-gray-100">
      <Navbar />
      <div className="container mx-auto p-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-6 text-center">
          Lista de Documentos
        </h1>

        {/* Filtros */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-6 gap-5">
            <select
              value={compTypeFilter}
              onChange={(e) => setCompTypeFilter(e.target.value)}
              className="p-2 border rounded"
            >
              <option value="remito">Remito</option>
              <option value="pedido">Pedido</option>
              <option value="factura">Factura</option>
            </select>

            <select
              value={statusId}
              onChange={(e) => setStatusId(e.target.value)}
              className="p-2 border rounded"
            >
              <option value="0">Todos los Estados</option>
              {statuses.map((status) => (
                <option key={status.id} value={status.id}>
                  {status.name}
                </option>
              ))}
            </select>

            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="p-2 border rounded"
            />

            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="p-2 border rounded"
            />

            <select
              value={thirdPartyCode}
              onChange={(e) => setThirdPartyCode(e.target.value)}
              className="p-2 border rounded"
            >
              <option value="">Clientes / Proveedores</option>
              {thirdPartyOptions.map((option) => (
                <option key={option.code} value={option.code}>
                  {option.label}
                </option>
              ))}
            </select>

            <button
              onClick={handleFilter}
              className="bg-blue-600 text-white p-2 rounded flex items-center justify-center"
            >
              <Filter className="mr-2 w-5 h-5" /> Filtrar
            </button>
          </div>
        </div>

        {/* Lista de documentos */}
        {loading && <p className="text-center text-gray-600">Cargando documentos...</p>}
        {error && <p className="text-center text-red-500">{error}</p>}
        {!loading && !error && documents.length === 0 && (
          <p className="text-center text-gray-600">No hay documentos registrados</p>
        )}

        <div className="hidden sm:block bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="grid grid-cols-6 gap-4 p-4 bg-gray-900 text-white font-semibold">
            <div>ID Documento</div>
            <div>Tipo</div>
            <div>Fecha</div>
            <div>Cliente</div>
            <div>Estado</div>
            <div>Acciones</div>
          </div>

          {documents.map((document) => (
            <div
              key={document.id}
              className="grid grid-cols-6 gap-4 p-4 border-t border-gray-200 items-center hover:bg-gray-50"
            >
              <div className="font-medium text-blue-600">#{document.id}</div>
              <div className="font-medium">{document.compType}</div>
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-gray-500" />
                {new Date(document.date).toLocaleDateString()}
              </div>
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-gray-500" />
                Cliente #{document.thirdPartyCode}
              </div>
              <div>
                <span className="px-3 py-1 rounded-full text-sm bg-gray-300 text-gray-800 font-semibold">
                  {document.status}
                </span>
              </div>
              <div className="flex justify-center">
                <button
                  onClick={() => setSelectedDocument(document)}
                  className="text-red-600 hover:text-red-800 transition-colors mr-4"
                >
                  <Eye className="w-5 h-5" />
                </button>
                {document.compType.toLowerCase() === "remito" && (
                  <button
                    onClick={() => navigate(`/movement/remito/${document.id}`)}
                    className="text-green-600 hover:text-green-800 transition-colors"
                  >
                  Ingresar
                  </button>
                )}
                {document.compType.toLowerCase() === "pedido" && (
                  <button
                    onClick={() => navigate(`/movement/pedido/${document.id}`)}
                    className="text-blue-600 hover:text-blue-800 transition-colors"
                  >
                  Egresar
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
        </div>

        {/* Modal de Detalle */}
        {selectedDocument && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full">
              <div className="p-6 border-b border-gray-100">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-xl font-semibold mb-1">
                      Documento #{selectedDocument.id}
                    </h3>
                    <div className="flex gap-4 text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {new Date(selectedDocument.date).toLocaleDateString()}
                      </span>
                      <span className="flex items-center gap-1">
                        <User className="w-4 h-4" />
                        Cliente #{selectedDocument.thirdPartyCode}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedDocument(null)}
                    className="p-2 hover:bg-gray-100 rounded-full"
                  >
                    <X className="w-5 h-5 text-gray-500" />
                  </button>
                </div>
              </div>

              <div className="p-6">
                <div className="space-y-4">
                  <div className="grid grid-cols-3 gap-4 text-sm font-medium text-gray-600 pb-2">
                    <div>Artículo</div>
                    <div>Cantidad</div>
                    <div>Precio</div>
                  </div>
                  {selectedDocument.items.map((item, index) => (
                    <div key={`${item.articleCode}-${index}`} className="grid grid-cols-3 gap-4 text-sm">
                      <div className="text-blue-600">{item.articleCode}</div>
                      <div>{item.quantity}</div>
                      <div>${item.price.toFixed(2)}</div>
                    </div>
                  ))}

                  <div className="border-t pt-4 flex justify-between items-center font-semibold">
                    <span>Total</span>
                    <span className="text-lg text-blue-600">${selectedDocument.total.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
  );
};

export default DocumentList;
