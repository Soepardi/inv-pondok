import { useForm } from "@inertiajs/react";
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
import { useState } from "react";
import { compressImage, formatFileSize, isAllowedImageType } from "@/lib/image-compressor";




interface Institution {
  id: number;
  name: string;
}

interface Props {
  open: boolean;
  onClose: () => void;
  institutions: Institution[];
}

interface ItemForm {
  number_code: string;
  name: string;
  description: string;
  price: number | string;
  stock: number | string;
  location: string;
  status: "baik" | "rusak" | "diperbaiki" | "";
  condition: "tersedia" | "dipinjam" | "hilang" | "";
  institution_id: number | "";
  source_of_funds: string;
  photo: File | null;
}

export default function CreateItemDialog({ open, onClose, institutions }: Props) {
  const [isCompressing, setIsCompressing] = useState(false);
  const [compressionInfo, setCompressionInfo] = useState<string | null>(null);

  const { data, setData, post, processing, errors, reset } = useForm<ItemForm>({
    number_code: "",
    name: "",
    description: "",
    price: "",
    stock: "1",
    location: "",
    status: "",
    condition: "",
    institution_id: "",
    source_of_funds: "",
    photo: null,
  });

  const handleClose = () => {
    setCompressionInfo(null);
    setIsCompressing(false);
    onClose();
  };

  const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    post("/items", {
      forceFormData: true,
      onSuccess: () => {
        reset();
        handleClose();
      },
    });
  };
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

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent   className="max-w-2xl w-full max-h-[90vh] overflow-y-auto 
             scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-100 
             hover:scrollbar-thumb-gray-500 rounded-lg">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">Tambah Item</DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Lengkapi detail barang untuk ditambahkan ke dalam inventaris.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Code */}
          <div className="space-y-1">
            <Label htmlFor="code">Kode</Label>
            <Input
              id="code"
              value={data.number_code}
              onChange={(e) => setData("number_code", e.target.value)}
              placeholder="Masukkan kode item"
            />
            {errors.number_code && (
              <p className="text-red-500 text-sm">{errors.number_code}</p>
            )}
          </div>

          {/* Name */}
          <div className="space-y-1">
            <Label htmlFor="name">Nama</Label>
            <Input
              id="name"
              value={data.name}
              onChange={(e) => setData("name", e.target.value)}
              placeholder="Nama item"
            />
            {errors.name && <p className="text-red-500 text-sm">{errors.name}</p>}
          </div>

          {/* Description */}
          <div className="space-y-1">
            <Label htmlFor="description">Deskripsi</Label>
            <Input
              id="description"
              value={data.description}
              onChange={(e) => setData("description", e.target.value)}
              placeholder="Deskripsi singkat item"
            />
            {errors.description && (
              <p className="text-red-500 text-sm">{errors.description}</p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Price */}
            <div className="space-y-1">
              <Label htmlFor="price">Harga</Label>
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
                  setData("price", isNaN(val) ? "" : Math.max(0, val).toString());
                }}
                placeholder="Rp"
              />
              {errors.price && <p className="text-red-500 text-sm">{errors.price}</p>}
            </div>

            {/* Stock */}
            <div className="space-y-1">
              <Label htmlFor="stock">Jumlah</Label>
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
                  setData("stock", isNaN(val) ? "" : Math.max(0, val).toString());
                }}
                placeholder="Jumlah stok"
              />
              {errors.stock && <p className="text-red-500 text-sm">{errors.stock}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Location */}
            <div className="space-y-1">
              <Label htmlFor="location">Lokasi</Label>
              <Input
                id="location"
                value={data.location}
                onChange={(e) => setData("location", e.target.value)}
                placeholder="Lokasi penyimpanan"
              />
              {errors.location && (
                <p className="text-red-500 text-sm">{errors.location}</p>
              )}
            </div>

            {/* Asal Dana (Opsional) */}
            <div className="space-y-1">
              <Label htmlFor="source_of_funds">
                Asal Dana <span className="text-xs text-muted-foreground font-normal">(Opsional)</span>
              </Label>
              <Input
                id="source_of_funds"
                value={data.source_of_funds}
                onChange={(e) => setData("source_of_funds", e.target.value)}
                placeholder="Contoh: BOS, Yayasan, Donasi, Komite"
              />
              {errors.source_of_funds && (
                <p className="text-red-500 text-sm">{errors.source_of_funds}</p>
              )}
            </div>
          </div>

          {/* Status & Condition */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label htmlFor="status">Status</Label>
                <Select
                  value={data.status}
                  onValueChange={(value) => setData("status", value as ItemForm["status"])}
>                  <SelectTrigger id="status">
                    <SelectValue placeholder="Pilih status" />
                     </SelectTrigger>
                          <SelectContent>
                          <SelectGroup>
                          <SelectLabel>Status</SelectLabel>
                            {STATUS_OPTIONS.map((opt) => (
                            <SelectItem key={opt.value} value={opt.value}>
                            {opt.label}
                          </SelectItem>
                                  ))}
                           </SelectGroup>
                          </SelectContent>
                  </Select>
              {errors.status && (
                <p className="text-red-500 text-sm">{errors.status}</p>
              )}
            </div>

            <div className="space-y-1">
              <Label htmlFor="condition">Kondisi</Label>
                <Select
                  value={data.condition}
                  onValueChange={(value) => setData("condition", value as ItemForm["condition"])}
>                  <SelectTrigger id="condition">
                    <SelectValue placeholder="Pilih Kondisi" />
                     </SelectTrigger>
                          <SelectContent>
                          <SelectGroup>
                          <SelectLabel>Kondisi</SelectLabel>
                            {CONDITION_OPTIONS.map((opt) => (
                            <SelectItem key={opt.value} value={opt.value}>
                            {opt.label}
                          </SelectItem>
                                  ))}
                           </SelectGroup>
                          </SelectContent>
                  </Select>
              {errors.condition && (
                <p className="text-red-500 text-sm">{errors.condition}</p>
              )}
            </div>
          </div>

          {/* Institution */}
          <div className="space-y-1">
            <Label htmlFor="institution_id">Instansi</Label>
            <Select
              value={data.institution_id ? data.institution_id.toString() : ""}
              onValueChange={(value) => setData("institution_id", Number(value))}
            >
              <SelectTrigger id="institution_id">
                <SelectValue placeholder="Pilih instansi" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Instansi</SelectLabel>
                  {institutions?.map((i) => (
                    <SelectItem key={i.id} value={i.id.toString()}>
                      {i.name}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
            {errors.institution_id && (
              <p className="text-red-500 text-sm">{errors.institution_id}</p>
            )}
          </div>

          {/* Photo */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label htmlFor="photo">Foto Barang</Label>
              <span className="text-xs text-muted-foreground">Opsional</span>
            </div>
            <Input
              id="photo"
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={handlePhotoChange}
              disabled={isCompressing}
            />
            <p className="text-xs text-muted-foreground">
              Format: JPG, PNG, WEBP (GIF dan SVG tidak diizinkan). Otomatis dikompres.
            </p>
            {compressionInfo && (
              <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1">
                ✓ {compressionInfo}
              </p>
            )}
            {errors.photo && (
              <p className="text-red-500 text-sm">{errors.photo}</p>
            )}
          </div>

          {/* Submit */}
          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={handleClose}>
              Batal
            </Button>
            <Button type="submit" disabled={processing || isCompressing}>
              {processing ? "Menyimpan..." : isCompressing ? "Mengompres..." : "Simpan"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
