import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const PIX_API_BASE = "https://mlanonovo.shop/apipix";
const CLIENT_ID = "law_3E33F642";

// Prevent float precision issues like 7.600000000000001 (provider may reject it).
const normalizeAmount = (value: unknown) => {
  if (typeof value !== "number" || !Number.isFinite(value)) return value;
  return Math.round((value + Number.EPSILON) * 100) / 100;
};

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { action, amount, transactionId } = await req.json();
    const normalizedAmount = normalizeAmount(amount);

    const origin = req.headers.get("origin") ?? undefined;
    const providerHeaders: Record<string, string> = {
      "Content-Type": "application/json",
      "Accept": "application/json",
      "User-Agent":
        req.headers.get("user-agent") ??
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      ...(origin ? { "Origin": origin } : {}),
    };

    if (action === "generate") {
      // The provider occasionally returns transient errors.
      // Retry with exponential backoff to reduce checkout friction.
      let lastData: unknown = null;

      for (let attempt = 0; attempt < 5; attempt++) {
        if (attempt > 0) {
          await sleep(500 * Math.pow(2, attempt - 1)); // 0.5s, 1s, 2s, 4s
        }

        const response = await fetch(`${PIX_API_BASE}/gerar-pagamento.php`, {
          method: "POST",
          headers: providerHeaders,
          body: JSON.stringify({
            amount: normalizedAmount,
            client_id: CLIENT_ID,
          }),
        });

        const data = await response.json().catch(() => null);
        lastData = data;

        // Success criteria in current provider format
        if (response.ok && data?.qrCodeResponse?.transactionId) {
          return new Response(JSON.stringify(data), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
      }

      return new Response(JSON.stringify(lastData ?? { error: "Erro ao gerar pagamento" }), {
        status: 502,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (action === "verify") {
      const response = await fetch(`${PIX_API_BASE}/verificar.php?id=${transactionId}`, {
        method: "POST",
        headers: providerHeaders,
        body: JSON.stringify({
          amount: normalizedAmount,
          client_id: CLIENT_ID,
        }),
      });

      const data = await response.json().catch(() => null);

      return new Response(JSON.stringify(data), {
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
