import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { API_URL } from "../config";

const UploadArticleForm = () => {
  const navigate = useNavigate();
  const [albumId, setAlbumId] = useState("");
  const [category, setCategory] = useState("");
  const [images, setImages] = useState<File[]>([]);
  const [previewImages, setPreviewImages] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files);
      setImages(selectedFiles);
      const previews = selectedFiles.map((file) => URL.createObjectURL(file));
      setPreviewImages(previews);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    if (!albumId || !category || images.length === 0) {
      setError("Todos los campos son obligatorios.");
      setIsLoading(false);
      return;
    }

    try {
      const formData = new FormData();
      images.forEach((image) => formData.append("images", image));

      const response = await fetch(`${API_URL}/upload-images/${albumId}/${category}`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) throw new Error("Error al subir las imágenes");

      const data = await response.json();
      console.log("Respuesta del servidor:", data);

      navigate("/home");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-screen bg-gray-100">
      <Navbar />

      <div className="flex justify-center items-center h-full">
        <div className="w-full max-w-3xl bg-white p-8 sm:p-10 rounded-xl shadow-lg">
          <h1 className="text-3xl font-bold text-gray-900 mb-6 text-center">
            Subir Artículo con Imágenes
          </h1>

          {error && <p className="text-center text-red-500">{error}</p>}

          <div className="sm:hidden bg-orange-100 border-l-4 border-orange-600 shadow-md rounded-lg p-4 mb-3">
            <form className="space-y-4" onSubmit={handleSubmit}>
              <div>
                <label className="block text-sm font-medium text-gray-700">Album ID</label>
                <input
                  type="text"
                  value={albumId}
                  onChange={(e) => setAlbumId(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring focus:ring-orange-200"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Categoría</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring focus:ring-orange-200"
                  required
                >
                  <option value="">Seleccionar categoría</option>
                  <option value="remeras">Remeras</option>
                  <option value="camisas">Camisas</option>
                  <option value="pantalones">Pantalones</option>
                  <option value="shorts">Shorts</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Seleccionar Imágenes
                </label>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImageChange}
                  className="w-full p-2 border border-gray-300 rounded-md"
                />
              </div>

              {previewImages.length > 0 && (
                <div className="grid grid-cols-3 gap-4 mt-4">
                  {previewImages.map((src, index) => (
                    <img
                      key={index}
                      src={src}
                      alt={`preview-${index}`}
                      className="w-full h-24 object-cover rounded-md border"
                    />
                  ))}
                </div>
              )}

              <div className="flex justify-center">
                <button
                  type="submit"
                  disabled={isLoading}
                  className={`px-4 py-2 text-white font-medium rounded-md ${
                    isLoading
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-orange-600 hover:bg-orange-700"
                  } transition-colors`}
                >
                  {isLoading ? "Subiendo..." : "Subir Artículo"}
                </button>
              </div>
            </form>
          </div>

          <form className="hidden sm:block space-y-4" onSubmit={handleSubmit}>
            <div>
              <label className="block text-sm font-medium text-gray-700">Album ID</label>
              <input
                type="text"
                value={albumId}
                onChange={(e) => setAlbumId(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring focus:ring-indigo-200"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Categoría</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring focus:ring-indigo-200"
                required
              >
                <option value="">Seleccionar categoría</option>
                <option value="remeras">Remeras</option>
                <option value="camisas">Camisas</option>
                <option value="pantalones">Pantalones</option>
                <option value="shorts">Shorts</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Seleccionar Imágenes
              </label>
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleImageChange}
                className="w-full p-2 border border-gray-300 rounded-md"
              />
            </div>

            {previewImages.length > 0 && (
              <div className="grid grid-cols-3 gap-4 mt-4">
                {previewImages.map((src, index) => (
                  <img
                    key={index}
                    src={src}
                    alt={`preview-${index}`}
                    className="w-full h-24 object-cover rounded-md border"
                  />
                ))}
              </div>
            )}

            <div className="flex justify-center">
            <button
                  type="submit"
                  disabled={isLoading}
                  className={`px-4 py-2 text-white font-medium rounded-md ${
                    isLoading ? "bg-gray-500 cursor-not-allowed" : "bg-black hover:bg-gray-700"
                  } transition-colors`}
                >
                {isLoading ? "Subiendo..." : "Subir Artículo"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default UploadArticleForm;
