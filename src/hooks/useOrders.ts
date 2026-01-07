import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useCart } from "@/contexts/CartContext";

export type OrderStatus = "pending" | "approved" | "processing" | "shipped" | "delivered" | "cancelled";

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: number;
  product_name: string;
  product_image: string;
  price: number;
  quantity: number;
  created_at: string;
}

export interface Order {
  id: string;
  user_id: string;
  status: OrderStatus;
  total: number;
  created_at: string;
  updated_at: string;
  items?: OrderItem[];
}

export const useOrders = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { items: cartItems, totalPrice, clearCart } = useCart();

  const fetchOrders = async () => {
    if (!user) {
      setOrders([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const { data: ordersData, error } = await supabase
      .from("orders")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Erro ao buscar pedidos:", error);
      setLoading(false);
      return;
    }

    // Fetch items for each order
    const ordersWithItems = await Promise.all(
      (ordersData || []).map(async (order) => {
        const { data: itemsData } = await supabase
          .from("order_items")
          .select("*")
          .eq("order_id", order.id);

        return {
          ...order,
          items: itemsData || [],
        } as Order;
      })
    );

    setOrders(ordersWithItems);
    setLoading(false);
  };

  useEffect(() => {
    fetchOrders();
  }, [user]);

  const createOrder = async () => {
    if (!user || cartItems.length === 0) {
      return { error: new Error("Carrinho vazio ou não autenticado") };
    }

    // Create order
    const { data: orderData, error: orderError } = await supabase
      .from("orders")
      .insert({
        user_id: user.id,
        total: totalPrice,
        status: "pending" as OrderStatus,
      })
      .select()
      .single();

    if (orderError) {
      return { error: orderError };
    }

    // Create order items
    const orderItems = cartItems.map((item) => ({
      order_id: orderData.id,
      product_id: item.id,
      product_name: item.name,
      product_image: item.image,
      price: item.price,
      quantity: item.quantity,
    }));

    const { error: itemsError } = await supabase
      .from("order_items")
      .insert(orderItems);

    if (itemsError) {
      return { error: itemsError };
    }

    clearCart();
    await fetchOrders();
    return { error: null, order: orderData };
  };

  return {
    orders,
    loading,
    createOrder,
    refreshOrders: fetchOrders,
  };
};
