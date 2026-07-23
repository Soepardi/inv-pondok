import { useForm } from "@inertiajs/react";
import {
  Dialog,
  DialogContent,
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
  photo: File | null;
  purchase_year: number | string;
  source_of_funds: string;
}

export default function CreateItemDialog({ open, onClose, institutions }: Props) {
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
    photo: null,
    purchase_year: "",
    source_of_funds: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    post("/items", {
      forceFormData: true,
      onSuccess: () => {
        reset();
        onClose();
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
                value={data.price}
                onChange={(e) => setData("price", e.target.value)}
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
                value={data.stock}
                onChange={(e) => setData("stock", e.target.value)}
                placeholder="Jumlah stok"
              />
              {errors.stock && <p className="text-red-500 text-sm">{errors.stock}</p>}
            </div>
          </div>

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

          {/* Tahun Pembelian & Sumber Dana */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label htmlFor="purchase_year">Tahun Pembelian</Label>
              <Input
                id="purchase_year"
                type="number"
                value={data.purchase_year}
                onChange={(e) => setData("purchase_year", e.target.value)}
                placeholder="Contoh: 2024"
              />
              {errors.purchase_year && (
                <p className="text-red-500 text-sm">{errors.purchase_year}</p>
              )}
            </div>

            <div className="space-y-1">
              <Label htmlFor="source_of_funds">Sumber Dana</Label>
              <Select
                value={data.source_of_funds}
                onValueChange={(value) => setData("source_of_funds", value)}
              >
                <SelectTrigger id="source_of_funds">
                  <SelectValue placeholder="Pilih sumber dana" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Sumber Dana</SelectLabel>
                    {["Yayasan", "Komite Sekolah", "Dana BOS", "UPZ"].map((opt) => (
                      <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
              {errors.source_of_funds && (
                <p className="text-red-500 text-sm">{errors.source_of_funds}</p>
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
          <div className="space-y-1">
            <Label htmlFor="photo">Foto</Label>
            <Input
              id="photo"
              type="file"
              onChange={(e) => setData("photo", e.target.files?.[0] || null)}
            />
            {errors.photo && (
              <p className="text-red-500 text-sm">{errors.photo}</p>
            )}
          </div>

          {/* Submit */}
          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Batal
            </Button>
            <Button type="submit" disabled={processing}>
              {processing ? "Menyimpan..." : "Simpan"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
