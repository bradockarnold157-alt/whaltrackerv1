import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ProductInsert } from "@/hooks/useProducts";
import { Star, Upload, Loader2, X } from "lucide-react";
import { useAdminCategories } from "@/hooks/useCategories";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

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
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast({
        title: "Arquivo inválido",
        description: "Por favor, selecione uma imagem.",
        variant: "destructive",
      });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "Arquivo muito grande",
        description: "A imagem deve ter no máximo 5MB.",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);

    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("products")
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from("products")
        .getPublicUrl(fileName);

      setFormData((prev) => ({ ...prev, image: publicUrl }));

      toast({
        title: "Imagem enviada!",
        description: "A imagem foi carregada com sucesso.",
      });
    } catch (error: any) {
      console.error("Upload error:", error);
      toast({
        title: "Erro no upload",
        description: error.message || "Não foi possível enviar a imagem.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const clearImage = () => {
    setFormData((prev) => ({ ...prev, image: "" }));
  };

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
        <Label>Imagem do Produto *</Label>
        
        {formData.image && (
          <div className="relative w-32 h-32 rounded-lg overflow-hidden border border-border">
            <img 
              src={formData.image} 
              alt="Preview" 
              className="w-full h-full object-cover"
            />
            <button
              type="button"
              onClick={clearImage}
              className="absolute top-1 right-1 p-1 bg-destructive text-destructive-foreground rounded-full hover:bg-destructive/90"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        )}

        <div className="flex gap-2">
          <Input
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            ref={fileInputRef}
            className="hidden"
            id="product-image-upload"
          />
          <Button
            type="button"
            variant="outline"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="flex-1"
          >
            {isUploading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Enviando...
              </>
            ) : (
              <>
                <Upload className="h-4 w-4 mr-2" />
                Fazer upload
              </>
            )}
          </Button>
        </div>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">ou</span>
          </div>
        </div>

        <Input
          placeholder="Cole a URL da imagem"
          value={formData.image}
          onChange={(e) => setFormData((prev) => ({ ...prev, image: e.target.value }))}
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
