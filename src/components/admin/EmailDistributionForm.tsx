'use client';

import { useState, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Upload, FileText, X, Download } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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

function parseCsvEmails(csvText: string): { valid: string[]; invalid: string[] } {
  const lines = csvText.split(/\r?\n/);
  if (lines.length === 0) return { valid: [], invalid: [] };

  // Find the email column index from header row
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

export function EmailDistributionForm({ survey, surveys, priorInvitations }: Props) {
  const t = useTranslations('email');
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [selectedSurveyId, setSelectedSurveyId] = useState<string>(survey.id);
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
      if (!selectedSurveyId || emails.length === 0) return;

      setPhase('sending');
      setTotal(emails.length);
      setSent(0);

      try {
        const response = await fetch(`/api/surveys/${selectedSurveyId}/invite`, {
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
    [selectedSurveyId, router],
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
              <Select
                value={selectedSurveyId}
                onValueChange={(v) => {
                  if (v) setSelectedSurveyId(v);
                }}
              >
                <SelectTrigger className="w-full">
                  <span className="truncate">
                    {surveys.find((s) => s.id === selectedSurveyId)?.name ||
                      t('inviteSurveyPlaceholder')}
                  </span>
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

            {/* Tabs: Manual / CSV */}
            <Tabs defaultValue="manual">
              <TabsList>
                <TabsTrigger value="manual">{t('tabManual')}</TabsTrigger>
                <TabsTrigger value="csv">{t('tabCsv')}</TabsTrigger>
              </TabsList>

              {/* Manual entry tab */}
              <TabsContent value="manual">
                <div className="space-y-3 pt-3">
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

                  <div className="flex gap-3">
                    <Button onClick={handleSubmit} disabled={!canSend}>
                      {t('inviteSendButton')}
                    </Button>
                    <Button variant="ghost" onClick={handleClear} type="button">
                      {t('inviteClearButton')}
                    </Button>
                  </div>
                </div>
              </TabsContent>

              {/* CSV upload tab */}
              <TabsContent value="csv">
                <div className="space-y-3 pt-3">
                  <div className="space-y-1.5">
                    <Label>{t('csvUploadLabel')}</Label>
                    <p className="text-xs text-muted-foreground">{t('csvUploadHint')}</p>
                  </div>

                  {/* Dropzone */}
                  <div
                    className={`relative flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed p-8 transition-colors cursor-pointer ${
                      isDragOver
                        ? 'border-primary bg-primary/5'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                    onClick={() => fileInputRef.current?.click()}
                    onDragOver={(e) => {
                      e.preventDefault();
                      setIsDragOver(true);
                    }}
                    onDragLeave={() => setIsDragOver(false)}
                    onDrop={handleDrop}
                  >
                    <Upload className="h-8 w-8 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">{t('csvDropzone')}</p>
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
                    <div className="flex items-center gap-2 rounded-md bg-muted px-3 py-2 text-sm">
                      <FileText className="h-4 w-4 text-muted-foreground" />
                      <span className="flex-1 truncate">{csvFileName}</span>
                      <span className="text-xs text-muted-foreground">
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
                  <div className="flex gap-3">
                    {csvEmails.length > 0 && (
                      <Button onClick={() => setShowPreview(true)}>
                        {t('inviteSendButton')}
                      </Button>
                    )}
                    <Button variant="ghost" onClick={handleCsvClear} type="button">
                      {t('inviteClearButton')}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={downloadCsvTemplate}
                      className="ml-auto"
                    >
                      <Download className="h-3.5 w-3.5 mr-1.5" />
                      {t('csvDownloadTemplate')}
                    </Button>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
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
        <Card>
          <CardContent className="pt-6 space-y-4">
            <p className="text-sm text-gray-700">{t('inviteProgress', { sent, total })}</p>
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
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold text-gray-900">{t('inviteHistoryHeading')}</h2>
          {priorInvitations.length > 0 && (
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <span>
                Total: <strong className="text-foreground">{priorInvitations.length}</strong>
              </span>
              <span>
                Submitted:{' '}
                <strong className="text-green-600">
                  {priorInvitations.filter((i) => i.status === 'submitted').length}
                </strong>
              </span>
              <span>
                Pending:{' '}
                <strong className="text-amber-600">
                  {priorInvitations.filter((i) => i.status === 'pending').length}
                </strong>
              </span>
              <span>
                Rate:{' '}
                <strong className="text-foreground">
                  {priorInvitations.length > 0
                    ? Math.round(
                        (priorInvitations.filter((i) => i.status === 'submitted').length /
                          priorInvitations.length) *
                          100,
                      )
                    : 0}
                  %
                </strong>
              </span>
            </div>
          )}
        </div>

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
