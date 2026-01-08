import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const useStoreSettings = () => {
  const [minimumOrderValue, setMinimumOrderValue] = useState<number>(20);
  const [loading, setLoading] = useState(true);

  const fetchSettings = async () => {
    try {
      const { data, error } = await supabase
        .from("store_settings")
        .select("*")
        .eq("key", "minimum_order_value")
        .single();

      if (error && error.code !== "PGRST116") {
        console.error("Error fetching settings:", error);
        return;
      }

      if (data) {
        setMinimumOrderValue(parseFloat(data.value));
      }
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const updateMinimumOrderValue = async (value: number) => {
    try {
      const { error } = await supabase
        .from("store_settings")
        .update({ value: value.toString() })
        .eq("key", "minimum_order_value");

      if (error) {
        toast.error("Erro ao atualizar valor mínimo");
        console.error("Error updating setting:", error);
        return false;
      }

      setMinimumOrderValue(value);
      toast.success("Valor mínimo atualizado com sucesso!");
      return true;
    } catch (error) {
      console.error("Error:", error);
      toast.error("Erro ao atualizar valor mínimo");
      return false;
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  return {
    minimumOrderValue,
    loading,
    updateMinimumOrderValue,
    refreshSettings: fetchSettings,
  };
};
