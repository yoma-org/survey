// src/app/[locale]/(admin)/layout.tsx
'use server';

import { Toaster } from 'sonner';
import { getSmtpSettings } from '@/lib/services/smtp.service';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { AdminLayoutClient } from '@/components/admin/AdminLayoutClient';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const settings = await getSmtpSettings();
  const hasSmtp = settings !== null;

  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminSidebar />
      <main className="flex-1 overflow-auto">
        <AdminLayoutClient hasSmtp={hasSmtp}>
          {children}
        </AdminLayoutClient>
      </main>
      <Toaster />
    </div>
  );
}
