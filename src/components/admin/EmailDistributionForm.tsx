'use client';

import { useState, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Upload, FileText, X, Download } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import type { Survey, Token } from '@/lib/types';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

interface SendResult {
  email: string;
  status: 'sent' | 'failed' | 'already-invited';
  error?: string;
}

interface Props {
  survey: Survey;
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

function parseCsvEmails(csvText: string): { valid: string[]; invalid: string[] } {
  const lines = csvText.split(/\r?\n/);
  if (lines.length === 0) return { valid: [], invalid: [] };

  const headers = lines[0].split(',').map((h) => h.trim().toLowerCase().replace(/^"|"$/g, ''));
  const emailIdx = headers.findIndex(
    (h) => h === 'email' || h === 'email_address' || h === 'e-mail',
  );

  if (emailIdx === -1) return { valid: [], invalid: [] };

  const valid: string[] = [];
  const invalid: string[] = [];
  const seen = new Set<string>();

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    const cols = line.split(',').map((c) => c.trim().replace(/^"|"$/g, ''));
    const email = cols[emailIdx]?.trim().toLowerCase();
    if (!email) continue;

    if (EMAIL_REGEX.test(email)) {
      if (!seen.has(email)) {
        seen.add(email);
        valid.push(email);
      }
    } else {
      invalid.push(email);
    }
  }

  return { valid, invalid };
}

function downloadCsvTemplate() {
  const content = 'email\njohn@example.com\njane@example.com\n';
  const blob = new Blob([content], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'invitation_template.csv';
  a.click();
  URL.revokeObjectURL(url);
}

export function EmailDistributionForm({ survey, priorInvitations }: Props) {
  const t = useTranslations('email');
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [emailsRaw, setEmailsRaw] = useState('');
  const [phase, setPhase] = useState<'form' | 'sending' | 'done'>('form');
  const [sent, setSent] = useState(0);
  const [total, setTotal] = useState(0);
  const [results, setResults] = useState<SendResult[]>([]);

  // CSV state
  const [csvFileName, setCsvFileName] = useState<string | null>(null);
  const [csvEmails, setCsvEmails] = useState<string[]>([]);
  const [csvInvalid, setCsvInvalid] = useState<string[]>([]);
  const [csvError, setCsvError] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);

  const { valid: parsedEmails, invalid: invalidEmails } = parseEmails(emailsRaw);

  const handleClear = useCallback(() => {
    setEmailsRaw('');
    setPhase('form');
    setSent(0);
    setTotal(0);
    setResults([]);
  }, []);

  const handleCsvClear = useCallback(() => {
    setCsvFileName(null);
    setCsvEmails([]);
    setCsvInvalid([]);
    setCsvError(null);
    setShowPreview(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  }, []);

  const handleSendAnother = useCallback(() => {
    setEmailsRaw('');
    setCsvFileName(null);
    setCsvEmails([]);
    setCsvInvalid([]);
    setCsvError(null);
    setPhase('form');
    setSent(0);
    setTotal(0);
    setResults([]);
    if (fileInputRef.current) fileInputRef.current.value = '';
    router.refresh();
  }, [router]);

  const sendEmails = useCallback(
    async (emails: string[]) => {
      if (!survey.id || emails.length === 0) return;

      setPhase('sending');
      setTotal(emails.length);
      setSent(0);

      try {
        const response = await fetch(`/api/surveys/${survey.id}/invite`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ emails, locale: 'en' }),
        });

        const data = await response.json();
        const fetchedResults: SendResult[] = Array.isArray(data.results) ? data.results : [];

        setSent(fetchedResults.length);
        setResults(fetchedResults);
      } catch {
        setResults([]);
      } finally {
        setPhase('done');
        router.refresh();
      }
    },
    [survey.id, router],
  );

  const handleSubmit = useCallback(async () => {
    await sendEmails(parsedEmails);
  }, [sendEmails, parsedEmails]);

  const handleCsvConfirmSend = useCallback(async () => {
    setShowPreview(false);
    await sendEmails(csvEmails);
  }, [sendEmails, csvEmails]);

  const processCsvFile = useCallback(
    (file: File) => {
      setCsvError(null);

      if (!file.name.toLowerCase().endsWith('.csv')) {
        setCsvError(t('csvFormatError'));
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target?.result as string;
        const { valid, invalid } = parseCsvEmails(text);

        if (valid.length === 0 && invalid.length === 0) {
          setCsvError(t('csvParseError'));
          return;
        }

        if (valid.length === 0) {
          setCsvError(t('csvNoEmails'));
          return;
        }

        setCsvFileName(file.name);
        setCsvEmails(valid);
        setCsvInvalid(invalid);
        setShowPreview(true);
      };
      reader.readAsText(file);
    },
    [t],
  );

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) processCsvFile(file);
    },
    [processCsvFile],
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragOver(false);
      const file = e.dataTransfer.files?.[0];
      if (file) processCsvFile(file);
    },
    [processCsvFile],
  );

  const handleRemoveCsvEmail = useCallback(
    (email: string) => {
      setCsvEmails((prev) => prev.filter((e) => e !== email));
    },
    [],
  );

  const canSend = parsedEmails.length > 0 && invalidEmails.length === 0;

  const successCount = results.filter((r) => r.status === 'sent').length;
  const failCount = results.filter((r) => r.status === 'failed').length;
  const failedAddresses = results.filter((r) => r.status === 'failed').map((r) => r.email);

  // History metrics
  const submittedCount = priorInvitations.filter((i) => i.status === 'submitted').length;
  const pendingCount = priorInvitations.filter((i) => i.status === 'pending').length;
  const responseRate = priorInvitations.length > 0
    ? Math.round((submittedCount / priorInvitations.length) * 100)
    : 0;

  return (
    <div>
      {/* Page heading — editorial */}
      <h1 className="text-2xl font-light text-gray-900 tracking-tight mb-8">{t('inviteTitle')}</h1>

      {/* Send form */}
      {phase === 'form' && (
        <div className="mb-10">
          {/* Survey title */}
          <div className="space-y-1.5 mb-6">
            <Label className="text-[11px] uppercase tracking-widest text-gray-500">{t('inviteSurveyLabel')}</Label>
            <p className="text-lg font-medium text-gray-900">{survey.name}</p>
          </div>

          {/* Tabs: Manual / CSV */}
          <Tabs defaultValue="manual">
            <TabsList>
              <TabsTrigger value="manual">{t('tabManual')}</TabsTrigger>
              <TabsTrigger value="csv">{t('tabCsv')}</TabsTrigger>
            </TabsList>

            {/* Manual entry tab */}
            <TabsContent value="manual">
              <div className="space-y-4 pt-4">
                <div className="space-y-1.5">
                  <Label className="text-[11px] uppercase tracking-widest text-gray-500">{t('inviteEmailsLabel')}</Label>
                  <Textarea
                    value={emailsRaw}
                    onChange={(e) => setEmailsRaw(e.target.value)}
                    placeholder={t('inviteEmailsPlaceholder')}
                    rows={6}
                    className="font-mono text-sm max-w-2xl"
                  />
                  {emailsRaw.trim() ? (
                    <p className="text-xs text-gray-500">
                      {t('inviteEmailsCount', { count: parsedEmails.length })}
                    </p>
                  ) : (
                    <p className="text-xs text-gray-500">{t('inviteEmailsNone')}</p>
                  )}
                  {invalidEmails.length > 0 && (
                    <p className="text-xs text-red-600">
                      {t('inviteEmailsInvalid', { list: invalidEmails.join(', ') })}
                    </p>
                  )}
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={handleSubmit}
                    disabled={!canSend}
                    className="inline-flex items-center justify-center gap-2 rounded-md bg-gray-900 px-5 py-2.5 text-sm font-medium text-white hover:bg-gray-800 transition-colors disabled:opacity-40 disabled:pointer-events-none"
                  >
                    {t('inviteSendButton')}
                  </button>
                  <button
                    onClick={handleClear}
                    type="button"
                    className="inline-flex items-center justify-center rounded-md border border-gray-200 px-4 py-2.5 text-sm text-gray-600 hover:text-gray-900 hover:border-gray-300 transition-colors"
                  >
                    {t('inviteClearButton')}
                  </button>
                </div>
              </div>
            </TabsContent>

            {/* CSV upload tab */}
            <TabsContent value="csv">
              <div className="space-y-4 pt-4">
                <div className="space-y-1.5">
                  <Label className="text-[11px] uppercase tracking-widest text-gray-500">{t('csvUploadLabel')}</Label>
                  <p className="text-xs text-gray-500">{t('csvUploadHint')}</p>
                </div>

                {/* Dropzone */}
                <div
                  className={`relative flex flex-col items-center justify-center gap-3 rounded-lg border-2 border-dashed p-10 transition-colors cursor-pointer max-w-2xl ${
                    isDragOver
                      ? 'border-gray-900 bg-gray-50'
                      : 'border-gray-200 hover:border-gray-400'
                  }`}
                  onClick={() => fileInputRef.current?.click()}
                  onDragOver={(e) => {
                    e.preventDefault();
                    setIsDragOver(true);
                  }}
                  onDragLeave={() => setIsDragOver(false)}
                  onDrop={handleDrop}
                >
                  <Upload className="h-6 w-6 text-gray-400" />
                  <p className="text-sm text-gray-500">{t('csvDropzone')}</p>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".csv"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </div>

                {/* CSV file selected indicator */}
                {csvFileName && (
                  <div className="flex items-center gap-2 rounded-md bg-gray-50 border border-gray-100 px-3 py-2 text-sm max-w-2xl">
                    <FileText className="h-4 w-4 text-gray-500" />
                    <span className="flex-1 truncate text-gray-900">{csvFileName}</span>
                    <span className="text-xs text-gray-500">
                      {t('csvPreviewValid', { count: csvEmails.length })}
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCsvClear();
                      }}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                )}

                {/* CSV error */}
                {csvError && <p className="text-xs text-red-600">{csvError}</p>}

                {/* Actions */}
                <div className="flex gap-3 items-center">
                  {csvEmails.length > 0 && (
                    <button
                      onClick={() => setShowPreview(true)}
                      className="inline-flex items-center justify-center gap-2 rounded-md bg-gray-900 px-5 py-2.5 text-sm font-medium text-white hover:bg-gray-800 transition-colors"
                    >
                      {t('inviteSendButton')}
                    </button>
                  )}
                  <button
                    onClick={handleCsvClear}
                    type="button"
                    className="inline-flex items-center justify-center rounded-md border border-gray-200 px-4 py-2.5 text-sm text-gray-600 hover:text-gray-900 hover:border-gray-300 transition-colors"
                  >
                    {t('inviteClearButton')}
                  </button>
                  <button
                    onClick={downloadCsvTemplate}
                    className="ml-auto inline-flex items-center justify-center gap-1.5 rounded-md border border-gray-200 px-3 py-2.5 text-sm text-gray-600 hover:text-gray-900 hover:border-gray-300 transition-colors"
                  >
                    <Download className="h-3.5 w-3.5" />
                    {t('csvDownloadTemplate')}
                  </button>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      )}

      {/* CSV Preview Dialog */}
      <Dialog open={showPreview} onOpenChange={setShowPreview}>
        <DialogContent className="sm:max-w-lg max-h-[80vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>{t('csvPreviewTitle')}</DialogTitle>
            <DialogDescription>
              {t('csvPreviewDescription', {
                valid: csvEmails.length,
                invalid: csvInvalid.length,
              })}
            </DialogDescription>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto min-h-0 -mx-4 px-4">
            {csvInvalid.length > 0 && (
              <div className="mb-3 rounded-md bg-red-50 px-3 py-2">
                <p className="text-xs font-medium text-red-800 mb-1">
                  {t('csvPreviewInvalid', { count: csvInvalid.length })}
                </p>
                <p className="text-xs text-red-600 font-mono">{csvInvalid.join(', ')}</p>
              </div>
            )}

            <div className="space-y-1">
              {csvEmails.map((email) => (
                <div
                  key={email}
                  className="flex items-center justify-between rounded px-2 py-1.5 text-sm hover:bg-muted"
                >
                  <span className="font-mono text-xs">{email}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 px-2 text-xs text-muted-foreground hover:text-red-600"
                    onClick={() => handleRemoveCsvEmail(email)}
                  >
                    {t('csvRemoveEmail')}
                  </Button>
                </div>
              ))}
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPreview(false)}>
              {t('inviteClearButton')}
            </Button>
            <Button onClick={handleCsvConfirmSend} disabled={csvEmails.length === 0}>
              {t('csvConfirmSend')} ({csvEmails.length})
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Sending progress */}
      {phase === 'sending' && (
        <div className="mb-10 max-w-md space-y-4">
          <p className="text-sm text-gray-700">{t('inviteProgress', { sent, total })}</p>
          <Progress value={total > 0 ? (sent / total) * 100 : 0} />
        </div>
      )}

      {/* Done summary */}
      {phase === 'done' && (
        <div className="mb-10 max-w-lg space-y-4">
          <h2 className="text-lg font-light text-gray-900 tracking-tight">
            {t('inviteSuccessHeading', { total: successCount })}
          </h2>
          {failCount > 0 && (
            <div className="space-y-1">
              <p className="text-sm text-red-600">
                {t('invitePartialFailure', { failed: failCount, total: results.length })}
              </p>
              <p className="text-xs text-gray-500 font-mono">
                {t('inviteFailedAddresses', { list: failedAddresses.join(', ') })}
              </p>
            </div>
          )}
          <button
            onClick={handleSendAnother}
            className="inline-flex items-center justify-center gap-2 rounded-md bg-gray-900 px-5 py-2.5 text-sm font-medium text-white hover:bg-gray-800 transition-colors"
          >
            {t('inviteAnotherBatch')}
          </button>
        </div>
      )}

      {/* Divider */}
      <div className="divider-dot mb-10" />

      {/* Invitation History — hero metrics + table */}
      <div>
        <h2 className="text-[11px] font-medium text-gray-500 uppercase tracking-widest mb-6">{t('inviteHistoryHeading')}</h2>

        {/* Hero stats */}
        {priorInvitations.length > 0 && (
          <div className="flex flex-wrap gap-x-12 gap-y-4 mb-8">
            <div>
              <div className="text-3xl font-light tracking-tight tabular-nums text-gray-900">{priorInvitations.length}</div>
              <div className="text-[11px] uppercase tracking-widest text-gray-500 mt-1">Total Sent</div>
            </div>
            <div>
              <div className="text-3xl font-light tracking-tight tabular-nums text-gray-900">{submittedCount}</div>
              <div className="text-[11px] uppercase tracking-widest text-gray-500 mt-1">Submitted</div>
            </div>
            <div>
              <div className="text-3xl font-light tracking-tight tabular-nums text-gray-400">{pendingCount}</div>
              <div className="text-[11px] uppercase tracking-widest text-gray-500 mt-1">Pending</div>
            </div>
            <div>
              <div className="text-3xl font-light tracking-tight tabular-nums text-gray-900">{responseRate}%</div>
              <div className="text-[11px] uppercase tracking-widest text-gray-500 mt-1">Response Rate</div>
            </div>
          </div>
        )}

        {/* Table */}
        {priorInvitations.length === 0 ? (
          <p className="text-sm text-gray-500">{t('inviteHistoryEmpty')}</p>
        ) : (
          <div className="overflow-x-auto border border-gray-100 rounded-lg">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="px-4 py-3 text-left text-[11px] font-medium text-gray-500 uppercase tracking-wider">
                    {t('inviteHistoryEmail')}
                  </th>
                  <th className="px-4 py-3 text-left text-[11px] font-medium text-gray-500 uppercase tracking-wider">
                    {t('inviteHistoryStatus')}
                  </th>
                  <th className="px-4 py-3 text-left text-[11px] font-medium text-gray-500 uppercase tracking-wider">
                    {t('inviteHistorySentAt')}
                  </th>
                </tr>
              </thead>
              <tbody>
                {priorInvitations.map((inv, i) => (
                  <tr key={inv.token} className={`${i !== priorInvitations.length - 1 ? 'border-b border-gray-50' : ''} hover:bg-gray-50/50 transition-colors`}>
                    <td className="px-4 py-3 font-mono text-xs text-gray-900">{inv.email}</td>
                    <td className="px-4 py-3">
                      {inv.status === 'submitted' ? (
                        <Badge className="bg-green-50 text-green-700 border-0 text-[11px]">Submitted</Badge>
                      ) : (
                        <Badge variant="secondary" className="text-[11px]">Pending</Badge>
                      )}
                    </td>
                    <td className="px-4 py-3 text-gray-500 text-xs tabular-nums">
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
