import { useForm, router } from "@inertiajs/react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ItemForm, Institution } from "@/types/item";
import { useEffect, useState } from "react";
import { compressImage, formatFileSize, isAllowedImageType } from "@/lib/image-compressor";

interface Props {
  open: boolean;
  onClose: () => void;
  institutions: Institution[];
  item: ItemForm;
}

export default function EditItemDialog({ open, onClose, institutions, item }: Props) {
  const [isCompressing, setIsCompressing] = useState(false);
  const [compressionInfo, setCompressionInfo] = useState<string | null>(null);

  const { data, setData, processing, errors, reset } = useForm({
    id: item.id,
    item_code: item.item_code || "",
    name: item.name || "",
    description: item.description || "",
    price: item.price || 0,
    stock: item.stock || 0,
    location: item.location || "",
    status: item.status || "baik",
    condition: item.condition || "tersedia",
    institution_id: item.institution_id || institutions[0]?.id || 0,
    source_of_funds: item.source_of_funds || "",
    photo: null as File | null,
  });

  // Reset form ketika item berubah
  useEffect(() => {
    if (open && item) {
      setData({
        id: item.id,
        item_code: item.item_code || "",
        name: item.name || "",
        description: item.description || "",
        price: item.price || 0,
        stock: item.stock || 0,
        location: item.location || "",
        status: item.status || "baik",
        condition: item.condition || "tersedia",
        institution_id: item.institution_id || institutions[0]?.id || 0,
        source_of_funds: item.source_of_funds || "",
        photo: null,
      });
    }
  }, [open, item, institutions, reset]);

  const STATUS_OPTIONS = [
    { value: "baik", label: "Baik" },
    { value: "rusak", label: "Rusak" },
    { value: "diperbaiki", label: "Diperbaiki" },
  ];

  const CONDITION_OPTIONS = [
    { value: "tersedia", label: "Tersedia" },
    { value: "dipinjam", label: "Dipinjam" },
    { value: "hilang", label: "Hilang" },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Gunakan method spoofing POST -> PUT dengan forceFormData agar file multipart terbaca oleh PHP
    const submitData: Record<string, any> = {
      _method: "put",
      name: data.name,
      description: data.description,
      price: data.price,
      stock: data.stock,
      location: data.location,
      status: data.status,
      condition: data.condition,
      institution_id: data.institution_id,
      source_of_funds: data.source_of_funds,
    };

    if (data.photo instanceof File) {
      submitData.photo = data.photo;
    }

    router.post(`/items/${item.id}`, submitData, {
      forceFormData: true,
      preserveState: true,
      onSuccess: () => {
        reset();
        onClose();
        router.reload({ only: ['items'] });
      },
      onError: (errors) => {
        console.error('Validation errors:', errors);
      },
    });
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) {
      setData("photo", null);
      setCompressionInfo(null);
      return;
    }

    if (!isAllowedImageType(file)) {
      alert("Format file tidak didukung! Hanya gambar JPG, PNG, atau WEBP yang diperbolehkan (GIF dan SVG tidak diizinkan demi keamanan).");
      e.target.value = "";
      setData("photo", null);
      setCompressionInfo(null);
      return;
    }

    setIsCompressing(true);
    setCompressionInfo("Sedang mengompresi gambar...");

    try {
      const compressed = await compressImage(file);
      setData("photo", compressed);
      const originalText = formatFileSize(file.size);
      const compressedText = formatFileSize(compressed.size);
      if (compressed.size < file.size) {
        const savedPercent = Math.round((1 - compressed.size / file.size) * 100);
        setCompressionInfo(`Dikompres: ${originalText} ➔ ${compressedText} (hemat ${savedPercent}%)`);
      } else {
        setCompressionInfo(`Ukuran: ${compressedText}`);
      }
    } catch {
      setData("photo", file);
      setCompressionInfo(null);
    } finally {
      setIsCompressing(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent 
        className="max-w-2xl w-full max-h-[90vh] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-100 hover:scrollbar-thumb-gray-500 rounded-lg"
      >
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">Edit Item</DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Perbarui informasi detail barang inventaris.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Kode Barang - readonly */}
          <div className="space-y-1">
            <Label htmlFor="item_code" className="text-sm font-medium">
              Kode Barang
            </Label>
            <Input 
              id="item_code" 
              value={data.item_code} 
              readOnly 
              className="cursor-not-allowed"
            />
            <p className="text-xs text-gray-500">Kode barang tidak dapat diubah</p>
          </div>

          {/* Nama */}
          <div className="space-y-1">
            <Label htmlFor="name" className="text-sm font-medium">
              Nama Barang <span className="text-red-500">*</span>
            </Label>
            <Input
              id="name"
              value={data.name}
              onChange={(e) => setData("name", e.target.value)}
              placeholder="Masukkan nama barang"
              className={errors.name ? "border-red-500" : ""}
            />
            {errors.name && (
              <p className="text-red-500 text-sm mt-1">{errors.name}</p>
            )}
          </div>

          {/* Deskripsi */}
          <div className="space-y-1">
            <Label htmlFor="description" className="text-sm font-medium">
              Deskripsi
            </Label>
            <Input
              id="description"
              value={data.description}
              onChange={(e) => setData("description", e.target.value)}
              placeholder="Masukkan deskripsi barang"
              className={errors.description ? "border-red-500" : ""}
            />
            {errors.description && (
              <p className="text-red-500 text-sm mt-1">{errors.description}</p>
            )}
          </div>

          {/* Harga & Stock */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label htmlFor="price" className="text-sm font-medium">
                Harga <span className="text-red-500">*</span>
              </Label>
              <Input
                id="price"
                type="number"
                min="0"
                step="0.01"
                value={data.price}
                onKeyDown={(e) => {
                  if (e.key === '-' || e.key === 'e') e.preventDefault();
                }}
                onChange={(e) => {
                  const val = parseFloat(e.target.value);
                  setData("price", isNaN(val) ? 0 : Math.max(0, val));
                }}
                placeholder="0"
                className={errors.price ? "border-red-500" : ""}
              />
              {errors.price && (
                <p className="text-red-500 text-sm mt-1">{errors.price}</p>
              )}
            </div>
            
            <div className="space-y-1">
              <Label htmlFor="stock" className="text-sm font-medium">
                Jumlah Stok
              </Label>
              <Input
                id="stock"
                type="number"
                min="0"
                step="1"
                value={data.stock}
                onKeyDown={(e) => {
                  if (e.key === '-' || e.key === 'e') e.preventDefault();
                }}
                onChange={(e) => {
                  const val = parseInt(e.target.value, 10);
                  setData("stock", isNaN(val) ? 0 : Math.max(0, val));
                }}
                placeholder="0"
                className={errors.stock ? "border-red-500" : ""}
              />
              {errors.stock && (
                <p className="text-red-500 text-sm mt-1">{errors.stock}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Lokasi */}
            <div className="space-y-1">
              <Label htmlFor="location" className="text-sm font-medium">
                Lokasi <span className="text-red-500">*</span>
              </Label>
              <Input
                id="location"
                value={data.location}
                onChange={(e) => setData("location", e.target.value)}
                placeholder="Masukkan lokasi penyimpanan"
                className={errors.location ? "border-red-500" : ""}
              />
              {errors.location && (
                <p className="text-red-500 text-sm mt-1">{errors.location}</p>
              )}
            </div>

            {/* Asal Dana */}
            <div className="space-y-1">
              <Label htmlFor="source_of_funds" className="text-sm font-medium">
                Asal Dana <span className="text-xs text-muted-foreground font-normal">(Opsional)</span>
              </Label>
              <Input
                id="source_of_funds"
                value={data.source_of_funds}
                onChange={(e) => setData("source_of_funds", e.target.value)}
                placeholder="Contoh: BOS, Yayasan, Donasi, Komite"
                className={errors.source_of_funds ? "border-red-500" : ""}
              />
              {errors.source_of_funds && (
                <p className="text-red-500 text-sm mt-1">{errors.source_of_funds}</p>
              )}
            </div>
          </div>

          {/* Status & Kondisi */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label htmlFor="status" className="text-sm font-medium">
                Status <span className="text-red-500">*</span>
              </Label>
              <Select
                value={data.status}
                onValueChange={(value) => setData("status", value as "baik" | "rusak" | "diperbaiki")}
              >
                <SelectTrigger 
                  id="status" 
                  className={errors.status ? "border-red-500" : ""}
                >
                  <SelectValue placeholder="Pilih status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Status Barang</SelectLabel>
                    {STATUS_OPTIONS.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
              {errors.status && (
                <p className="text-red-500 text-sm mt-1">{errors.status}</p>
              )}
            </div>

            <div className="space-y-1">
              <Label htmlFor="condition" className="text-sm font-medium">
                Kondisi <span className="text-red-500">*</span>
              </Label>
              <Select
                value={data.condition}
                onValueChange={(value) => setData("condition", value as "tersedia" | "dipinjam" | "hilang")}
              >
                <SelectTrigger 
                  id="condition" 
                  className={errors.condition ? "border-red-500" : ""}
                >
                  <SelectValue placeholder="Pilih kondisi" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Kondisi Barang</SelectLabel>
                    {CONDITION_OPTIONS.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
              {errors.condition && (
                <p className="text-red-500 text-sm mt-1">{errors.condition}</p>
              )}
            </div>
          </div>

          {/* Institusi */}
          <div className="space-y-1">
            <Label htmlFor="institution_id" className="text-sm font-medium">
              Institusi <span className="text-red-500">*</span>
            </Label>
            <Select
              value={data.institution_id?.toString()}
              onValueChange={(value) => setData("institution_id", Number(value))}
            >
              <SelectTrigger 
                id="institution_id" 
                className={errors.institution_id ? "border-red-500" : ""}
              >
                <SelectValue placeholder="Pilih institusi" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Pilih Institusi</SelectLabel>
                  {institutions.map((institution) => (
                    <SelectItem 
                      key={institution.id} 
                      value={institution.id.toString()}
                    >
                      {institution.name} ({institution.code})
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
            {errors.institution_id && (
              <p className="text-red-500 text-sm mt-1">{errors.institution_id}</p>
            )}
          </div>

          {/* Foto */}
          <div className="space-y-1">
            <Label htmlFor="photo" className="text-sm font-medium">
              Foto Barang
            </Label>
            
            {/* Preview foto saat ini */}
            {item.photo && typeof item.photo === "string" && (
              <div className="mb-3">
                <p className="text-sm text-gray-600 mb-2">Foto saat ini:</p>
                <img 
                  src={`/storage/${item.photo}`} 
                  alt={item.name} 
                  className="w-32 h-32 object-cover rounded-lg border"
                />
              </div>
            )}
            
            <Input
              id="photo"
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={handleFileChange}
              disabled={isCompressing}
              className={errors.photo ? "border-red-500" : ""}
            />
            {compressionInfo && (
              <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1 mt-1">
                ✓ {compressionInfo}
              </p>
            )}
            <p className="text-xs text-gray-500 mt-1">
              Format: JPG, PNG, WEBP (GIF dan SVG tidak diizinkan). Kosongkan jika tidak ingin mengubah foto. Gambar akan otomatis dikompres.
            </p>
            {errors.photo && (
              <p className="text-red-500 text-sm mt-1">{errors.photo}</p>
            )}
            
            {/* Preview foto baru */}
            {data.photo && data.photo instanceof File && (
              <div className="mt-2">
                <p className="text-sm text-gray-600 mb-2">Preview foto baru:</p>
                <img 
                  src={URL.createObjectURL(data.photo)} 
                  alt="Preview" 
                  className="w-32 h-32 object-cover rounded-lg border"
                />
              </div>
            )}
          </div>

          {/* Error Summary */}
          {Object.keys(errors).length > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <h4 className="text-red-800 font-medium mb-2">Terjadi kesalahan:</h4>
              <ul className="text-red-700 text-sm list-disc list-inside">
                {Object.entries(errors).map(([key, error]) => (
                  <li key={key}>{error}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-6 border-t">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => {
                setCompressionInfo(null);
                setIsCompressing(false);
                onClose();
              }}
              disabled={processing || isCompressing}
            >
              Batal
            </Button>
            <Button 
              type="submit" 
              disabled={processing || isCompressing}
              className="min-w-24"
            >
              {processing ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Menyimpan...
                </>
              ) : isCompressing ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Mengompres...
                </>
              ) : (
                "Simpan Perubahan"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}