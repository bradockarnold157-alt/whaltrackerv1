import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

export interface AdminUser {
  id: string;
  email: string;
  created_at: string;
  last_sign_in_at: string | null;
  display_name: string | null;
  phone: string | null;
  avatar_url: string | null;
  // Order statistics
  total_orders: number;
  pending_orders: number;
  completed_orders: number;
  total_spent: number;
  last_order_date: string | null;
  has_purchased: boolean;
}

export const useAdminUsers = () => {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchUsers = async () => {
    setLoading(true);

    const { data, error } = await supabase.functions.invoke("get-users");

    if (error) {
      console.error("Error fetching users:", error);
      toast({
        title: "Erro ao carregar usuários",
        description: error.message,
        variant: "destructive",
      });
      setLoading(false);
      return;
    }

    setUsers(data?.users || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  return {
    users,
    loading,
    refreshUsers: fetchUsers,
  };
};
