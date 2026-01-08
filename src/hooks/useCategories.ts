import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

export interface Category {
  id: string;
  name: string;
  icon: string;
  display_order: number;
  is_active: boolean;
}

export interface CategoryWithCount extends Category {
  product_count: number;
}

export const useCategories = () => {
  const [categories, setCategories] = useState<CategoryWithCount[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCategories = async () => {
    try {
      // Fetch categories
      const { data: categoriesData, error: categoriesError } = await supabase
        .from("categories")
        .select("*")
        .order("display_order", { ascending: true });

      if (categoriesError) throw categoriesError;

      // Fetch product counts per category
      const { data: products, error: productsError } = await supabase
        .from("products")
        .select("category")
        .eq("is_active", true);

      if (productsError) throw productsError;

      // Count products per category
      const countMap: Record<string, number> = {};
      products?.forEach((product) => {
        const cat = product.category;
        countMap[cat] = (countMap[cat] || 0) + 1;
      });

      // Combine categories with counts
      const categoriesWithCount: CategoryWithCount[] = (categoriesData || []).map((cat) => ({
        ...cat,
        product_count: countMap[cat.name] || 0,
      }));

      setCategories(categoriesWithCount);
    } catch (error) {
      console.error("Error fetching categories:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  return { categories, loading, refreshCategories: fetchCategories };
};

export const useAdminCategories = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from("categories")
        .select("*")
        .order("display_order", { ascending: true });

      if (error) throw error;
      setCategories(data || []);
    } catch (error) {
      console.error("Error fetching categories:", error);
    } finally {
      setLoading(false);
    }
  };

  const createCategory = async (name: string, icon: string = "Zap") => {
    try {
      const maxOrder = categories.reduce((max, cat) => Math.max(max, cat.display_order), 0);
      const { error } = await supabase
        .from("categories")
        .insert({ name, icon, display_order: maxOrder + 1 });

      if (error) throw error;
      toast({ title: "Categoria criada com sucesso!" });
      fetchCategories();
    } catch (error: any) {
      toast({ title: "Erro ao criar categoria", description: error.message, variant: "destructive" });
    }
  };

  const deleteCategory = async (id: string) => {
    try {
      const { error } = await supabase.from("categories").delete().eq("id", id);
      if (error) throw error;
      toast({ title: "Categoria removida!" });
      fetchCategories();
    } catch (error: any) {
      toast({ title: "Erro ao remover categoria", description: error.message, variant: "destructive" });
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  return { categories, loading, createCategory, deleteCategory, refreshCategories: fetchCategories };
};
