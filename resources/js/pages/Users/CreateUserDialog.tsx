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



interface User {
  id: number;
  name: string;
  email: string;
  password?: string;
  role: 'admin' | 'user';

}

interface Institution {
  id: number;
  name: string;
}

interface Props {
  open: boolean;
  onClose: () => void;
  users: User[];
  institutions: Institution[];
}

interface UserForm {
  name: string;
  email: string;
  password?: string;
  password_confirmation?: string;
  role: 'admin' | 'user';
  institution_id: string | null; // Select value returns string usually
}

export default function CreateUserDialog({ open, onClose, users, institutions }: Props) {
  const { data, setData, post, processing, errors, reset } = useForm<UserForm>({
    name: "",
    email: "",
    password: "",
    role: 'user',
    institution_id: null,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    post("/users", {
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
          <DialogTitle>Tambah Pengguna</DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Tambahkan akun pengguna baru ke sistem.
          </DialogDescription>
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
          {/* Email */}
          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              value={data.email}
              onChange={(e) => setData("email", e.target.value)}
            />
            {errors.email && <p className="text-red-500 text-sm">{errors.email}</p>}
          </div>
          {/*Password*/}
          <div>
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              value={data.password}
              onChange={(e) => setData("password", e.target.value)}
            />
            {errors.password && <p className="text-red-500 text-sm">{errors.password}</p>}
          </div>
          <div>
            <Label htmlFor="password_confirmation">Konfirmasi Password</Label>
            <Input
              id="password_confirmation"
              type="password"
              value={data.password_confirmation}
              onChange={(e) => setData("password_confirmation", e.target.value)}
            />
            {errors.password_confirmation && (
              <p className="text-red-500 text-sm">{errors.password_confirmation}</p>
            )}
          </div>
          {/* Role */}
          <div>
            <Label htmlFor="role">Role</Label>
            <Select
              value={data.role || ""}
              onValueChange={(value) => setData("role", value as UserForm["role"])}
            >
              <SelectTrigger id="role">
                <SelectValue placeholder="Pilih status" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Role</SelectLabel>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="user">User</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
            {errors.role && <p className="text-red-500 text-sm">{errors.role}</p>}
          </div>

          {/* Institution Selection (Only for Admin) */}
          {data.role === 'admin' && (
            <div>
              <Label htmlFor="institution">Institusi (Opsional)</Label>
              <Select
                value={data.institution_id?.toString() || ""}
                onValueChange={(value) => setData("institution_id", value === "none" ? null : value)}
              >
                <SelectTrigger id="institution">
                  <SelectValue placeholder="Pilih institusi" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Institusi</SelectLabel>
                    <SelectItem value="none">Global Admin (Semua Institusi)</SelectItem>
                    {institutions.map((inst) => (
                      <SelectItem key={inst.id} value={inst.id.toString()}>
                        {inst.name}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground mt-1">
                Biarkan kosong agar menjadi admin global yang dapat melihat semua institusi.
              </p>
            </div>
          )}

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

