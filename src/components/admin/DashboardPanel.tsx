import { useState } from "react";
import { useAdminDashboard } from "@/hooks/useAdminDashboard";
import { useStoreSettings } from "@/hooks/useStoreSettings";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Legend } from "recharts";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  Loader2,
  ShoppingCart,
  Users,
  Clock,
  CheckCircle,
  DollarSign,
  CalendarIcon,
  RefreshCw,
  Settings,
  TrendingUp,
} from "lucide-react";

const chartConfig = {
  orders: {
    label: "Pedidos",
    color: "hsl(var(--primary))",
  },
  revenue: {
    label: "Receita (R$)",
    color: "hsl(var(--chart-2))",
  },
  customers: {
    label: "Novos Clientes",
    color: "hsl(var(--chart-3))",
  },
};

const DashboardPanel = () => {
  const {
    metrics,
    chartData,
    loading,
    period,
    setPeriod,
    customStartDate,
    setCustomStartDate,
    customEndDate,
    setCustomEndDate,
    refreshDashboard,
  } = useAdminDashboard();

  const { minimumOrderValue, loading: settingsLoading, updateMinimumOrderValue } = useStoreSettings();
  const [newMinValue, setNewMinValue] = useState<string>("");
  const [isSavingMin, setIsSavingMin] = useState(false);

  const handleSaveMinValue = async () => {
    const value = parseFloat(newMinValue);
    if (isNaN(value) || value < 0) {
      return;
    }
    setIsSavingMin(true);
    await updateMinimumOrderValue(value);
    setNewMinValue("");
    setIsSavingMin(false);
  };

  if (loading && settingsLoading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Period Selector */}
      <div className="flex flex-wrap items-center gap-4">
        <Tabs value={period} onValueChange={(v) => setPeriod(v as any)} className="w-auto">
          <TabsList>
            <TabsTrigger value="today">Hoje</TabsTrigger>
            <TabsTrigger value="week">Semana</TabsTrigger>
            <TabsTrigger value="month">Mês</TabsTrigger>
            <TabsTrigger value="custom">Personalizado</TabsTrigger>
          </TabsList>
        </Tabs>

        {period === "custom" && (
          <div className="flex items-center gap-2">
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="gap-2">
                  <CalendarIcon className="h-4 w-4" />
                  {customStartDate ? format(customStartDate, "dd/MM/yyyy", { locale: ptBR }) : "Início"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={customStartDate}
                  onSelect={setCustomStartDate}
                  locale={ptBR}
                />
              </PopoverContent>
            </Popover>
            <span className="text-muted-foreground">até</span>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="gap-2">
                  <CalendarIcon className="h-4 w-4" />
                  {customEndDate ? format(customEndDate, "dd/MM/yyyy", { locale: ptBR }) : "Fim"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={customEndDate}
                  onSelect={setCustomEndDate}
                  locale={ptBR}
                />
              </PopoverContent>
            </Popover>
          </div>
        )}

        <Button variant="outline" size="sm" onClick={refreshDashboard} className="gap-2 ml-auto">
          <RefreshCw className="h-4 w-4" />
          Atualizar
        </Button>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card className="border-border/50 bg-card/50 backdrop-blur">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/20">
                <ShoppingCart className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total de Pedidos</p>
                <p className="text-2xl font-bold">{metrics.totalOrders}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/50 bg-card/50 backdrop-blur">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-500/20">
                <Users className="h-5 w-5 text-blue-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Novos Clientes</p>
                <p className="text-2xl font-bold">{metrics.newCustomers}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/50 bg-card/50 backdrop-blur">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-yellow-500/20">
                <Clock className="h-5 w-5 text-yellow-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Aguardando Pagamento</p>
                <p className="text-2xl font-bold">{metrics.pendingOrders}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/50 bg-card/50 backdrop-blur">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-500/20">
                <CheckCircle className="h-5 w-5 text-green-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Pedidos Pagos</p>
                <p className="text-2xl font-bold">{metrics.paidOrders}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/50 bg-card/50 backdrop-blur">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-emerald-500/20">
                <DollarSign className="h-5 w-5 text-emerald-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Receita Total</p>
                <p className="text-2xl font-bold">R$ {metrics.totalRevenue.toFixed(2)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Chart */}
      <Card className="border-border/50 bg-card/50 backdrop-blur">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Evolução do Período
          </CardTitle>
          <CardDescription>Visualize pedidos, receita e novos clientes ao longo do tempo</CardDescription>
        </CardHeader>
        <CardContent>
          {chartData.length > 0 ? (
            <ChartContainer config={chartConfig} className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis
                    dataKey="date"
                    className="text-xs"
                    tick={{ fill: "hsl(var(--muted-foreground))" }}
                  />
                  <YAxis
                    className="text-xs"
                    tick={{ fill: "hsl(var(--muted-foreground))" }}
                  />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="orders"
                    name="Pedidos"
                    stroke="hsl(var(--primary))"
                    strokeWidth={2}
                    dot={{ fill: "hsl(var(--primary))" }}
                  />
                  <Line
                    type="monotone"
                    dataKey="customers"
                    name="Novos Clientes"
                    stroke="hsl(var(--chart-3))"
                    strokeWidth={2}
                    dot={{ fill: "hsl(var(--chart-3))" }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </ChartContainer>
          ) : (
            <div className="h-[300px] flex items-center justify-center text-muted-foreground">
              Nenhum dado para o período selecionado
            </div>
          )}
        </CardContent>
      </Card>

      {/* Store Settings */}
      <Card className="border-border/50 bg-card/50 backdrop-blur">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Configurações da Loja
          </CardTitle>
          <CardDescription>Configure parâmetros gerais da sua loja</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row items-start sm:items-end gap-4">
            <div className="space-y-2 flex-1 max-w-xs">
              <Label htmlFor="minOrder">Valor Mínimo do Pedido (R$)</Label>
              <div className="flex items-center gap-2">
                <div className="text-sm text-muted-foreground">
                  Atual: <span className="font-bold text-foreground">R$ {minimumOrderValue.toFixed(2)}</span>
                </div>
              </div>
              <Input
                id="minOrder"
                type="number"
                step="0.01"
                min="0"
                placeholder="Novo valor mínimo"
                value={newMinValue}
                onChange={(e) => setNewMinValue(e.target.value)}
              />
            </div>
            <Button
              onClick={handleSaveMinValue}
              disabled={isSavingMin || !newMinValue || parseFloat(newMinValue) < 0}
              className="gap-2"
            >
              {isSavingMin && <Loader2 className="h-4 w-4 animate-spin" />}
              Salvar
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DashboardPanel;
