import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import { router } from '@inertiajs/react';
import institutions from '@/routes/institutions';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Plus,
  Pencil,
  Trash2,
  Building,
  Hash,
  FileText,
  Users,
  MoreVertical
} from 'lucide-react';
import { useState } from 'react';
import EditInstitutionDialog from './EditInstitutionDialog';
import CreateInstitutionDialog from './CreateInstitutionDialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface Institution {
  destroy(id: number): unknown;
  id: number;
  name: string;
  code: string;
  description?: string;
}

interface InstitutionsProps {
  institutions: Institution[];
  flash: { success?: string; error?: string };
}

const breadcrumbs: BreadcrumbItem[] = [
  {
    title: 'Manajemen Instansi',
    href: institutions.index().url,
  },
];

export default function Institutions({ institutions: data, flash }: InstitutionsProps) {
  const [showCreate, setShowCreate] = useState(false);
  const [editInstitution, setEditInstitution] = useState<Institution | null>(null);

  const handleDelete = (institution: Institution) => {
    if (confirm(`Yakin menghapus instansi "${institution.name}"?`)) {
      const result = institution.destroy(institution.id) as { url: string };
      router.delete(result.url);
    }
  };

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Manajemen Instansi" />
      
      <div className="container mx-auto py-6 space-y-6 p-4">
        {/* Header */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Building className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Manajemen Instansi</h1>
              <p className="text-muted-foreground">
                Kelola semua instansi dan institusi di PTM
              </p>
            </div>
          </div>
        </div>

        {/* Flash Messages */}
        <div className="space-y-3">
          {flash?.success && (
            <Alert className="bg-green-50 border-green-200">
              <AlertDescription className="text-green-800">
                {flash.success}
              </AlertDescription>
            </Alert>
          )}
          {flash?.error && (
            <Alert className="bg-red-50 border-red-200">
              <AlertDescription className="text-red-800">
                {flash.error}
              </AlertDescription>
            </Alert>
          )}
        </div>

        {/* Header Actions */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <h2 className="text-lg font-semibold">Daftar Instansi</h2>
            <p className="text-sm text-muted-foreground">
              {data.length} instansi terdaftar dalam sistem
            </p>
          </div>
          <Button onClick={() => setShowCreate(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            Tambah Instansi Baru
          </Button>
        </div>

        {/* Institutions Grid */}
        {data.length > 0 ? (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {data.map((institution) => (
              <Card key={institution.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Building className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{institution.name}</CardTitle>
                        <Badge variant="secondary" className="mt-1">
                          {institution.code}
                        </Badge>
                      </div>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => setEditInstitution(institution)}>
                          <Pencil className="h-4 w-4 mr-2" />
                          Edit Instansi
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                          onClick={() => handleDelete(institution)}
                          className="text-destructive"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Hapus Instansi
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardHeader>
                <CardContent className="pb-3">
                  {institution.description ? (
                    <div className="space-y-3">
                      <div className="flex items-start gap-2 text-sm text-muted-foreground">
                        <FileText className="h-4 w-4 mt-0.5 flex-shrink-0" />
                        <p className="line-clamp-3">{institution.description}</p>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <FileText className="h-4 w-4" />
                      <span>Tidak ada deskripsi</span>
                    </div>
                  )}
                </CardContent>
                <CardFooter className="pt-3 border-t">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Users className="h-3 w-3" />
                    <span>Terdaftar dalam sistem</span>
                  </div>
                </CardFooter>
              </Card>
            ))}
          </div>
        ) : (
          /* Empty State */
          <Card className="border-dashed">
            <CardContent className="p-12 text-center">
              <div className="max-w-md mx-auto space-y-4">
                <div className="h-20 w-20 mx-auto bg-muted rounded-full flex items-center justify-center">
                  <Building className="h-10 w-10 text-muted-foreground" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-semibold">Belum ada instansi</h3>
                  <p className="text-muted-foreground">
                    Mulai dengan menambahkan instansi pertama Anda untuk mengelola institusi di PTM.
                  </p>
                </div>
                <Button onClick={() => setShowCreate(true)} className="mt-4 gap-2">
                  <Plus className="h-4 w-4" />
                  Tambah Instansi Pertama
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Quick Stats */}
        {data.length > 0 && (
          <Card>
            <CardContent className="p-6">
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">{data.length}</div>
                  <div className="text-sm text-muted-foreground">Total Instansi</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {data.filter(inst => inst.description && inst.description.length > 0).length}
                  </div>
                  <div className="text-sm text-muted-foreground">Dengan Deskripsi</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {new Set(data.map(inst => inst.code)).size}
                  </div>
                  <div className="text-sm text-muted-foreground">Kode Unik</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600">
                    {Math.max(...data.map(inst => inst.name.length))}
                  </div>
                  <div className="text-sm text-muted-foreground">Karakter Terpanjang</div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Dialogs */}
        <CreateInstitutionDialog
          open={showCreate}
          onClose={() => setShowCreate(false)}
          institutions={[]}
        />
        {editInstitution && (
          <EditInstitutionDialog
            open={!!editInstitution}
            onClose={() => setEditInstitution(null)}
            institutions={editInstitution}
          />
        )}
      </div>
    </AppLayout>
  );
}