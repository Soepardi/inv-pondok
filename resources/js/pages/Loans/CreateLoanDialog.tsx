import { useForm, router } from "@inertiajs/react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Calendar,
  Package,
  MapPin,
  Building,
  AlertCircle,
  Clock,
  Info,
  CheckCircle2,
  PackageOpen
} from "lucide-react";
import { format, addDays } from "date-fns";
import { id } from "date-fns/locale";
import { useState, useEffect } from "react";
import { Calendar as ShadCalendar } from "@/components/ui/calendar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

import { Item } from "@/types";

interface Props {
  open: boolean;
  onClose: () => void;
  item?: Item | null;
}

interface LoanForm {
  item_id?: number;
  notes?: string;
  stock: number;
  due_date: string;
  loan_date: string;
}

export default function LoanItemDialog({ open, onClose, item }: Props) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const minDueDate = addDays(today, 1);
  const maxDueDate = addDays(today, 30);

  const { data, setData, post, processing, errors, reset } = useForm<LoanForm>({
    item_id: item?.id,
    notes: "",
    stock: 1,
    due_date: format(minDueDate, 'yyyy-MM-dd'),
    loan_date: format(today, 'yyyy-MM-dd'),
  });

  const [selectedDueDate, setSelectedDueDate] = useState<Date | undefined>(minDueDate);
  const [dateError, setDateError] = useState<string>("");
  const [stockError, setStockError] = useState<string>("");

  useEffect(() => {
    if (open && item) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const minDueDate = addDays(today, 1);

      setData({
        item_id: item.id,
        notes: "",
        stock: 1,
        due_date: format(minDueDate, 'yyyy-MM-dd'),
        loan_date: format(today, 'yyyy-MM-dd'),
      });
      setSelectedDueDate(minDueDate);
      setDateError("");
      setStockError("");
    } else if (!open) {
      reset();
      setDateError("");
      setStockError("");
    }
  }, [open, item]);

  const handleStockChange = (value: number) => {
    if (!item) return;

    if (value < 1) {
      setStockError("Jumlah tidak boleh kurang dari 1");
      setData("stock", 1);
      return;
    }

    if (value > item.stock) {
      setStockError(`Jumlah tidak boleh melebihi stok tersedia (${item.stock})`);
      setData("stock", item.stock);
      return;
    }

    setStockError("");
    setData("stock", value);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!item) return;

    // Validasi frontend
    const loanDate = new Date(data.loan_date);
    const dueDate = new Date(data.due_date);

    loanDate.setHours(0, 0, 0, 0);
    dueDate.setHours(0, 0, 0, 0);

    if (dueDate <= loanDate) {
      setDateError("Tanggal pengembalian harus setelah tanggal pinjam");
      return;
    }

    const maxDate = addDays(loanDate, 30);
    if (dueDate > maxDate) {
      setDateError("Maksimal peminjaman adalah 30 hari");
      return;
    }

    if (data.stock < 1) {
      setStockError("Jumlah tidak boleh kurang dari 1");
      return;
    }

    if (data.stock > item.stock) {
      setStockError(`Jumlah tidak boleh melebihi stok tersedia (${item.stock})`);
      return;
    }

    setDateError("");
    setStockError("");

    post("/loans", {
      preserveScroll: true,
      onSuccess: () => {
        reset();
        onClose();
        router.reload({ only: ['items'] });
      },
      onError: (errors) => {
        if (errors.due_date) {
          setDateError(errors.due_date);
        }
        if (errors.stock) {
          setStockError(errors.stock);
        }
      },
    });
  };

  const handleDueDateSelect = (date: Date | undefined) => {
    if (date) {
      date.setHours(0, 0, 0, 0);

      const loanDate = new Date(data.loan_date);
      loanDate.setHours(0, 0, 0, 0);

      setDateError("");

      if (date <= loanDate) {
        setDateError("Tanggal pengembalian harus setelah tanggal pinjam");
        return;
      }

      const maxDate = addDays(loanDate, 30);
      if (date > maxDate) {
        setDateError("Maksimal peminjaman adalah 30 hari");
        return;
      }

      setSelectedDueDate(date);
      setData("due_date", format(date, 'yyyy-MM-dd'));
    }
  };

  const getDurationDays = (): number => {
    if (!selectedDueDate) return 0;

    const loanDate = new Date(data.loan_date);
    loanDate.setHours(0, 0, 0, 0);

    const dueDate = new Date(selectedDueDate);
    dueDate.setHours(0, 0, 0, 0);

    const diffTime = dueDate.getTime() - loanDate.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const isDateValid = (): boolean => {
    if (!selectedDueDate) return false;

    const loanDate = new Date(data.loan_date);
    const dueDate = new Date(selectedDueDate);

    return dueDate > loanDate && dueDate <= addDays(loanDate, 30);
  };

  const isStockValid = (): boolean => {
    if (!item) return false;
    return data.stock >= 1 && data.stock <= item.stock;
  };

  if (!item) return null;

  const canBorrow = item.condition === 'tersedia' && item.status === 'baik';
  const durationDays = getDurationDays();
  const isValid = isDateValid() && isStockValid();
  const maxStock = item.stock;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md max-h-[85vh] flex flex-col">
        <DialogHeader className="pb-4 flex-shrink-0">
          <DialogTitle className="text-lg flex items-center gap-2">
            <Package className="h-5 w-5 text-blue-600" />
            Pinjam Barang
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Lengkapi formulir peminjaman barang berikut.
          </DialogDescription>
        </DialogHeader>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto pr-1 space-y-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Info Item - Lebih Kompak */}
            <Card className="bg-muted/50">
              <CardContent className="p-3 space-y-2 text-sm">
                <div className="font-medium text-foreground line-clamp-1">{item.name}</div>
                <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    <span className="line-clamp-1 max-w-24">{item.location}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Building className="h-3 w-3" />
                    <span className="line-clamp-1 max-w-24">{item.institution?.name || "-"}</span>
                  </div>
                </div>
                <div className="flex flex-wrap gap-1">
                  <Badge
                    variant={item.status === 'baik' ? 'default' : 'destructive'}
                    className="text-xs"
                  >
                    {item.status}
                  </Badge>
                  <Badge
                    variant={
                      item.condition === 'tersedia' ? 'default' :
                        item.condition === 'dipinjam' ? 'secondary' : 'destructive'
                    }
                    className="text-xs"
                  >
                    {item.condition}
                  </Badge>
                </div>

                {/* Stock Info - Lebih Kecil */}
                <div className="flex items-center gap-2 text-xs text-blue-600 bg-blue-50 dark:bg-blue-950/30 dark:text-blue-400 p-1.5 rounded">
                  <PackageOpen className="h-3 w-3" />
                  Stok: <span className="font-semibold">{item.stock}</span>
                </div>

                {!canBorrow && (
                  <div className="flex items-center gap-2 text-xs text-amber-600 bg-amber-100 dark:bg-amber-950/30 dark:text-amber-400 p-1.5 rounded">
                    <AlertCircle className="h-3 w-3" />
                    Tidak dapat dipinjam
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Loan Date - Lebih Kompak */}
            <div className="space-y-2">
              <Label className="text-sm">Tanggal Pinjam</Label>
              <div className="flex items-center gap-2 p-2 border rounded-md bg-muted/30 text-sm">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="text-foreground">
                  {format(new Date(data.loan_date), "dd/MM/yyyy")}
                </span>
                <Badge variant="outline" className="ml-auto text-xs">
                  Hari Ini
                </Badge>
              </div>
            </div>

            {/* Due Date - Lebih Kompak */}
            <div className="space-y-2">
              <Label className="text-sm flex items-center gap-2">
                Tanggal Pengembalian
                {isDateValid() && (
                  <CheckCircle2 className="h-3 w-3 text-green-600" />
                )}
              </Label>

              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-sm h-9"
                    disabled={!canBorrow}
                    type="button"
                  >
                    <Calendar className="mr-2 h-4 w-4" />
                    {selectedDueDate
                      ? format(selectedDueDate, "dd/MM/yyyy")
                      : "Pilih tanggal"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-64 p-3" align="start">
                  <ShadCalendar
                    mode="single"
                    selected={selectedDueDate}
                    onSelect={handleDueDateSelect}
                    disabled={(date) => {
                      date.setHours(0, 0, 0, 0);
                      const today = new Date();
                      today.setHours(0, 0, 0, 0);
                      const loanDate = new Date(data.loan_date);
                      loanDate.setHours(0, 0, 0, 0);
                      const minDate = addDays(loanDate, 1);
                      const maxDate = addDays(loanDate, 30);

                      return date <= loanDate || date > maxDate;
                    }}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>

              {(errors.due_date || dateError) && (
                <p className="text-red-500 text-xs flex items-center gap-1">
                  <Info className="h-3 w-3" />
                  {dateError || errors.due_date}
                </p>
              )}
            </div>

            {/* Duration Info - Hanya Tampil Jika Valid */}
            {isDateValid() && (
              <div className={`p-2 rounded border text-center text-xs ${durationDays > 20
                  ? "bg-amber-50 border-amber-200 dark:bg-amber-950/20 dark:border-amber-800 text-amber-800 dark:text-amber-300"
                  : "bg-green-50 border-green-200 dark:bg-green-950/20 dark:border-green-800 text-green-800 dark:text-green-300"
                }`}>
                <span className="font-semibold">Durasi: {durationDays} hari</span>
                {durationDays > 20 && (
                  <div className="mt-0.5 text-xs">Peminjaman jangka panjang</div>
                )}
              </div>
            )}

            {/* Stock Input - Lebih Kompak */}
            <div className="space-y-2">
              <Label className="text-sm flex items-center gap-2">
                Jumlah
                {isStockValid() && (
                  <CheckCircle2 className="h-3 w-3 text-green-600" />
                )}
              </Label>
              <div className="flex gap-2 items-center">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleStockChange(data.stock - 1)}
                  disabled={data.stock <= 1 || !canBorrow}
                  className="h-8 w-8"
                >
                  -
                </Button>
                <Input
                  type="number"
                  min={1}
                  max={maxStock}
                  value={data.stock}
                  onChange={(e) => handleStockChange(Number(e.target.value))}
                  disabled={!canBorrow}
                  className="text-center h-8 flex-1"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleStockChange(data.stock + 1)}
                  disabled={data.stock >= maxStock || !canBorrow}
                  className="h-8 w-8"
                >
                  +
                </Button>
              </div>
              {(errors.stock || stockError) && (
                <p className="text-red-500 text-xs flex items-center gap-1">
                  <Info className="h-3 w-3" />
                  {stockError || errors.stock}
                </p>
              )}
              <p className="text-xs text-muted-foreground">
                Maksimal: {maxStock} item
              </p>
            </div>

            {/* Notes - Lebih Kecil */}
            <div className="space-y-2">
              <Label className="text-sm">Catatan (opsional)</Label>
              <Textarea
                value={data.notes}
                onChange={(e) => setData("notes", e.target.value)}
                placeholder="Keperluan peminjaman..."
                disabled={!canBorrow}
                className="min-h-[60px] text-sm"
              />
              {errors.notes && (
                <p className="text-red-500 text-xs">{errors.notes}</p>
              )}
            </div>

            {/* Error Summary */}
            {Object.keys(errors).filter(key => !['due_date', 'stock'].includes(key)).length > 0 && (
              <div className="bg-destructive/10 border border-destructive/20 rounded p-2">
                <p className="text-destructive text-sm font-medium mb-1">Perhatian:</p>
                <ul className="text-destructive text-xs space-y-0.5">
                  {Object.entries(errors)
                    .filter(([key]) => !['due_date', 'stock'].includes(key))
                    .map(([key, error]) => (
                      <li key={key}>• {error}</li>
                    ))
                  }
                </ul>
              </div>
            )}
          </form>
        </div>

        {/* Fixed Footer Buttons */}
        <div className="flex gap-2 pt-4 border-t flex-shrink-0">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={processing}
            className="flex-1 text-sm h-9"
          >
            Batal
          </Button>
          <Button
            type="submit"
            disabled={processing || !canBorrow || !isValid}
            onClick={handleSubmit}
            className="flex-1 text-sm h-9"
          >
            {processing ? (
              <div className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
                Mengajukan...
              </div>
            ) : (
              "Ajukan"
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}