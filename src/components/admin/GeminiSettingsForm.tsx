'use client';

import { useState } from 'react';
import { Eye, EyeOff, Languages, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useTranslations } from 'next-intl';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';

interface Props {
  initialApiKey?: string; // masked or empty
}

export function GeminiSettingsForm({ initialApiKey }: Props) {
  const t = useTranslations('settings');

  const [apiKey, setApiKey] = useState(initialApiKey ?? '');
  const [showKey, setShowKey] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);
  const [testLoading, setTestLoading] = useState(false);
  const [testResult, setTestResult] = useState<{ ok: boolean; translation?: string; error?: string } | null>(null);

  const handleSave = async () => {
    setSaveLoading(true);
    try {
      const res = await fetch('/api/settings/app', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ geminiApiKey: apiKey }),
      });
      if (res.ok) {
        toast.success(t('geminiSaveSuccess'));
      } else {
        toast.error(t('geminiSaveError'));
      }
    } catch {
      toast.error(t('geminiSaveError'));
    } finally {
      setSaveLoading(false);
    }
  };

  const handleTest = async () => {
    setTestLoading(true);
    setTestResult(null);
    try {
      const res = await fetch('/api/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: 'I am proud to work here.',
          sourceLanguage: 'en',
          targetLanguage: 'my',
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setTestResult({ ok: true, translation: data.translatedText });
      } else {
        const data = await res.json().catch(() => ({ error: 'Unknown error' }));
        setTestResult({ ok: false, error: data.error });
      }
    } catch {
      setTestResult({ ok: false, error: 'Network error' });
    } finally {
      setTestLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-lg">
      {/* API Key */}
      <div className="space-y-2">
        <Label htmlFor="gemini-api-key">{t('geminiApiKeyLabel')}</Label>
        <div className="relative">
          <Input
            id="gemini-api-key"
            type={showKey ? 'text' : 'password'}
            value={apiKey}
            placeholder={t('geminiApiKeyPlaceholder')}
            onChange={e => { setApiKey(e.target.value); setTestResult(null); }}
            className="pr-10"
          />
          <button
            type="button"
            onClick={() => setShowKey(prev => !prev)}
            aria-label={showKey ? t('hidePassword') : t('showPassword')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/50 rounded"
          >
            {showKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
        <p className="text-xs text-muted-foreground">{t('geminiApiKeyHint')}</p>
      </div>

      {/* Test result */}
      {testResult && (
        <div className={`text-sm rounded-lg px-3 py-2 ${testResult.ok ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600'}`}>
          {testResult.ok ? (
            <div className="space-y-1">
              <div className="flex items-center gap-1.5 font-medium">
                <Languages className="w-4 h-4" />
                {t('geminiTestSuccess')}
              </div>
              <p className="font-myanmar text-sm">&ldquo;I am proud to work here.&rdquo; &rarr; {testResult.translation}</p>
            </div>
          ) : (
            <p>{t('geminiTestFailure', { error: testResult.error ?? '' })}</p>
          )}
        </div>
      )}

      {/* Action buttons */}
      <div className="flex gap-3">
        <Button onClick={handleSave} disabled={saveLoading}>
          {t('saveButton')}
        </Button>
        <Button
          variant="outline"
          onClick={handleTest}
          disabled={testLoading || !apiKey || apiKey === '••••••••'}
        >
          {testLoading ? (
            <><Loader2 className="w-4 h-4 mr-1 animate-spin" /> {t('geminiTestSending')}</>
          ) : (
            <><Languages className="w-4 h-4 mr-1" /> {t('geminiTestButton')}</>
          )}
        </Button>
      </div>
    </div>
  );
}
