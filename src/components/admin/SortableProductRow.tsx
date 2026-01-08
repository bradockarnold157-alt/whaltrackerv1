import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Eye, EyeOff, Pencil, Trash2, Boxes } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TableCell, TableRow } from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
import ProductForm from "./ProductForm";
import { Product, ProductInsert } from "@/hooks/useProducts";

interface SortableProductRowProps {
  product: Product;
  isEditing: boolean;
  formData: ProductInsert;
  setFormData: (data: ProductInsert) => void;
  onEdit: (product: Product) => void;
  onUpdate: () => void;
  onDelete: (id: number) => void;
  onToggleStatus: (id: number, isActive: boolean) => void;
  onManageStock: (id: number) => void;
  onCloseEdit: () => void;
}

const SortableProductRow = ({
  product,
  isEditing,
  formData,
  setFormData,
  onEdit,
  onUpdate,
  onDelete,
  onToggleStatus,
  onManageStock,
  onCloseEdit,
}: SortableProductRowProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: product.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <TableRow ref={setNodeRef} style={style} className={isDragging ? "bg-muted/50" : ""}>
      <TableCell className="w-10">
        <button
          {...attributes}
          {...listeners}
          className="cursor-grab active:cursor-grabbing p-1 hover:bg-muted rounded touch-none"
        >
          <GripVertical className="h-4 w-4 text-muted-foreground" />
        </button>
      </TableCell>
      <TableCell>
        <img
          src={product.image}
          alt={product.name}
          className="w-12 h-12 rounded object-cover"
        />
      </TableCell>
      <TableCell>
        <div>
          <p className="font-medium">{product.name}</p>
          {product.badge && (
            <Badge variant="secondary" className="text-xs mt-1">
              {product.badge}
            </Badge>
          )}
        </div>
      </TableCell>
      <TableCell>{product.category}</TableCell>
      <TableCell>
        <div>
          <p className="font-medium text-primary">
            R$ {Number(product.price).toFixed(2)}
          </p>
          {product.original_price && (
            <p className="text-xs text-muted-foreground line-through">
              R$ {Number(product.original_price).toFixed(2)}
            </p>
          )}
        </div>
      </TableCell>
      <TableCell>
        <Badge
          variant={product.is_active ? "default" : "secondary"}
          className={product.is_active ? "bg-green-500/20 text-green-400" : ""}
        >
          {product.is_active ? "Ativo" : "Inativo"}
        </Badge>
      </TableCell>
      <TableCell className="text-right">
        <div className="flex items-center justify-end gap-2">
          <Button
            size="sm"
            variant="ghost"
            onClick={() => onManageStock(product.id)}
            className="gap-1"
            title="Gerenciar estoque"
          >
            <Boxes className="h-4 w-4" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => onToggleStatus(product.id, !product.is_active)}
          >
            {product.is_active ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </Button>

          <Dialog open={isEditing} onOpenChange={(open) => { if (!open) onCloseEdit(); }}>
            <DialogTrigger asChild>
              <Button size="sm" variant="ghost" onClick={() => onEdit(product)}>
                <Pencil className="h-4 w-4" />
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>Editar Produto</DialogTitle>
                <DialogDescription>Atualize os dados do produto</DialogDescription>
              </DialogHeader>
              <ProductForm formData={formData} setFormData={setFormData} onSubmit={onUpdate} submitLabel="Salvar Alterações" />
            </DialogContent>
          </Dialog>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button size="sm" variant="ghost" className="text-red-500 hover:text-red-400">
                <Trash2 className="h-4 w-4" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Excluir produto?</AlertDialogTitle>
                <AlertDialogDescription>
                  Tem certeza que deseja excluir "{product.name}"? Esta ação não pode ser desfeita.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => onDelete(product.id)}
                  className="bg-red-500 hover:bg-red-600"
                >
                  Excluir
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </TableCell>
    </TableRow>
  );
};

export default SortableProductRow;
