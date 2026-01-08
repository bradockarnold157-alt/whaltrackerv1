import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const useStoreSettings = () => {
  const [minimumOrderValue, setMinimumOrderValue] = useState<number>(20);
  const [pixDiscount, setPixDiscount] = useState<number>(5);
  const [loading, setLoading] = useState(true);

  const fetchSettings = async () => {
    try {
      const { data, error } = await supabase
        .from("store_settings")
        .select("*");

      if (error) {
        console.error("Error fetching settings:", error);
        return;
      }

      if (data) {
        data.forEach((setting) => {
          if (setting.key === "minimum_order_value") {
            setMinimumOrderValue(parseFloat(setting.value));
          } else if (setting.key === "pix_discount") {
            setPixDiscount(parseFloat(setting.value));
          }
        });
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

  const updatePixDiscount = async (value: number) => {
    try {
      // First try to update, if no row exists, insert
      const { data: existing } = await supabase
        .from("store_settings")
        .select("id")
        .eq("key", "pix_discount")
        .maybeSingle();

      let error;
      if (existing) {
        const result = await supabase
          .from("store_settings")
          .update({ value: value.toString() })
          .eq("key", "pix_discount");
        error = result.error;
      } else {
        const result = await supabase
          .from("store_settings")
          .insert({ key: "pix_discount", value: value.toString() });
        error = result.error;
      }

      if (error) {
        toast.error("Erro ao atualizar desconto PIX");
        console.error("Error updating setting:", error);
        return false;
      }

      setPixDiscount(value);
      toast.success("Desconto PIX atualizado com sucesso!");
      return true;
    } catch (error) {
      console.error("Error:", error);
      toast.error("Erro ao atualizar desconto PIX");
      return false;
    }
  };

  useEffect(() => {
    fetchSettings();

    // Subscribe to realtime updates so all clients get the new values
    const channel = supabase
      .channel("store_settings_changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "store_settings",
        },
        (payload) => {
          const newData = payload.new as { key: string; value: string } | undefined;
          if (newData) {
            if (newData.key === "minimum_order_value") {
              setMinimumOrderValue(parseFloat(newData.value));
            } else if (newData.key === "pix_discount") {
              setPixDiscount(parseFloat(newData.value));
            }
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return {
    minimumOrderValue,
    pixDiscount,
    loading,
    updateMinimumOrderValue,
    updatePixDiscount,
    refreshSettings: fetchSettings,
  };
};
