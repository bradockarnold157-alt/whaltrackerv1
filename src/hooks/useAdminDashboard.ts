import { useState, useEffect, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth, subDays, format, eachDayOfInterval, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";

interface DashboardMetrics {
  totalOrders: number;
  newCustomers: number;
  pendingOrders: number;
  paidOrders: number;
  totalRevenue: number;
}

interface ChartData {
  date: string;
  orders: number;
  revenue: number;
  customers: number;
}

type Period = "today" | "week" | "month" | "custom";

export const useAdminDashboard = () => {
  const [metrics, setMetrics] = useState<DashboardMetrics>({
    totalOrders: 0,
    newCustomers: 0,
    pendingOrders: 0,
    paidOrders: 0,
    totalRevenue: 0,
  });
  const [chartData, setChartData] = useState<ChartData[]>([]);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<Period>("week");
  const [customStartDate, setCustomStartDate] = useState<Date | undefined>(undefined);
  const [customEndDate, setCustomEndDate] = useState<Date | undefined>(undefined);

  const dateRange = useMemo(() => {
    const now = new Date();
    switch (period) {
      case "today":
        return { start: startOfDay(now), end: endOfDay(now) };
      case "week":
        return { start: startOfWeek(now, { locale: ptBR }), end: endOfWeek(now, { locale: ptBR }) };
      case "month":
        return { start: startOfMonth(now), end: endOfMonth(now) };
      case "custom":
        return {
          start: customStartDate ? startOfDay(customStartDate) : subDays(now, 7),
          end: customEndDate ? endOfDay(customEndDate) : now,
        };
      default:
        return { start: subDays(now, 7), end: now };
    }
  }, [period, customStartDate, customEndDate]);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const startStr = dateRange.start.toISOString();
      const endStr = dateRange.end.toISOString();

      // Fetch orders in date range
      const { data: orders, error: ordersError } = await supabase
        .from("orders")
        .select("*")
        .gte("created_at", startStr)
        .lte("created_at", endStr);

      if (ordersError) throw ordersError;

      // Fetch new customers (profiles created in date range)
      const { data: profiles, error: profilesError } = await supabase
        .from("profiles")
        .select("*")
        .gte("created_at", startStr)
        .lte("created_at", endStr);

      if (profilesError) throw profilesError;

      // Calculate metrics
      const totalOrders = orders?.length || 0;
      const newCustomers = profiles?.length || 0;
      const pendingOrders = orders?.filter(o => o.status === "pending").length || 0;
      const paidOrders = orders?.filter(o => o.status === "approved" || o.status === "delivered" || o.status === "shipped" || o.status === "processing").length || 0;
      const totalRevenue = orders
        ?.filter(o => o.status !== "pending" && o.status !== "cancelled")
        .reduce((sum, o) => sum + Number(o.total), 0) || 0;

      setMetrics({
        totalOrders,
        newCustomers,
        pendingOrders,
        paidOrders,
        totalRevenue,
      });

      // Generate chart data
      const days = eachDayOfInterval({ start: dateRange.start, end: dateRange.end });
      const chartDataPoints: ChartData[] = days.map(day => {
        const dayStart = startOfDay(day);
        const dayEnd = endOfDay(day);
        
        const dayOrders = orders?.filter(o => {
          const orderDate = parseISO(o.created_at);
          return orderDate >= dayStart && orderDate <= dayEnd;
        }) || [];

        const dayProfiles = profiles?.filter(p => {
          const profileDate = parseISO(p.created_at);
          return profileDate >= dayStart && profileDate <= dayEnd;
        }) || [];

        const dayRevenue = dayOrders
          .filter(o => o.status !== "pending" && o.status !== "cancelled")
          .reduce((sum, o) => sum + Number(o.total), 0);

        return {
          date: format(day, "dd/MM", { locale: ptBR }),
          orders: dayOrders.length,
          revenue: dayRevenue,
          customers: dayProfiles.length,
        };
      });

      setChartData(chartDataPoints);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [dateRange]);

  return {
    metrics,
    chartData,
    loading,
    period,
    setPeriod,
    customStartDate,
    setCustomStartDate,
    customEndDate,
    setCustomEndDate,
    refreshDashboard: fetchDashboardData,
  };
};
