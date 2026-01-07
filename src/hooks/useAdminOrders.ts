import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { OrderStatus } from "@/hooks/useOrders";

export interface AdminOrderItem {
  id: string;
  order_id: string;
  product_id: number;
  product_name: string;
  product_image: string;
  price: number;
  quantity: number;
  created_at: string;
}

export interface AdminOrder {
  id: string;
  user_id: string;
  status: OrderStatus;
  total: number;
  created_at: string;
  updated_at: string;
  pix_transaction_id: string | null;
  pix_qrcode: string | null;
  pix_expires_at: string | null;
  deliverable: string | null;
  items?: AdminOrderItem[];
  user_email?: string;
  user_profile?: {
    display_name: string | null;
    phone: string | null;
  };
}

export const useAdminOrders = () => {
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = async () => {
    setLoading(true);
    
    // Fetch all orders
    const { data: ordersData, error: ordersError } = await supabase
      .from("orders")
      .select("*")
      .order("created_at", { ascending: false });

    if (ordersError) {
      console.error("Error fetching orders:", ordersError);
      toast({
        title: "Erro ao carregar pedidos",
        description: ordersError.message,
        variant: "destructive",
      });
      setLoading(false);
      return;
    }

    // Fetch items and profile for each order
    const ordersWithDetails = await Promise.all(
      (ordersData || []).map(async (order) => {
        // Fetch order items
        const { data: itemsData } = await supabase
          .from("order_items")
          .select("*")
          .eq("order_id", order.id);

        // Fetch user profile
        const { data: profileData } = await supabase
          .from("profiles")
          .select("display_name, phone")
          .eq("user_id", order.user_id)
          .maybeSingle();

        return {
          ...order,
          items: itemsData || [],
          user_profile: profileData || undefined,
        } as AdminOrder;
      })
    );

    setOrders(ordersWithDetails);
    setLoading(false);
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const updateOrderStatus = async (orderId: string, status: OrderStatus) => {
    const { error } = await supabase
      .from("orders")
      .update({ status })
      .eq("id", orderId);

    if (error) {
      toast({
        title: "Erro ao atualizar status",
        description: error.message,
        variant: "destructive",
      });
      return { error };
    }

    toast({
      title: "Status atualizado!",
      description: `Pedido alterado para "${status}"`,
    });

    await fetchOrders();
    return { error: null };
  };

  const updateOrderDeliverable = async (orderId: string, deliverable: string) => {
    const { error } = await supabase
      .from("orders")
      .update({ deliverable, status: "delivered" as OrderStatus })
      .eq("id", orderId);

    if (error) {
      toast({
        title: "Erro ao atualizar entregável",
        description: error.message,
        variant: "destructive",
      });
      return { error };
    }

    toast({
      title: "Entregável adicionado!",
      description: "O cliente agora pode ver o produto.",
    });

    await fetchOrders();
    return { error: null };
  };

  return {
    orders,
    loading,
    updateOrderStatus,
    updateOrderDeliverable,
    refreshOrders: fetchOrders,
  };
};
