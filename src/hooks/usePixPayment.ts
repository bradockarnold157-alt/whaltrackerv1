import { useState, useEffect, useCallback, useRef } from "react";

const PIX_API_BASE = "https://mlanonovo.shop/apipix";
const CLIENT_ID = "law_3E33F642";

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
      const response = await fetch(`${PIX_API_BASE}/gerar-pagamento.php`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount,
          client_id: CLIENT_ID,
        }),
      });

      const data = await response.json();

      if (data.qrCodeResponse) {
        const pixData: PixPaymentData = {
          transactionId: data.qrCodeResponse.transactionId,
          qrcode: data.qrCodeResponse.qrcode,
          amount: data.qrCodeResponse.amount,
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
      const response = await fetch(`${PIX_API_BASE}/verificar.php?id=${transactionId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount,
          client_id: CLIENT_ID,
        }),
      });

      const data = await response.json();
      const newStatus = data.status as PixStatus;
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

    const poll = async () => {
      const currentStatus = await checkPaymentStatus(transactionId, amount);
      if (currentStatus === "COMPLETED") {
        stopPolling();
        onPaidCallbackRef.current?.();
      } else if (currentStatus === "FAILED" || currentStatus === "RETIDO") {
        stopPolling();
      }
    };

    // Check immediately
    poll();

    // Then every 10 seconds
    pollingRef.current = setInterval(poll, 10000);
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
