import { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import {
  X,
  ShoppingCart,
  Maximize2,
  ChevronUp,
  ChevronDown,
  Search,
  Plus,
  Minus,
} from "lucide-react";
import { API_URL } from "../config";

// Interfaces
interface Product {
  id: number;
  code: string;
  name: string;
  alias: string;
  description: string;
  price: number;
  category: string;
  urlImage: string;
  available?: { code_available: string };
}

interface CartItem {
  id: number;
  code: string;
  name: string;
  price: number;
  quantity: number;
  variant: string;
}

interface Client {
  id: number;
  name: string;
}

interface Seller {
  id: number;
  name: string;
}

// Componente del Carrito Flotante
const FloatingCart = ({
  items,
  onRemoveItem,
  onUpdateQuantity,
  onConfirmOrder,
}: {
  items: CartItem[];
  onRemoveItem: (code: string, variant: string) => void;
  onUpdateQuantity: (id: number, newQuantity: number) => void;
  onConfirmOrder: () => void;
}) => {
  const [isOpen, setIsOpen] = useState(true);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  // Calcular total
  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
  <>
    <div className="fixed top-16 right-4 z-50 bg-red-900 sm:bg-white rounded-lg shadow-lg w-80">
      {/* Cabecera del carrito */}
      <div className="p-4 border-b flex justify-between items-center bg-red-900 sm:bg-black text-white rounded-t-lg">
        <div className="flex items-center">
          <ShoppingCart className="w-5 h-5 mr-2" />
          <span className="font-semibold">Mi Carrito</span>
        </div>
        <button 
          onClick={() => setIsOpen(!isOpen)} 
          className="p-1 hover:bg-blue-700 rounded text-black sm:text-white"
        >
          {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>

      </div>

      {isOpen && (
        <div className="max-h-96 overflow-y-auto">
          <div className="p-4 space-y-3">
            {items.length === 0 ? (
              <p className="text-center text-gray-200 sm:text-gray-500">Carrito vacío</p>
            ) : (
              items.map((item) => (
                <div key={item.id} className="flex items-center justify-between">
                  <div className="flex-1">
                  <div className="font-medium">
                    {item.code} <span className="text-sm text-gray-500">({item.variant})</span>
                  </div>
                    <div className="text-sm text-gray-500">
                      ${item.price.toFixed(2)} x {item.quantity}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
                      className="p-1 hover:bg-gray-100 rounded"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                      className="p-1 hover:bg-gray-100 rounded"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onRemoveItem(item.code, item.variant)}
                      className="p-1 text-red-500 hover:bg-red-50 rounded"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
          {items.length > 0 && (
            <div className="p-4 border-t bg-gray-50">
              <div className="flex justify-between items-center mb-4">
                <span className="font-semibold">Total:</span>
                <span className="font-bold text-lg">${total.toFixed(2)}</span>
              </div>
              <button
                onClick={() => setShowConfirmModal(true)}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Hacer Pedido
              </button>
            </div>
          )}
        </div>
      )}
    </div>

      {/* Modal de Confirmación */}
      {showConfirmModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-semibold mb-4">Confirmar Pedido</h3>
            <div className="border-b pb-4">
              <h4 className="font-medium mb-2">Resumen del pedido:</h4>
              {items.map((item) => (
                <div key={`${item.code}-${item.variant}`} className="flex justify-between text-sm">
                  <span>{`${item.code} - ${item.variant} - x ${item.quantity}`}</span>
                  <span>${(item.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>
            <div className="flex justify-between font-bold mt-4">
              <span>Total</span>
              <span>${total.toFixed(2)}</span>
            </div>
            <div className="flex space-x-4 mt-4">
              <button
                onClick={() => setShowConfirmModal(false)}
                className="flex-1 py-2 border rounded-lg hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                onClick={() => {
                  onConfirmOrder();
                  setShowConfirmModal(false);
                }}
                className="flex-1 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

// Integración con el Catálogo de Productos
const ProductGrid = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [images, setImages] = useState<string[]>([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [clients, setClients] = useState<Client[]>([]);
  const [sellers, setSellers] = useState<Seller[]>([]);
  const [selectedClientId, setSelectedClientId] = useState<string>("");
  const [selectedSellerId, setSelectedSellerId] = useState<string>("");

  type UserRole = "admin" | "seller" | "client";

  const getUserRoleFromLocalStorage = (): UserRole => {
    try {
      const user = localStorage.getItem("user");
      if (!user) return "client"; // Valor predeterminado si no hay usuario
  
      const parsedUser = JSON.parse(user);
      switch (parsedUser.role.toLowerCase()) {
        case "admin":
          return "admin";
        case "vendedor":
          return "seller";
        default:
          return "client";
      }
    } catch (error) {
      console.error("Error al obtener el rol del usuario:", error);
      return "client"; // Valor predeterminado en caso de error
    }
  };
  
  const [userRole, setUserRole] = useState<UserRole>(getUserRoleFromLocalStorage());
  
    
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch(`${API_URL}/articleAvailables`);
        if (!response.ok) throw new Error("Error al cargar los artículos");
        const data = await response.json();
        setProducts(data);
        setFilteredProducts(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  useEffect(() => {
    const lowerCaseTerm = searchTerm.toLowerCase();
    setFilteredProducts(
      products.filter(
        (product) =>
          product.name.toLowerCase().includes(lowerCaseTerm) ||
          product.description.toLowerCase().includes(lowerCaseTerm)
      )
    );
  }, [searchTerm, products]);

  useEffect(() => {
    const fetchClientsAndSellers = async () => {
      try {
        const clientsResponse = await fetch(`${API_URL}/client`);
        const sellersResponse = await fetch(`${API_URL}/sellers`);

        if (!clientsResponse.ok || !sellersResponse.ok)
          throw new Error("Error al cargar clientes o vendedores");

        const clientsData = await clientsResponse.json();
        const sellersData = await sellersResponse.json();

        setClients(clientsData);
        setSellers(sellersData);

        // Establecer valores predeterminados según el tipo de usuario
        if (userRole === "seller" || userRole === "admin") {
          setSelectedSellerId("1"); // Asignar el vendedor actual
        } else if (userRole === "client") {
          setSelectedClientId("1"); // Asignar el cliente actual
        }
      } catch (err: any) {
        console.error("Error al cargar clientes o vendedores:", err);
      }
    };

    fetchClientsAndSellers();
  }, []);

  const fetchImages = async (category: string, articleCode: string, urlImage: string) => {
    try {
      const temporada = urlImage.split("/")[0];
      const response = await fetch(`${API_URL}/upload-images/${temporada}/${category}/${articleCode}?type=normal`);
      if (!response.ok) throw new Error("No se encontraron imágenes");
      const data = await response.json();
      setImages(data.images.map((img: string) => `${API_URL}/images/${img}`));
      setCurrentImageIndex(0);
    } catch (err: any) {
      console.error("Error obteniendo imágenes:", err.message);
    }
  };

  const handleQuantityChange = (product: Product, variant: string, delta: number) => {
    const key = `${product.code}-${variant}`; // Generamos una clave única para el producto y variante
    
    setQuantities((prev) => ({
      ...prev,
      [key]: Math.max(0, (prev[key] || 0) + delta),
    }));
  };

  const handleAddToCart = (product: Product, variant: string) => {
    const key = `${product.code}-${variant}`;
    const quantity = quantities[key] || 0;
  
    if (quantity > 0) {
      setCartItems((prevItems) => [
        ...prevItems,
        { id: product.id, code: product.code, name: product.name, price: product.price, quantity, variant },
      ]);
  
      // Limpiar cantidad después de agregar al carrito
      setQuantities((prev) => ({ ...prev, [key]: 0 }));
    }
  };
  

  const removeFromCart = (code: string, variant: string) => {
    setCartItems((prevItems) =>
      prevItems.filter((item) => !(item.code === code && item.variant === variant))
    );
  };

  const updateCartItemQuantity = (code: string, variant: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeFromCart(code, variant); // Llamamos con code y variant
      return;
    }
  
    setCartItems((prevItems) =>
      prevItems.map((item) =>
        item.code === code && item.variant === variant
          ? { ...item, quantity: newQuantity }
          : item
      )
    );
  };

  const confirmOrder = async () => {

    const order = {
      header: {
        clientId: Number(selectedClientId),
        sellerId: userRole === "client" ? null : Number(selectedSellerId),
        comments: "Pedido desde frontend",
      },
      details: cartItems.map((item) => ({
        articleCode: item.code,
        variant: item.variant, // Incluimos la variante real
        quantity: item.quantity,
      })),
    };
  
    try {
      const response = await fetch(`${API_URL}/cart`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(order),
      });
  
      if (!response.ok) throw new Error("Error al procesar el pedido");
  
      alert("Pedido realizado con éxito");
      setCartItems([]);
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <div className="min-h-screen w-screen bg-gray-100">
      <Navbar />
      <div className="container mx-auto py-1 relative">
        <h1 className="text-3xl font-bold text-gray-900 mb-6 text-center">Catálogo de Productos</h1>

        <div className="grid grid-cols-2 gap-6 mb-6">
          {/* Dropdown para elegir Cliente */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Cliente</label>
            <select
              value={selectedClientId}
              onChange={(e) => setSelectedClientId(e.target.value)}
              disabled={userRole === "client"}
              className={`w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                userRole === "client" ? "bg-gray-100 cursor-not-allowed" : ""
              }`}
            >
              <option value="">Seleccionar Cliente</option>
              {clients.map((client) => (
                <option key={client.id} value={client.id}>
                  {client.name}
                </option>
              ))}
            </select>
          </div>

          {/* Dropdown para elegir Vendedor */}
          {userRole !== "client" && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Vendedor</label>
              <select
                value={selectedSellerId}
                onChange={(e) => setSelectedSellerId(e.target.value)}
                disabled={userRole === "seller"}
                className={`w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                  userRole === "seller" ? "bg-gray-100 cursor-not-allowed" : ""
                }`}
              >
                <option value="">Seleccionar Vendedor</option>
                {sellers.map((seller) => (
                  <option key={seller.id} value={seller.id}>
                    {seller.name}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

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
        {!loading && !error && filteredProducts.length === 0 && (
          <p className="text-center text-gray-600">No se encontraron productos</p>
        )}

        {!loading && !error && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredProducts.map((product) => (
              <div key={product.id} className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300">

                <div className="relative h-64 sm:h-72 md:h-80 lg:h-96 flex items-center justify-center bg-gray-100">
                  <img
                    src={`${API_URL}/uploads/images/${product.urlImage}/${product.code}-1.jpg`}
                    alt={product.name}
                    className="max-h-full max-w-full object-contain"
                  />

                  <button
                    onClick={() => { setSelectedProduct(product); fetchImages(product.category, product.code, product.urlImage); }}
                    className="absolute top-2 right-2 p-2 bg-white rounded-full shadow-md hover:bg-gray-100"
                  >
                    <Maximize2 className="w-4 h-4 text-gray-600" />
                  </button>
                </div>
                  <h3 className="text-lg font-semibold mb-2">{product.name}</h3>
                  <p className="text-gray-600 text-sm mb-3">{product.description}</p>
                  <div className="flex items-center justify-between mb-3">
                  <span className="text-2xl font-bold text-red-900 sm:text-black">
                      ${product.price.toFixed(2)}
                    </span>
                    <span className="text-sm text-gray-500 px-2 py-1 bg-gray-100 rounded">
                      {product.category}
                    </span>
                  </div>
                  
              </div>
            ))}
          </div>
        )}

        {selectedProduct && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-2xl w-full">
              <div className="p-4 border-b flex justify-between items-center">
                <h3 className="text-lg font-semibold">{selectedProduct.name}</h3>
                <button
                  onClick={() => setSelectedProduct(null)}
                  className="p-1 hover:bg-gray-100 rounded-full"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              <div className="p-4 border-b flex justify-between items-center">
                <button onClick={() => setCurrentImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1))}>{"<"}</button>
                <img src={images[currentImageIndex]} className="w-full h-64 object-contain" alt={selectedProduct.name} />
                <button onClick={() => setCurrentImageIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1))}>{">"}</button>
              </div>
              <div className="p-4">
                <h3 className="text-lg font-semibold">{selectedProduct.description}</h3>
                <ul>
                {selectedProduct.available?.code_available.split(",").map((variant) => (
                  <li key={variant} className="flex justify-between items-center border-b py-2">
                    <span>{variant}</span>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleQuantityChange(selectedProduct, variant, -1)}
                        className="p-1 rounded-full bg-gray-100 hover:bg-gray-200"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="w-8 text-center">
                        {quantities[`${selectedProduct.code}-${variant}`] || 0}
                      </span>
                      <button
                        onClick={() => handleQuantityChange(selectedProduct, variant, 1)}
                        className="p-1 rounded-full bg-gray-100 hover:bg-gray-200"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleAddToCart(selectedProduct, variant)}
                        className="flex items-center px-4 py-2 bg-red-900 sm:bg-black text-white rounded-lg hover:bg-red-800 sm:hover:bg-gray-800 transition-colors"
                        disabled={!quantities[`${selectedProduct.code}-${variant}`]} // Verifica si hay cantidad seleccionada
                      >
                        <ShoppingCart className="w-4 h-4 mr-2" />
                        Agregar
                      </button>
                    </div>
                  </li>
                ))}
              </ul>

              </div>
            </div>
          </div>
        )}
        </div>

      <FloatingCart items={cartItems} onRemoveItem={removeFromCart} onUpdateQuantity={updateCartItemQuantity} onConfirmOrder={confirmOrder} />
    </div>
  );
};

export default ProductGrid;
