import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { DialogFooter } from "@/components/ui/dialog";
import { ProductInsert } from "@/hooks/useProducts";

interface ProductFormProps {
  formData: ProductInsert;
  setFormData: React.Dispatch<React.SetStateAction<ProductInsert>>;
  onSubmit: () => void;
  submitLabel: string;
}

const ProductForm = ({ formData, setFormData, onSubmit, submitLabel }: ProductFormProps) => (
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
        <Input
          id="category"
          value={formData.category}
          onChange={(e) => setFormData((prev) => ({ ...prev, category: e.target.value }))}
          placeholder="Ex: Jogos, Assinaturas"
        />
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

export default ProductForm;
