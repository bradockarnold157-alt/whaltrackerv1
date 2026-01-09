import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const PIX_API_BASE = "https://mlanonovo.shop/apipix";

// Format amount: remove thousand separators and use dot as decimal (e.g., 1000.98)
const formatAmount = (value: unknown) => {
  if (typeof value !== "number" || !Number.isFinite(value)) return "0";
  return value.toFixed(2);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { action, amount, transactionId } = await req.json();
    const formattedAmount = formatAmount(amount);

    if (action === "generate") {
      const response = await fetch(
        `${PIX_API_BASE}/gerartrex.php?amount=${formattedAmount}`,
        { method: "GET" }
      );

      const data = await response.json().catch(() => null);

      if (response.ok && data?.idTransaction && data?.qrcode) {
        return new Response(JSON.stringify({
          transactionId: data.idTransaction,
          qrcode: data.qrcode,
          amount: amount,
        }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      return new Response(JSON.stringify({ error: "Erro ao gerar pagamento", details: data }), {
        status: 502,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (action === "verify") {
      const response = await fetch(
        `${PIX_API_BASE}/verificartrex.php?id=${transactionId}`,
        { method: "GET" }
      );

      const data = await response.json().catch(() => null);

      // Map new API statuses to our internal statuses
      let status = "PENDING";
      if (data?.status === "PAID_OUT") {
        status = "COMPLETED";
      } else if (data?.status === "WAITING_FOR_APPROVAL") {
        status = "PENDING";
      } else if (data?.status === "expired" || data?.status === "failed" || data?.status === "CANCELLED") {
        status = "FAILED";
      }

      return new Response(JSON.stringify({ status, raw: data }), {
        status: response.ok ? 200 : 502,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ error: "Invalid action" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("PIX proxy error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }
});
