import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export const useStockAvailability = (productIds: number[]) => {
  const [stockCounts, setStockCounts] = useState<Record<number, number>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStockCounts = async () => {
      if (productIds.length === 0) {
        setLoading(false);
        return;
      }

      setLoading(true);
      const counts: Record<number, number> = {};

      await Promise.all(
        productIds.map(async (productId) => {
          const { data, error } = await supabase.rpc("get_available_stock_count", {
            p_product_id: productId,
          });

          if (!error && data !== null) {
            counts[productId] = data;
          } else {
            counts[productId] = 0;
          }
        })
      );

      setStockCounts(counts);
      setLoading(false);
    };

    fetchStockCounts();
  }, [productIds.join(",")]);

  const getStockCount = (productId: number): number => {
    return stockCounts[productId] ?? 0;
  };

  const hasStock = (productId: number): boolean => {
    return getStockCount(productId) > 0;
  };

  return { stockCounts, loading, getStockCount, hasStock };
};

export const useSingleStockAvailability = (productId: number) => {
  const [stockCount, setStockCount] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStockCount = async () => {
      setLoading(true);
      const { data, error } = await supabase.rpc("get_available_stock_count", {
        p_product_id: productId,
      });

      if (!error && data !== null) {
        setStockCount(data);
      } else {
        setStockCount(0);
      }
      setLoading(false);
    };

    fetchStockCount();
  }, [productId]);

  return { stockCount, loading, hasStock: stockCount > 0 };
};
