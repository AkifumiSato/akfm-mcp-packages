import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";

type Product = {
  id: number;
  title: string;
  description: string;
  price: number;
  category: string;
  image: string;
  rating: {
    rate: number;
    count: number;
  };
};

type ProductProps = {
  productId?: number;
};

const fetchProduct = async (id: number): Promise<Product> => {
  const response = await fetch(`https://dummyjson.com/products/${id}`);
  if (!response.ok) {
    throw new Error("Failed to fetch product");
  }
  return response.json();
};

export const Product = ({ productId = 1 }: ProductProps) => {
  const {
    data: product,
    isLoading,
    error,
  } = useQuery({
    queryFn: () => fetchProduct(productId),
    queryKey: ["product", productId],
  });

  useEffect(() => {
    // Test console message.
    console.info("Custom Message.");
    console.log("Custom Message.");
    console.warn("Custom Message.");
    console.error("Custom Message.");
  }, []);

  if (isLoading) {
    return (
      <div className="p-4 border rounded-lg shadow-sm">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded mb-2"></div>
          <div className="h-4 bg-gray-200 rounded mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-2/3"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 border border-red-200 rounded-lg bg-red-50">
        <p className="text-red-600">Error loading product: {error.message}</p>
      </div>
    );
  }

  if (!product) {
    return null;
  }

  return (
    <div className="max-w-sm p-4 border rounded-lg shadow-sm bg-white">
      <img
        src={product.image}
        alt={product.title}
        className="w-full h-48 object-cover rounded-md mb-4"
      />
      <h2 className="text-xl font-semibold mb-2">{product.title}</h2>
      <p className="text-gray-600 text-sm mb-3">{product.description}</p>
      <div className="flex items-center justify-between mb-2">
        <span className="text-2xl font-bold text-green-600">
          ${product.price}
        </span>
        <span className="text-sm text-gray-500 capitalize">
          {product.category}
        </span>
      </div>
      <div className="flex items-center">
        <span className="text-yellow-500">★</span>
        <span className="text-sm text-gray-600 ml-1">
          {product.rating.rate} ({product.rating.count} reviews)
        </span>
      </div>
    </div>
  );
};
