'use client';

import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/**
 * Non-dismissible SMTP onboarding modal.
 *
 * Prevents dismiss via outside-press (onInteractOutside = e.preventDefault equivalent):
 *   → Dialog Root uses `disablePointerDismissal` prop
 * Prevents dismiss via escape key (onEscapeKeyDown = e.preventDefault equivalent):
 *   → onOpenChange intercepts reason === 'escape-key' and blocks close
 *
 * Only the "Configure Now" and "Skip for Now" buttons can close this modal.
 */
export function SMTPOnboardingModal({ open, onOpenChange }: Props) {
  const t = useTranslations('email');
  const router = useRouter();

  const handleConfigure = () => {
    onOpenChange(false);
    router.push('/admin/settings');
  };

  const handleSkip = () => {
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('smtp-onboarding-skipped', '1');
    }
    onOpenChange(false);
  };

  // Block outside-press dismiss (onInteractOutside preventDefault equivalent for base-ui)
  // Block escape-key dismiss (onEscapeKeyDown preventDefault equivalent for base-ui)
  const handleOpenChange = (
    nextOpen: boolean,
    eventDetails?: { reason?: string }
  ) => {
    // Only allow close via explicit button press ('close-press' reason)
    if (!nextOpen) {
      const reason = eventDetails?.reason;
      // onInteractOutside preventDefault: block outside-press
      // onEscapeKeyDown preventDefault: block escape-key
      if (reason !== 'close-press') {
        return;
      }
    }
    onOpenChange(nextOpen);
  };

  return (
    <Dialog
      open={open}
      onOpenChange={handleOpenChange as Parameters<typeof Dialog>[0]['onOpenChange']}
      disablePointerDismissal
    >
      <DialogContent
        showCloseButton={false}
        className="max-w-[480px]"
      >
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">
            {t('smtpModalTitle')}
          </DialogTitle>
          <DialogDescription className="text-sm">
            {t('smtpModalBody')}
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="mt-4">
          <Button variant="ghost" onClick={handleSkip}>
            {t('smtpModalSkip')}
          </Button>
          <Button onClick={handleConfigure}>
            {t('smtpModalConfigure')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
