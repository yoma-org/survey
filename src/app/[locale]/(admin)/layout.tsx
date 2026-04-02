// src/app/[locale]/(admin)/layout.tsx
import { Toaster } from 'sonner';
import { cachedGetSmtpSettings, cachedListSurveys } from '@/lib/cache';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { AdminLayoutClient } from '@/components/admin/AdminLayoutClient';
import { ScatteredPixels } from '@/components/motion/ScatteredPixels';
import { QueryProvider } from '@/components/providers/QueryProvider';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const [settings, surveys] = await Promise.all([
    cachedGetSmtpSettings(),
    cachedListSurveys(),
  ]);
  const hasSmtp = settings !== null;
  const latestActiveSurveyId = surveys.filter(s => s.status === 'active').at(-1)?.id ?? surveys.at(-1)?.id;

  return (
    <div className="flex min-h-screen bg-white relative">
      <ScatteredPixels />
      <AdminSidebar latestActiveSurveyId={latestActiveSurveyId} />
      <main className="flex-1 overflow-auto relative z-10">
        <div className="max-w-[1200px] mx-auto">
          <QueryProvider>
            <AdminLayoutClient hasSmtp={hasSmtp}>
              {children}
            </AdminLayoutClient>
          </QueryProvider>
        </div>
      </main>
      <Toaster richColors />
    </div>
  );
}
