import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ProductInsert } from "@/hooks/useProducts";
import { Star } from "lucide-react";
import { useAdminCategories } from "@/hooks/useCategories";
interface ProductFormProps {
  formData: ProductInsert;
  setFormData: React.Dispatch<React.SetStateAction<ProductInsert>>;
  onSubmit: () => void;
  submitLabel: string;
}

const RATING_OPTIONS = [
  { value: "0.5", label: "0.5" },
  { value: "1", label: "1.0" },
  { value: "1.5", label: "1.5" },
  { value: "2", label: "2.0" },
  { value: "2.5", label: "2.5" },
  { value: "3", label: "3.0" },
  { value: "3.5", label: "3.5" },
  { value: "4", label: "4.0" },
  { value: "4.5", label: "4.5" },
  { value: "5", label: "5.0" },
];

const ProductForm = ({ formData, setFormData, onSubmit, submitLabel }: ProductFormProps) => {
  const { categories, loading: categoriesLoading } = useAdminCategories();

  return (
    <div className="grid gap-4 py-4">
      <div className="grid gap-2">
        <Label htmlFor="name">Nome do Produto *</Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
          placeholder="Ex: FIFA 25 Ultimate Edition"
        />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="description">Descrição</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
          placeholder="Descrição do produto..."
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="grid gap-2">
          <Label htmlFor="price">Preço *</Label>
          <Input
            id="price"
            type="number"
            step="0.01"
            value={formData.price}
            onChange={(e) => setFormData((prev) => ({ ...prev, price: parseFloat(e.target.value) || 0 }))}
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="original_price">Preço Original</Label>
          <Input
            id="original_price"
            type="number"
            step="0.01"
            value={formData.original_price || ""}
            onChange={(e) => setFormData((prev) => ({ ...prev, original_price: parseFloat(e.target.value) || undefined }))}
          />
        </div>
      </div>
      <div className="grid gap-2">
        <Label htmlFor="image">URL da Imagem *</Label>
        <Input
          id="image"
          value={formData.image}
          onChange={(e) => setFormData((prev) => ({ ...prev, image: e.target.value }))}
          placeholder="https://exemplo.com/imagem.jpg"
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="grid gap-2">
          <Label htmlFor="category">Categoria *</Label>
          <Select
            value={formData.category}
            onValueChange={(value) => setFormData((prev) => ({ ...prev, category: value }))}
          >
            <SelectTrigger>
              <SelectValue placeholder={categoriesLoading ? "Carregando..." : "Selecione a categoria"} />
            </SelectTrigger>
            <SelectContent>
              {categories.map((cat) => (
                <SelectItem key={cat.id} value={cat.name}>
                  {cat.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="grid gap-2">
          <Label htmlFor="badge">Badge</Label>
          <Input
            id="badge"
            value={formData.badge || ""}
            onChange={(e) => setFormData((prev) => ({ ...prev, badge: e.target.value }))}
            placeholder="Ex: Novo, -30%"
          />
        </div>
      </div>
    <div className="grid grid-cols-2 gap-4">
      <div className="grid gap-2">
        <Label className="flex items-center gap-1">
          <Star className="h-4 w-4 text-yellow-400" />
          Avaliação (Estrelas)
        </Label>
        <Select
          value={String(formData.rating || 5)}
          onValueChange={(value) => setFormData((prev) => ({ ...prev, rating: parseFloat(value) }))}
        >
          <SelectTrigger>
            <SelectValue placeholder="Selecione a avaliação" />
          </SelectTrigger>
          <SelectContent>
            {RATING_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label} ⭐
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="grid gap-2">
        <Label htmlFor="reviews_count">Quantidade de Avaliações</Label>
        <Input
          id="reviews_count"
          type="number"
          min="0"
          value={formData.reviews_count || 0}
          onChange={(e) => setFormData((prev) => ({ ...prev, reviews_count: parseInt(e.target.value) || 0 }))}
          placeholder="Ex: 150"
        />
      </div>
    </div>
    <div className="flex items-center gap-2">
      <Switch
        checked={formData.is_active}
        onCheckedChange={(checked) => setFormData((prev) => ({ ...prev, is_active: checked }))}
      />
      <Label>Produto ativo</Label>
    </div>
    <DialogFooter>
      <Button onClick={onSubmit} disabled={!formData.name || !formData.image || !formData.category || formData.price <= 0}>
        {submitLabel}
      </Button>
    </DialogFooter>
    </div>
  );
};

export default ProductForm;
