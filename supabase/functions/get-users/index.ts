import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface Profile {
  user_id: string;
  display_name: string | null;
  phone: string | null;
  avatar_url: string | null;
}

interface AuthUser {
  id: string;
  email?: string;
  created_at: string;
  last_sign_in_at?: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Não autorizado" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;

    // First verify the user is admin using their token
    const userClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const rpcResult = await (userClient.rpc("is_admin") as any);
    
    if (rpcResult.error || !rpcResult.data) {
      return new Response(
        JSON.stringify({ error: "Acesso negado. Apenas administradores." }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Use service role to access auth.users
    const adminClient = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    }) as any;

    // Get all users from auth.users using admin API
    const listUsersResult = await adminClient.auth.admin.listUsers();

    if (listUsersResult.error) {
      console.error("Error fetching users:", listUsersResult.error);
      return new Response(
        JSON.stringify({ error: "Erro ao buscar usuários" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get profiles for additional info
    const profilesResult = await (adminClient
      .from("profiles")
      .select("*") as any);

    if (profilesResult.error) {
      console.error("Error fetching profiles:", profilesResult.error);
    }

    const profiles = (profilesResult.data || []) as Profile[];
    const authUsers = (listUsersResult.data?.users || []) as AuthUser[];

    // Combine users with profiles
    const users = authUsers.map((user: AuthUser) => {
      const profile = profiles.find((p: Profile) => p.user_id === user.id);
      return {
        id: user.id,
        email: user.email || null,
        created_at: user.created_at,
        last_sign_in_at: user.last_sign_in_at || null,
        display_name: profile?.display_name || null,
        phone: profile?.phone || null,
        avatar_url: profile?.avatar_url || null,
      };
    });

    return new Response(
      JSON.stringify({ users }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in get-users function:", error);
    return new Response(
      JSON.stringify({ error: "Erro interno do servidor" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
