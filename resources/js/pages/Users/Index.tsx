import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, router, usePage } from '@inertiajs/react';
import users from '@/routes/users';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Plus,
  Pencil,
  Trash2,
  User as UserIcon,
  Mail,
  Shield,
  MoreVertical,
  UserPlus
} from 'lucide-react';
import { useState } from 'react';
import EditUserDialog from './EditUserDialog';
import CreateUserDialog from './CreateUserDialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface Institution {
  id: number;
  name: string;
}

interface User {
  id: number;
  name: string;
  email: string;
  password?: string;
  role: 'admin' | 'user';
  institution_id?: number | null;
}

interface UsersProps {
  users: User[];
  institutions: Institution[];
  flash: { success?: string; error?: string };
}

const breadcrumbs: BreadcrumbItem[] = [
  {
    title: 'Manajemen User',
    href: users.index().url,
  },
];

const getRoleVariant = (role: string) => {
  return role === 'admin' ? 'default' : 'secondary';
};

const getRoleText = (role: string) => {
  return role === 'admin' ? 'Administrator' : 'User';
};

export default function UserManagement({ users: data, institutions, flash }: UsersProps) {
  const { auth } = usePage().props as unknown as { auth: { user: { id: number } } };
  const [showCreate, setShowCreate] = useState(false);
  const [editUser, setEditUser] = useState<User | null>(null);

  const handleDelete = (user: User) => {
    if (user.id === auth.user.id) {
      alert("Anda tidak dapat menghapus akun sendiri.");
      return;
    }
    if (confirm(`Yakin menghapus user "${user.name}"?`)) {
      const result = users.destroy(user.id);
      router.delete(result.url);
    }
  };

  const adminCount = data.filter(user => user.role === 'admin').length;
  const userCount = data.filter(user => user.role === 'user').length;

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Manajemen User" />

      <div className="container mx-auto py-6 space-y-6 p-4">
        {/* Header */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <UserIcon className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h3 className="text-2xl font-bold tracking-tight">Manajemen User</h3>
              <p className="text-muted-foreground">
                Kelola semua user dan akses aplikasi
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

        {/* Stats Grid */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold">{data.length}</p>
                  <p className="text-sm text-muted-foreground">Total Users</p>
                </div>
                <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                  <UserIcon className="h-5 w-5 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold text-purple-600">{adminCount}</p>
                  <p className="text-sm text-muted-foreground">Administrator</p>
                </div>
                <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center">
                  <Shield className="h-5 w-5 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold text-green-600">{userCount}</p>
                  <p className="text-sm text-muted-foreground">Regular Users</p>
                </div>
                <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                  <UserIcon className="h-5 w-5 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Header Actions */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <h2 className="text-lg font-semibold">Daftar User</h2>
            <p className="text-sm text-muted-foreground">
              {data.length} user terdaftar dalam sistem
            </p>
          </div>
          <Button onClick={() => setShowCreate(true)} className="gap-2">
            <UserPlus className="h-4 w-4" />
            Tambah User Baru
          </Button>
        </div>

        {/* Users Grid */}
        {data.length > 0 ? (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {data.map((user) => (
              <Card key={user.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <UserIcon className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{user.name}</CardTitle>
                        <Badge variant={getRoleVariant(user.role)} className="mt-1">
                          {getRoleText(user.role)}
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
                        <DropdownMenuItem onClick={() => setEditUser(user)}>
                          <Pencil className="h-4 w-4 mr-2" />
                          Edit User
                        </DropdownMenuItem>
                        {user.id !== auth.user.id && (
                          <>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => handleDelete(user)}
                              className="text-destructive"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Hapus User
                            </DropdownMenuItem>
                          </>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardHeader>
                <CardContent className="pb-3">
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-sm">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">{user.email}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Shield className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground capitalize">{user.role}</span>
                    </div>
                    {user.role === 'admin' && user.institution_id && (
                      <div className="flex items-center gap-2 text-sm">
                        <div className="h-4 w-4 text-muted-foreground flex items-center justify-center font-bold text-xs border rounded-sm">I</div>
                        <span className="text-muted-foreground"> Institution ID: {user.institution_id}</span>
                      </div>
                    )}
                  </div>
                </CardContent>
                <CardFooter className="pt-3 border-t">
                  <div className="flex gap-2 w-full">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setEditUser(user)}
                      className="flex-1 gap-2"
                    >
                      <Pencil className="h-3 w-3" />
                      Edit
                    </Button>
                    {user.id !== auth.user.id && (
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDelete(user)}
                        className="flex-1 gap-2"
                      >
                        <Trash2 className="h-3 w-3" />
                        Hapus
                      </Button>
                    )}
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
                  <UserIcon className="h-10 w-10 text-muted-foreground" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-semibold">Belum ada user</h3>
                  <p className="text-muted-foreground">
                    Mulai dengan menambahkan user pertama untuk mengelola akses aplikasi.
                  </p>
                </div>
                <Button onClick={() => setShowCreate(true)} className="mt-4 gap-2">
                  <UserPlus className="h-4 w-4" />
                  Tambah User Pertama
                </Button>
              </div>
            </CardContent>
          </Card>
        )}


        {/* Dialogs */}
        <CreateUserDialog
          open={showCreate}
          onClose={() => setShowCreate(false)}
          users={data}
          institutions={institutions}
        />
        {editUser && (
          <EditUserDialog
            open={!!editUser}
            onClose={() => setEditUser(null)}
            user={editUser}
            institutions={institutions}
          />
        )}
      </div>
    </AppLayout>
  );
}