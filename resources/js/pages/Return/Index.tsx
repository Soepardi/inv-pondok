import AppLayout from '@/layouts/app-layout';
import { dashboard } from '@/routes';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';


const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Pengembalian Pinjaman',
        href: return.index().url,
    },
];

export default function Return() {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Pengembalian Pinjaman" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
               
            </div>
        </AppLayout>
    );
}
