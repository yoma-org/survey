'use client';

import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';
import { useTranslations } from 'next-intl';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import type { SmtpSettings } from '@/lib/types';

type InitialSettings = Omit<SmtpSettings, 'password'> | null;

interface Props {
  initialSettings?: InitialSettings;
}

export function SMTPSettingsForm({ initialSettings }: Props) {
  const t = useTranslations('settings');

  const [host, setHost] = useState(initialSettings?.host ?? '');
  const [port, setPort] = useState(initialSettings?.port ?? '587');
  const [username, setUsername] = useState(initialSettings?.username ?? '');
  const [password, setPassword] = useState('');
  const [fromAddress, setFromAddress] = useState(initialSettings?.fromAddress ?? '');
  const [fromName, setFromName] = useState(initialSettings?.fromName ?? '');

  const [showPassword, setShowPassword] = useState(false);
  const [testLoading, setTestLoading] = useState(false);
  const [testResult, setTestResult] = useState<{ ok: boolean; error?: string } | null>(null);
  const [testResultVisible, setTestResultVisible] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);

  const canTest = Boolean(host && port && username && password && fromAddress);

  const handleTestEmail = async () => {
    setTestLoading(true);
    setTestResult(null);
    setTestResultVisible(false);
    try {
      const res = await fetch('/api/settings/smtp/test', { method: 'POST' });
      const data = await res.json() as { ok: boolean; error?: string };
      setTestResult(data);
      setTestResultVisible(true);
      if (data.ok) {
        // Auto-hide success message after 5 seconds
        setTimeout(() => {
          setTestResultVisible(false);
        }, 5000);
      }
    } catch {
      setTestResult({ ok: false, error: 'Network error' });
      setTestResultVisible(true);
    } finally {
      setTestLoading(false);
    }
  };

  const handleSave = async () => {
    setSaveLoading(true);
    try {
      const res = await fetch('/api/settings/smtp', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ host, port, username, password, fromAddress, fromName }),
      });
      if (res.ok) {
        toast.success(t('saveSuccess'));
      } else {
        toast.error(t('saveError'));
      }
    } catch {
      toast.error(t('saveError'));
    } finally {
      setSaveLoading(false);
    }
  };

  const handleFieldChange = () => {
    // Clear test result when admin edits a field
    setTestResult(null);
    setTestResultVisible(false);
  };

  return (
    <div className="space-y-6 max-w-lg">
      {/* Host */}
      <div className="space-y-2">
        <Label htmlFor="smtp-host">{t('hostLabel')}</Label>
        <Input
          id="smtp-host"
          value={host}
          placeholder={t('hostPlaceholder')}
          onChange={e => { setHost(e.target.value); handleFieldChange(); }}
        />
      </div>

      {/* Port */}
      <div className="space-y-2">
        <Label htmlFor="smtp-port">{t('portLabel')}</Label>
        <Input
          id="smtp-port"
          value={port}
          placeholder={t('portPlaceholder')}
          onChange={e => { setPort(e.target.value); handleFieldChange(); }}
        />
      </div>

      {/* Username */}
      <div className="space-y-2">
        <Label htmlFor="smtp-username">{t('usernameLabel')}</Label>
        <Input
          id="smtp-username"
          value={username}
          placeholder={t('usernamePlaceholder')}
          onChange={e => { setUsername(e.target.value); handleFieldChange(); }}
        />
      </div>

      {/* Password with show/hide toggle */}
      <div className="space-y-2">
        <Label htmlFor="smtp-password">{t('passwordLabel')}</Label>
        <div className="relative">
          <Input
            id="smtp-password"
            type={showPassword ? 'text' : 'password'}
            value={password}
            placeholder={t('passwordPlaceholder')}
            onChange={e => { setPassword(e.target.value); handleFieldChange(); }}
            className="pr-10"
          />
          <button
            type="button"
            onClick={() => setShowPassword(prev => !prev)}
            aria-label={showPassword ? t('hidePassword') : t('showPassword')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/50 rounded"
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {/* From Address */}
      <div className="space-y-2">
        <Label htmlFor="smtp-from-address">{t('fromAddressLabel')}</Label>
        <Input
          id="smtp-from-address"
          value={fromAddress}
          placeholder={t('fromAddressPlaceholder')}
          onChange={e => { setFromAddress(e.target.value); handleFieldChange(); }}
        />
      </div>

      {/* From Name */}
      <div className="space-y-2">
        <Label htmlFor="smtp-from-name">{t('fromNameLabel')}</Label>
        <Input
          id="smtp-from-name"
          value={fromName}
          placeholder={t('fromNamePlaceholder')}
          onChange={e => { setFromName(e.target.value); handleFieldChange(); }}
        />
      </div>

      {/* Test result feedback */}
      {testResult && testResultVisible && (
        <p
          className={`text-sm transition-opacity duration-500 ${
            testResultVisible ? 'opacity-100' : 'opacity-0'
          } ${testResult.ok ? 'text-green-600' : 'text-red-600'}`}
        >
          {testResult.ok
            ? t('testSuccess', { address: fromAddress })
            : t('testFailure', { error: testResult.error ?? '' })}
        </p>
      )}

      {/* Action buttons */}
      <div className="flex gap-3">
        <Button onClick={handleSave} disabled={saveLoading}>
          {t('saveButton')}
        </Button>
        <Button
          variant="outline"
          onClick={handleTestEmail}
          disabled={!canTest || testLoading}
        >
          {testLoading ? t('testSending') : t('testButton')}
        </Button>
      </div>
    </div>
  );
}
