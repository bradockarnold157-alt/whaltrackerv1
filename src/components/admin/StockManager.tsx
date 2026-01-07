import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Package, Trash2, Upload, Eye, EyeOff, Loader2 } from "lucide-react";
import { useProductStock, ProductStock } from "@/hooks/useProductStock";

interface StockManagerProps {
  productId: number;
  productName: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const StockManager = ({ productId, productName, open, onOpenChange }: StockManagerProps) => {
  const { stockByProduct, loading, fetchStockForProduct, importStock, deleteStockItem, clearAvailableStock } = useProductStock();
  const [importText, setImportText] = useState("");
  const [showCredentials, setShowCredentials] = useState(false);

  useEffect(() => {
    if (open && productId) {
      fetchStockForProduct(productId);
    }
  }, [open, productId]);

  const stock = stockByProduct[productId] || [];
  const availableStock = stock.filter((s) => s.is_available);
  const usedStock = stock.filter((s) => !s.is_available);

  const handleImport = async () => {
    const lines = importText.split("\n");
    const result = await importStock(productId, lines);
    if (!result.error) {
      setImportText("");
    }
  };

  const maskCredential = (credential: string) => {
    if (credential.length <= 10) return "••••••••••";
    return credential.substring(0, 5) + "•••••" + credential.substring(credential.length - 5);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Estoque: {productName}
          </DialogTitle>
          <DialogDescription>
            Gerencie os entregáveis digitais deste produto
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Stats */}
          <div className="flex gap-4">
            <div className="flex-1 p-4 rounded-lg bg-green-500/10 border border-green-500/20">
              <p className="text-sm text-muted-foreground">Disponível</p>
              <p className="text-2xl font-bold text-green-400">{availableStock.length}</p>
            </div>
            <div className="flex-1 p-4 rounded-lg bg-muted/50 border border-border">
              <p className="text-sm text-muted-foreground">Usado</p>
              <p className="text-2xl font-bold text-muted-foreground">{usedStock.length}</p>
            </div>
          </div>

          {/* Import Section */}
          <div className="space-y-2">
            <Label>Importar Estoque</Label>
            <Textarea
              value={importText}
              onChange={(e) => setImportText(e.target.value)}
              placeholder={`Cole aqui os entregáveis (um por linha):\nemail:usuario@email.com senha:123456\nemail:outro@email.com senha:654321`}
              rows={5}
              className="font-mono text-sm"
            />
            <div className="flex gap-2">
              <Button
                onClick={handleImport}
                disabled={loading || !importText.trim()}
                className="gap-2"
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Upload className="h-4 w-4" />
                )}
                Importar
              </Button>
              {availableStock.length > 0 && (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="outline" className="gap-2 text-red-400 hover:text-red-300">
                      <Trash2 className="h-4 w-4" />
                      Limpar Disponíveis
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Limpar estoque disponível?</AlertDialogTitle>
                      <AlertDialogDescription>
                        Isso removerá {availableStock.length} itens disponíveis. Esta ação não pode ser desfeita.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancelar</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => clearAvailableStock(productId)}
                        className="bg-red-500 hover:bg-red-600"
                      >
                        Limpar
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )}
            </div>
          </div>

          {/* Stock List */}
          {stock.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Itens em Estoque ({stock.length})</Label>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowCredentials(!showCredentials)}
                  className="gap-2"
                >
                  {showCredentials ? (
                    <>
                      <EyeOff className="h-4 w-4" /> Ocultar
                    </>
                  ) : (
                    <>
                      <Eye className="h-4 w-4" /> Mostrar
                    </>
                  )}
                </Button>
              </div>
              <ScrollArea className="h-[200px] rounded-md border">
                <div className="p-4 space-y-2">
                  {stock.map((item) => (
                    <div
                      key={item.id}
                      className={`flex items-center justify-between p-2 rounded text-sm ${
                        item.is_available
                          ? "bg-green-500/10 border border-green-500/20"
                          : "bg-muted/30 border border-border opacity-60"
                      }`}
                    >
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        <Badge
                          variant={item.is_available ? "default" : "secondary"}
                          className={item.is_available ? "bg-green-500/20 text-green-400" : ""}
                        >
                          {item.is_available ? "Disponível" : "Usado"}
                        </Badge>
                        <code className="truncate font-mono text-xs">
                          {showCredentials ? item.credential : maskCredential(item.credential)}
                        </code>
                      </div>
                      {item.is_available && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteStockItem(item.id, productId)}
                          className="text-red-400 hover:text-red-300 shrink-0"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Fechar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default StockManager;
