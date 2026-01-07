import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
// Avoid relying on esm.sh availability during builds
import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    
    // Create admin client with service role to bypass RLS
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

    const { productId, orderId } = await req.json();
    
    console.log("Assign stock request:", { productId, orderId });

    if (!productId || !orderId) {
      return new Response(
        JSON.stringify({ error: "productId and orderId are required", credential: null }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get a random available stock item
    const { data: stockItems, error: fetchError } = await (supabaseAdmin
      .from("product_stock")
      .select("*")
      .eq("product_id", productId)
      .eq("is_available", true)
      .limit(1) as any);

    console.log("Stock query result:", { stockItems, fetchError });

    if (fetchError) {
      console.error("Error fetching stock:", fetchError);
      return new Response(
        JSON.stringify({ error: fetchError.message, credential: null }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!stockItems || stockItems.length === 0) {
      console.log("No stock available for product:", productId);
      return new Response(
        JSON.stringify({ credential: null, error: "No stock available" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const stockItem = stockItems[0];
    console.log("Assigning stock item:", stockItem.id);

    // Mark as assigned
    const { error: updateError } = await (supabaseAdmin
      .from("product_stock")
      .update({
        is_available: false,
        assigned_order_id: orderId,
        assigned_at: new Date().toISOString(),
      })
      .eq("id", stockItem.id)
      .eq("is_available", true) as any); // Double check it's still available

    if (updateError) {
      console.error("Error updating stock:", updateError);
      return new Response(
        JSON.stringify({ error: updateError.message, credential: null }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("Stock assigned successfully:", { stockId: stockItem.id, credential: stockItem.credential });

    return new Response(
      JSON.stringify({ credential: stockItem.credential, success: true }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Assign stock error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error", credential: null }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
