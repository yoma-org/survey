'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { Survey, Token } from '@/lib/types';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

interface SendResult {
  email: string;
  status: 'sent' | 'failed' | 'already-invited';
  error?: string;
}

interface Props {
  survey: Survey;
  surveys: Survey[];
  priorInvitations: Token[];
}

function parseEmails(raw: string): { valid: string[]; invalid: string[] } {
  const parts = raw.split(/[\n,;]+/);
  const valid: string[] = [];
  const invalid: string[] = [];
  const seen = new Set<string>();

  for (const part of parts) {
    const trimmed = part.trim().toLowerCase();
    if (!trimmed) continue;
    if (EMAIL_REGEX.test(trimmed)) {
      if (!seen.has(trimmed)) {
        seen.add(trimmed);
        valid.push(trimmed);
      }
    } else {
      invalid.push(trimmed);
    }
  }

  return { valid, invalid };
}

export function EmailDistributionForm({ survey, surveys, priorInvitations }: Props) {
  const t = useTranslations('email');
  const router = useRouter();

  const [selectedSurveyId, setSelectedSurveyId] = useState<string>(survey.id);
  const [emailsRaw, setEmailsRaw] = useState('');
  const [phase, setPhase] = useState<'form' | 'sending' | 'done'>('form');
  const [sent, setSent] = useState(0);
  const [total, setTotal] = useState(0);
  const [results, setResults] = useState<SendResult[]>([]);

  const { valid: parsedEmails, invalid: invalidEmails } = parseEmails(emailsRaw);

  const handleClear = useCallback(() => {
    setEmailsRaw('');
    setPhase('form');
    setSent(0);
    setTotal(0);
    setResults([]);
  }, []);

  const handleSendAnother = useCallback(() => {
    setEmailsRaw('');
    setPhase('form');
    setSent(0);
    setTotal(0);
    setResults([]);
    router.refresh();
  }, [router]);

  const handleSubmit = useCallback(async () => {
    if (!selectedSurveyId || parsedEmails.length === 0) return;

    setPhase('sending');
    setTotal(parsedEmails.length);
    setSent(0);

    try {
      const response = await fetch(`/api/surveys/${selectedSurveyId}/invite`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ emails: parsedEmails, locale: 'en' }),
      });

      const data = await response.json();
      const fetchedResults: SendResult[] = Array.isArray(data.results) ? data.results : [];

      // Show progress incrementally (simulate as we process the response)
      setSent(fetchedResults.length);
      setResults(fetchedResults);
    } catch {
      setResults([]);
    } finally {
      setPhase('done');
      router.refresh();
    }
  }, [selectedSurveyId, parsedEmails, router]);

  const canSend =
    selectedSurveyId.length > 0 && parsedEmails.length > 0 && invalidEmails.length === 0;

  const successCount = results.filter((r) => r.status === 'sent').length;
  const failCount = results.filter((r) => r.status === 'failed').length;
  const failedAddresses = results.filter((r) => r.status === 'failed').map((r) => r.email);

  return (
    <div>
      {/* Page heading */}
      <h1 className="text-xl font-semibold text-gray-900 mb-6">{t('inviteTitle')}</h1>

      {/* Send form */}
      {phase === 'form' && (
        <Card>
          <CardContent className="pt-6 space-y-5">
            {/* Survey select */}
            <div className="space-y-1.5">
              <Label>{t('inviteSurveyLabel')}</Label>
              <Select value={selectedSurveyId} onValueChange={(v) => { if (v) setSelectedSurveyId(v); }}>
                <SelectTrigger>
                  <SelectValue placeholder={t('inviteSurveyPlaceholder')} />
                </SelectTrigger>
                <SelectContent>
                  {surveys.map((s) => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Emails textarea */}
            <div className="space-y-1.5">
              <Label>{t('inviteEmailsLabel')}</Label>
              <Textarea
                value={emailsRaw}
                onChange={(e) => setEmailsRaw(e.target.value)}
                placeholder={t('inviteEmailsPlaceholder')}
                rows={6}
                className="font-mono text-sm"
              />
              {emailsRaw.trim() ? (
                <p className="text-xs text-muted-foreground">
                  {t('inviteEmailsCount', { count: parsedEmails.length })}
                </p>
              ) : (
                <p className="text-xs text-muted-foreground">{t('inviteEmailsNone')}</p>
              )}
              {invalidEmails.length > 0 && (
                <p className="text-xs text-red-600">
                  {t('inviteEmailsInvalid', { list: invalidEmails.join(', ') })}
                </p>
              )}
            </div>

            {/* Action buttons */}
            <div className="flex gap-3">
              <Button onClick={handleSubmit} disabled={!canSend}>
                {t('inviteSendButton')}
              </Button>
              <Button variant="ghost" onClick={handleClear} type="button">
                {t('inviteClearButton')}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Sending progress */}
      {phase === 'sending' && (
        <Card>
          <CardContent className="pt-6 space-y-4">
            <p className="text-sm text-gray-700">
              {t('inviteProgress', { sent, total })}
            </p>
            <Progress value={total > 0 ? (sent / total) * 100 : 0} />
          </CardContent>
        </Card>
      )}

      {/* Done summary */}
      {phase === 'done' && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-semibold">
              {t('inviteSuccessHeading', { total: successCount })}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {failCount > 0 && (
              <>
                <p className="text-sm text-red-600">
                  {t('invitePartialFailure', { failed: failCount, total: results.length })}
                </p>
                <p className="text-xs text-muted-foreground">
                  {t('inviteFailedAddresses', { list: failedAddresses.join(', ') })}
                </p>
              </>
            )}
            <Button onClick={handleSendAnother} variant="default">
              {t('inviteAnotherBatch')}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Invitation History Table — always visible */}
      <div className="mt-8">
        <h2 className="text-base font-semibold text-gray-900 mb-4">
          {t('inviteHistoryHeading')}
        </h2>

        {priorInvitations.length === 0 ? (
          <p className="text-sm text-muted-foreground">{t('inviteHistoryEmpty')}</p>
        ) : (
          <div className="overflow-x-auto border rounded-lg">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-3 py-2 text-left font-medium text-gray-600">
                    {t('inviteHistoryEmail')}
                  </th>
                  <th className="px-3 py-2 text-left font-medium text-gray-600">
                    {t('inviteHistoryStatus')}
                  </th>
                  <th className="px-3 py-2 text-left font-medium text-gray-600">
                    {t('inviteHistorySentAt')}
                  </th>
                </tr>
              </thead>
              <tbody>
                {priorInvitations.map((inv) => (
                  <tr key={inv.token} className="border-b last:border-0 hover:bg-gray-50">
                    <td className="px-3 py-2 font-mono text-xs">{inv.email}</td>
                    <td className="px-3 py-2">
                      {inv.status === 'submitted' ? (
                        <Badge variant="default">{t('statusSubmitted')}</Badge>
                      ) : (
                        <Badge variant="secondary">{t('statusPending')}</Badge>
                      )}
                    </td>
                    <td className="px-3 py-2 text-muted-foreground text-xs">
                      {new Date(inv.createdAt).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
