import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

export interface ProductStock {
  id: string;
  product_id: number;
  credential: string;
  is_available: boolean;
  assigned_order_id: string | null;
  created_at: string;
  assigned_at: string | null;
}

export const useProductStock = () => {
  const [stockByProduct, setStockByProduct] = useState<Record<number, ProductStock[]>>({});
  const [loading, setLoading] = useState(false);

  const fetchStockForProduct = async (productId: number) => {
    const { data, error } = await supabase
      .from("product_stock")
      .select("*")
      .eq("product_id", productId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching stock:", error);
      return [];
    }

    setStockByProduct((prev) => ({
      ...prev,
      [productId]: data || [],
    }));

    return data || [];
  };

  const getAvailableCount = (productId: number): number => {
    const stock = stockByProduct[productId] || [];
    return stock.filter((s) => s.is_available).length;
  };

  const importStock = async (productId: number, credentials: string[]) => {
    setLoading(true);

    const stockItems = credentials
      .map((c) => c.trim())
      .filter((c) => c.length > 0)
      .map((credential) => ({
        product_id: productId,
        credential,
        is_available: true,
      }));

    if (stockItems.length === 0) {
      toast({
        title: "Nenhum item válido",
        description: "Verifique o formato do texto importado.",
        variant: "destructive",
      });
      setLoading(false);
      return { error: true };
    }

    const { error } = await supabase.from("product_stock").insert(stockItems);

    if (error) {
      toast({
        title: "Erro ao importar estoque",
        description: error.message,
        variant: "destructive",
      });
      setLoading(false);
      return { error: true };
    }

    toast({
      title: "Estoque importado!",
      description: `${stockItems.length} itens adicionados com sucesso.`,
    });

    await fetchStockForProduct(productId);
    setLoading(false);
    return { error: false };
  };

  const deleteStockItem = async (stockId: string, productId: number) => {
    const { error } = await supabase
      .from("product_stock")
      .delete()
      .eq("id", stockId);

    if (error) {
      toast({
        title: "Erro ao remover item",
        description: error.message,
        variant: "destructive",
      });
      return { error: true };
    }

    await fetchStockForProduct(productId);
    return { error: false };
  };

  const clearAvailableStock = async (productId: number) => {
    const { error } = await supabase
      .from("product_stock")
      .delete()
      .eq("product_id", productId)
      .eq("is_available", true);

    if (error) {
      toast({
        title: "Erro ao limpar estoque",
        description: error.message,
        variant: "destructive",
      });
      return { error: true };
    }

    toast({
      title: "Estoque limpo!",
      description: "Todos os itens disponíveis foram removidos.",
    });

    await fetchStockForProduct(productId);
    return { error: false };
  };

  const assignRandomStock = async (productId: number, orderId: string): Promise<string | null> => {
    // Get a random available stock item
    const { data, error } = await supabase
      .from("product_stock")
      .select("*")
      .eq("product_id", productId)
      .eq("is_available", true)
      .limit(1);

    if (error || !data || data.length === 0) {
      console.error("No stock available for product:", productId);
      return null;
    }

    const stockItem = data[0];

    // Mark as assigned
    const { error: updateError } = await supabase
      .from("product_stock")
      .update({
        is_available: false,
        assigned_order_id: orderId,
        assigned_at: new Date().toISOString(),
      })
      .eq("id", stockItem.id);

    if (updateError) {
      console.error("Error assigning stock:", updateError);
      return null;
    }

    return stockItem.credential;
  };

  return {
    stockByProduct,
    loading,
    fetchStockForProduct,
    getAvailableCount,
    importStock,
    deleteStockItem,
    clearAvailableStock,
    assignRandomStock,
  };
};
