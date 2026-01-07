import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

export interface Product {
  id: number;
  name: string;
  description: string | null;
  price: number;
  original_price: number | null;
  image: string;
  category: string;
  badge: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ProductInsert {
  name: string;
  description?: string;
  price: number;
  original_price?: number;
  image: string;
  category: string;
  badge?: string;
  is_active?: boolean;
}

// Hook for public product listing
export const usePublicProducts = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchProducts = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .eq("is_active", true)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching products:", error);
    } else {
      setProducts(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const getProductById = async (id: number): Promise<Product | null> => {
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .eq("id", id)
      .eq("is_active", true)
      .maybeSingle();

    if (error) {
      console.error("Error fetching product:", error);
      return null;
    }

    return data;
  };

  return {
    products,
    loading,
    getProductById,
    refreshProducts: fetchProducts,
  };
};

// Hook for admin product management
export const useProducts = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchProducts = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching products:", error);
      toast({
        title: "Erro ao carregar produtos",
        description: error.message,
        variant: "destructive",
      });
    } else {
      setProducts(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const createProduct = async (product: ProductInsert) => {
    const { data, error } = await supabase
      .from("products")
      .insert(product)
      .select()
      .single();

    if (error) {
      toast({
        title: "Erro ao criar produto",
        description: error.message,
        variant: "destructive",
      });
      return { error };
    }

    toast({
      title: "Produto criado!",
      description: `${product.name} foi adicionado com sucesso.`,
    });

    await fetchProducts();
    return { data };
  };

  const updateProduct = async (id: number, updates: Partial<ProductInsert>) => {
    const { error } = await supabase
      .from("products")
      .update(updates)
      .eq("id", id);

    if (error) {
      toast({
        title: "Erro ao atualizar produto",
        description: error.message,
        variant: "destructive",
      });
      return { error };
    }

    toast({
      title: "Produto atualizado!",
      description: "As alterações foram salvas.",
    });

    await fetchProducts();
    return { error: null };
  };

  const deleteProduct = async (id: number) => {
    const { error } = await supabase
      .from("products")
      .delete()
      .eq("id", id);

    if (error) {
      toast({
        title: "Erro ao excluir produto",
        description: error.message,
        variant: "destructive",
      });
      return { error };
    }

    toast({
      title: "Produto excluído!",
      description: "O produto foi removido.",
    });

    await fetchProducts();
    return { error: null };
  };

  const toggleProductStatus = async (id: number, isActive: boolean) => {
    return updateProduct(id, { is_active: isActive });
  };

  return {
    products,
    loading,
    createProduct,
    updateProduct,
    deleteProduct,
    toggleProductStatus,
    refreshProducts: fetchProducts,
  };
};
