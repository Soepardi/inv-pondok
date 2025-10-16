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



interface Institution {
  id: number;
  name: string;
  code : string;
  description?: string;
}

interface Props {
  open: boolean;
  onClose: () => void;
  institutions: Institution[];
}

interface InstitutionForm {
  name: string;
  code: string;
  description: string;
}

export default function CreateInstituitionDialog({ open, onClose, institutions }: Props) {
  const { data, setData, post, processing, errors, reset } = useForm<InstitutionForm>({
    name: "",
    code: "",
    description: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    post("/institutions", {
    forceFormData: true,
    onSuccess: () => {
    reset();
    onClose();
      },
    });
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Tambah Institusi</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name */}
          <div>
            <Label htmlFor="name">Nama</Label>
            <Input
              id="name"
              value={data.name}
              onChange={(e) => setData("name", e.target.value)}
            />
            {errors.name && <p className="text-red-500 text-sm">{errors.name}</p>}
          </div>
          {/* code */}
          <div>
            <Label htmlFor="code">Kode</Label>
            <Input
              id="code"
              value={data.code}
              onChange={(e) => setData("code", e.target.value)}
            />
            {errors.name && <p className="text-red-500 text-sm">{errors.code}</p>}
          </div>
          {/* Description */}
          <div>
            <Label htmlFor="description">Deskripsi</Label>
            <Input
              id="description"
              value={data.description}
              onChange={(e) => setData("description", e.target.value)}
            />
            {errors.description && (
              <p className="text-red-500 text-sm">{errors.description}</p>
            )}
          </div>

          {/* Submit */}
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Batal
            </Button>
            <Button type="submit" disabled={processing}>
              Simpan
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

