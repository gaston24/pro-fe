import React, { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import { X, Eye, Calendar, User } from "lucide-react";
// import { X, Eye, Calendar, User, Package, Clock } from "lucide-react";
import { API_URL } from "../config";

interface OrderItem {
  code: string;
  name: string;
  variant: string;
  quantity: number;
  price: number;
}

interface Order {
  id: number;
  clientId: string;
  date: string;
  status: "pending" | "processing" | "completed" | "cancelled";
  items: OrderItem[];
  total: number;
}

const OrderList = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await fetch(`${API_URL}/cart`);
        if (!response.ok) throw new Error("Error al obtener los pedidos");

        const data = await response.json();

        const formattedOrders = data.map((order: any) => ({
          id: order.id,
          clientId: order.clientId,
          date: order.createdAt,
          status: "pending",
          items: order.cartDetails.map((detail: any) => ({
            id: detail.id,
            code: detail.article.code,
            name: detail.article.name,
            variant: detail.variant,  // Aquí capturamos la variant
            quantity: detail.quantity,
            price: detail.article.price,
          })),
          total: order.cartDetails.reduce(
            (sum: number, detail: any) => sum + detail.quantity * detail.article.price,
            0
          ),
        }));
        

        setOrders(formattedOrders);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const getStatusLabel = (status: string) => {
    const labels = {
      pending: "Pendiente",
      processing: "En Proceso",
      completed: "Completado",
      cancelled: "Cancelado",
    };
    return labels[status as keyof typeof labels];
  };

  return (
    <div className="min-h-screen w-screen bg-gray-100">
      <Navbar />
      <div className="container mx-auto p-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-6 text-center">Lista de Pedidos</h1>

        {loading && <p className="text-center text-gray-600">Cargando pedidos...</p>}
        {error && <p className="text-center text-red-500">{error}</p>}

        {!loading && !error && orders.length === 0 && (
          <p className="text-center text-gray-600">No hay pedidos registrados</p>
        )}

        <div className="hidden sm:block bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="grid grid-cols-5 gap-4 p-4 bg-gray-900 text-white font-semibold">
            <div>ID Pedido</div>
            <div>Fecha</div>
            <div>Cliente</div>
            <div>Estado</div>
            <div>Acciones</div>
          </div>

          {orders.map((order) => (
            <div
              key={order.id}
              className="grid grid-cols-5 gap-4 p-4 border-t border-gray-200 items-center hover:bg-gray-50"
            >
              <div className="font-medium text-blue-600">#{order.id}</div>
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-gray-500" />
                {new Date(order.date).toLocaleDateString()}
              </div>
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-gray-500" />
                Cliente #{order.clientId}
              </div>
              <div>
                <span className="px-3 py-1 rounded-full text-sm bg-gray-300 text-gray-800 font-semibold">
                  {getStatusLabel(order.status)}
                </span>
              </div>
              <div className="flex justify-center">
                <button 
                onClick={() => setSelectedOrder(order)}
                className="text-red-600 hover:text-red-800 transition-colors">
                  <Eye className="w-5 h-5" />
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="block sm:hidden">
          {orders.map((order) => (
            <div
              key={order.id}
              className="bg-red-50 border-l-4 border-red-600 shadow-md rounded-lg p-4 mb-3"
            >
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-bold text-red-700">Pedido #{order.id}</h3>
                <span className="px-3 py-1 rounded-full text-xs bg-red-100 text-red-800 font-semibold">
                  {getStatusLabel(order.status)}
                </span>
              </div>
              <p className="text-sm text-gray-600 mt-1 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-gray-500" />
                {new Date(order.date).toLocaleDateString()}
              </p>
              <p className="text-sm text-gray-600 mt-1 flex items-center gap-2">
                <User className="w-4 h-4 text-gray-500" />
                Cliente #{order.clientId}
              </p>
              <div className="mt-3 flex justify-end">
                <button
                  onClick={() => setSelectedOrder(order)}
                  className="flex items-center gap-2 text-red-700 border border-red-600 rounded-full px-3 py-1 hover:bg-red-600 hover:text-white transition-colors"
                >
                  <Eye className="w-5 h-5" />
                  <span className="text-sm font-semibold">Ver</span>
                </button>
              </div>
            </div>
          ))}
        </div>

      {/* Modal de detalle */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full">
            <div className="p-6 border-b border-gray-100">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-xl font-semibold mb-1">
                    Pedido #{selectedOrder.id}
                  </h3>
                  <div className="flex gap-4 text-sm text-gray-500">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {new Date(selectedOrder.date).toLocaleDateString()}
                    </span>
                    <span className="flex items-center gap-1">
                      <User className="w-4 h-4" />
                      Cliente #{selectedOrder.clientId}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="p-2 hover:bg-gray-100 rounded-full"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>
            </div>

            <div className="p-6">
              <div className="space-y-4">
                <div className="grid grid-cols-4 gap-4 text-sm font-medium text-gray-600 pb-2">
                  <div>Código</div>
                  <div>Producto</div>
                  <div>Cantidad</div>
                  <div>Precio</div>
                </div>
                {selectedOrder.items.map((item, index) => (
                  <div key={`${item.code}-${index}`} className="grid grid-cols-4 gap-4 text-sm">
                    <div className="text-blue-600">{item.code}</div>
                    <div>{item.variant || "Sin variante"}</div>
                    <div>{item.quantity}</div>
                    <div>${item.price.toFixed(2)}</div>
                  </div>
                ))}

                <div className="border-t pt-4 flex justify-between items-center font-semibold">
                  <span>Total</span>
                  <span className="text-lg text-blue-600">${selectedOrder.total.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      </div>
      
    </div>
    
  );
};

export default OrderList;
