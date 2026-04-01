'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { SMTPOnboardingModal } from './SMTPOnboardingModal';

interface Props {
  hasSmtp: boolean;
  children: React.ReactNode;
}

export function AdminLayoutClient({ hasSmtp, children }: Props) {
  const pathname = usePathname();
  const isSettingsPage = pathname.includes('/admin/settings');

  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    const skipped =
      typeof window !== 'undefined'
        ? sessionStorage.getItem('smtp-onboarding-skipped') === '1'
        : false;

    if (!hasSmtp && !skipped && !isSettingsPage) {
      setModalOpen(true);
    }
  }, [hasSmtp, isSettingsPage]);

  return (
    <>
      <SMTPOnboardingModal open={modalOpen} onOpenChange={setModalOpen} />
      {children}
    </>
  );
}
