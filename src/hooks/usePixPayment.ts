import { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";

export type PixStatus = "PENDING" | "COMPLETED" | "FAILED" | "RETIDO";

interface PixPaymentData {
  transactionId: string;
  qrcode: string;
  amount: number;
}

interface UsePixPaymentReturn {
  generatePayment: (amount: number) => Promise<PixPaymentData | null>;
  checkPaymentStatus: (transactionId: string, amount: number) => Promise<PixStatus>;
  isGenerating: boolean;
  paymentData: PixPaymentData | null;
  status: PixStatus | null;
  isPolling: boolean;
  startPolling: (transactionId: string, amount: number, onPaid: () => void) => void;
  stopPolling: () => void;
}

// Some totals can become 7.600000000000001 etc due to floating point math.
// The PIX provider is strict and may reject these values.
const normalizeAmount = (amount: number) => Math.round((amount + Number.EPSILON) * 100) / 100;

export const usePixPayment = (): UsePixPaymentReturn => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [paymentData, setPaymentData] = useState<PixPaymentData | null>(null);
  const [status, setStatus] = useState<PixStatus | null>(null);
  const [isPolling, setIsPolling] = useState(false);
  const pollingRef = useRef<NodeJS.Timeout | null>(null);
  const onPaidCallbackRef = useRef<(() => void) | null>(null);

  const generatePayment = useCallback(async (amount: number): Promise<PixPaymentData | null> => {
    setIsGenerating(true);
    try {
      const normalizedAmount = normalizeAmount(amount);

      const { data, error } = await supabase.functions.invoke("pix-proxy", {
        body: {
          action: "generate",
          amount: normalizedAmount,
        },
      });

      if (error) {
        console.error("Erro ao gerar PIX:", error);
        return null;
      }

      if (data?.transactionId && data?.qrcode) {
        const pixData: PixPaymentData = {
          transactionId: data.transactionId,
          qrcode: data.qrcode,
          amount: data.amount ?? normalizedAmount,
        };
        setPaymentData(pixData);
        setStatus("PENDING");
        return pixData;
      }

      console.error("Erro ao gerar PIX:", data);
      return null;
    } catch (error) {
      console.error("Erro ao gerar pagamento PIX:", error);
      return null;
    } finally {
      setIsGenerating(false);
    }
  }, []);

  const checkPaymentStatus = useCallback(async (transactionId: string, amount: number): Promise<PixStatus> => {
    try {
      const normalizedAmount = normalizeAmount(amount);

      const { data, error } = await supabase.functions.invoke("pix-proxy", {
        body: {
          action: "verify",
          transactionId,
          amount: normalizedAmount,
        },
      });

      if (error) {
        console.error("Erro ao verificar status:", error);
        return "PENDING";
      }

      const newStatus = (data?.status as PixStatus) ?? "PENDING";
      setStatus(newStatus);
      return newStatus;
    } catch (error) {
      console.error("Erro ao verificar status:", error);
      return "PENDING";
    }
  }, []);

  const stopPolling = useCallback(() => {
    if (pollingRef.current) {
      clearInterval(pollingRef.current);
      pollingRef.current = null;
    }
    setIsPolling(false);
  }, []);

  const startPolling = useCallback((transactionId: string, amount: number, onPaid: () => void) => {
    stopPolling();
    setIsPolling(true);
    onPaidCallbackRef.current = onPaid;

    const pollOnce = async (): Promise<PixStatus> => {
      const currentStatus = await checkPaymentStatus(transactionId, amount);

      if (currentStatus === "COMPLETED") {
        stopPolling();
        onPaidCallbackRef.current?.();
        return currentStatus;
      }

      if (currentStatus === "FAILED" || currentStatus === "RETIDO") {
        stopPolling();
        return currentStatus;
      }

      return currentStatus;
    };

    // Check immediately; only start interval if still pending
    pollOnce().then((firstStatus) => {
      if (firstStatus !== "PENDING") return;
      pollingRef.current = setInterval(() => {
        pollOnce();
      }, 10000);
    });
  }, [checkPaymentStatus, stopPolling]);

  useEffect(() => {
    return () => {
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
      }
    };
  }, []);

  return {
    generatePayment,
    checkPaymentStatus,
    isGenerating,
    paymentData,
    status,
    isPolling,
    startPolling,
    stopPolling,
  };
};
