'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';
import Link from 'next/link';
import { Eye, Send, Pencil, Check, X, Trash2, Play, Pause, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { ManualQuestionEditor } from '@/components/admin/ManualQuestionEditor';
import type { Survey, Question } from '@/lib/types';

interface SurveyDetailClientProps {
  survey: Survey;
  questions: Question[];
  responseCount: number;
  previewToken: string;
}

function StatusBadge({ status }: { status: Survey['status'] }) {
  if (status === 'active') return <Badge className="bg-green-50 text-green-700 border-0">Active</Badge>;
  if (status === 'closed') return <Badge variant="outline">Closed</Badge>;
  return <Badge variant="secondary">Draft</Badge>;
}

function TypeBadge({ type }: { type: Question['type'] }) {
  if (type === 'likert') return <Badge className="bg-blue-50 text-blue-700 border-0 text-[11px]">Likert</Badge>;
  if (type === 'open_ended') return <Badge variant="secondary" className="text-[11px]">Open-ended</Badge>;
  return <Badge variant="outline" className="text-[11px]">Demographic</Badge>;
}

export function SurveyDetailClient({ survey: initialSurvey, questions: initialQuestions, responseCount, previewToken }: SurveyDetailClientProps) {
  const t = useTranslations('surveys');
  const router = useRouter();
  const locale = useLocale();

  const [survey, setSurvey] = useState(initialSurvey);
  const [editingHeader, setEditingHeader] = useState(false);
  const [editingQuestions, setEditingQuestions] = useState(false);
  const [editName, setEditName] = useState(survey.name);
  const [editDesc, setEditDesc] = useState(survey.description || '');
  const [saving, setSaving] = useState(false);
  const [showStatusMenu, setShowStatusMenu] = useState(false);
  const [deleting, setDeleting] = useState(false);

  async function saveHeader() {
    setSaving(true);
    try {
      const res = await fetch(`/api/surveys/${survey.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: editName, description: editDesc }),
      });
      if (res.ok) {
        const { survey: updated } = await res.json();
        setSurvey(updated);
        setEditingHeader(false);
      }
    } finally {
      setSaving(false);
    }
  }

  async function updateStatus(status: 'draft' | 'active' | 'closed') {
    const res = await fetch(`/api/surveys/${survey.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    if (res.ok) {
      const { survey: updated } = await res.json();
      setSurvey(updated);
    }
    setShowStatusMenu(false);
  }

  async function handleDelete() {
    if (!confirm('Delete this survey and all its questions, tokens, and responses? This cannot be undone.')) return;
    setDeleting(true);
    await fetch(`/api/surveys/${survey.id}`, { method: 'DELETE' });
    router.push(`/${locale}/admin/surveys`);
  }

  if (editingQuestions) {
    return (
      <div className="p-6 max-w-3xl">
        <button
          type="button"
          onClick={() => setEditingQuestions(false)}
          className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4"
        >
          ← Back to survey
        </button>
        <h2 className="text-base font-medium text-foreground mb-4">Edit Questions</h2>
        <ManualQuestionEditor surveyId={survey.id} initialQuestions={initialQuestions} />
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Back */}
      <Link
        href="../surveys"
        className="text-sm text-muted-foreground hover:text-foreground mb-4 inline-flex items-center gap-1"
      >
        ← {t('backToSurveys')}
      </Link>

      {/* Header — editable */}
      <div className="mt-4 mb-6">
        {editingHeader ? (
          <div className="space-y-3 max-w-lg">
            <Input
              value={editName}
              onChange={e => setEditName(e.target.value)}
              className="text-lg font-medium"
              autoFocus
            />
            <Textarea
              value={editDesc}
              onChange={e => setEditDesc(e.target.value)}
              placeholder="Description (optional)"
              rows={2}
              className="text-sm"
            />
            <div className="flex gap-2">
              <Button size="sm" onClick={saveHeader} disabled={saving || !editName.trim()}>
                <Check className="w-3.5 h-3.5 mr-1" />
                {saving ? 'Saving...' : 'Save'}
              </Button>
              <Button size="sm" variant="outline" onClick={() => {
                setEditingHeader(false);
                setEditName(survey.name);
                setEditDesc(survey.description || '');
              }}>
                <X className="w-3.5 h-3.5 mr-1" /> Cancel
              </Button>
            </div>
          </div>
        ) : (
          <>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-lg font-medium text-foreground">{survey.name}</h1>

              {/* Status badge with dropdown */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowStatusMenu(!showStatusMenu)}
                  className="flex items-center gap-1"
                >
                  <StatusBadge status={survey.status} />
                  <ChevronDown className="w-3 h-3 text-muted-foreground" />
                </button>
                {showStatusMenu && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setShowStatusMenu(false)} />
                    <div className="absolute top-full left-0 mt-1 z-50 bg-white border border-border rounded-lg shadow-lg py-1 min-w-[140px]">
                      <button onClick={() => updateStatus('draft')} className="w-full text-left px-3 py-1.5 text-sm hover:bg-muted flex items-center gap-2">
                        <Pencil className="w-3.5 h-3.5" /> Draft
                      </button>
                      <button onClick={() => updateStatus('active')} className="w-full text-left px-3 py-1.5 text-sm hover:bg-muted flex items-center gap-2">
                        <Play className="w-3.5 h-3.5" /> Active
                      </button>
                      <button onClick={() => updateStatus('closed')} className="w-full text-left px-3 py-1.5 text-sm hover:bg-muted flex items-center gap-2">
                        <Pause className="w-3.5 h-3.5" /> Closed
                      </button>
                    </div>
                  </>
                )}
              </div>

              {/* Edit name button */}
              <button
                type="button"
                onClick={() => setEditingHeader(true)}
                className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                aria-label="Edit survey name"
              >
                <Pencil className="w-3.5 h-3.5" />
              </button>
            </div>

            {survey.description && (
              <p className="text-sm text-muted-foreground">{survey.description}</p>
            )}
            <div className="flex gap-4 mt-2 text-xs text-muted-foreground">
              <span>{t('questionCount', { count: initialQuestions.length })}</span>
              <span>{t('responseCount', { count: responseCount })}</span>
              <span>{new Date(survey.createdAt).toLocaleDateString()}</span>
            </div>
          </>
        )}
      </div>

      {/* Actions */}
      <div className="flex flex-wrap gap-2 mb-8">
        <Link
          href={`/${locale}/survey/${previewToken}`}
          target="_blank"
          className="inline-flex items-center justify-center gap-2 rounded-md border border-border px-3 py-2 text-sm font-medium text-foreground hover:bg-muted min-h-[40px]"
        >
          <Eye className="w-4 h-4" /> {t('previewSurvey')}
        </Link>
        <Link
          href={`../surveys/${survey.id}/invite`}
          className="inline-flex items-center justify-center gap-2 rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 min-h-[40px]"
        >
          <Send className="w-4 h-4" /> {t('sendInvitations')}
        </Link>
        <button
          type="button"
          onClick={() => setEditingQuestions(true)}
          className="inline-flex items-center justify-center gap-2 rounded-md border border-border px-3 py-2 text-sm font-medium text-foreground hover:bg-muted min-h-[40px]"
        >
          <Pencil className="w-4 h-4" /> Edit Questions
        </button>
        <button
          type="button"
          onClick={handleDelete}
          disabled={deleting}
          className="inline-flex items-center justify-center gap-2 rounded-md border border-red-200 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 min-h-[40px]"
        >
          <Trash2 className="w-4 h-4" /> {deleting ? 'Deleting...' : 'Delete'}
        </button>
      </div>

      {/* Questions table */}
      {initialQuestions.length > 0 ? (
        <div className="overflow-x-auto border border-border rounded-lg">
          <table className="w-full text-sm">
            <thead className="bg-muted/30 border-b border-border">
              <tr>
                <th scope="col" className="px-3 py-2 text-left font-medium text-muted-foreground text-xs">{t('questionId')}</th>
                <th scope="col" className="px-3 py-2 text-left font-medium text-muted-foreground text-xs">{t('questionEnglish')}</th>
                <th scope="col" className="px-3 py-2 text-left font-medium text-muted-foreground text-xs">{t('questionBurmese')}</th>
                <th scope="col" className="px-3 py-2 text-left font-medium text-muted-foreground text-xs">{t('questionType')}</th>
                <th scope="col" className="px-3 py-2 text-left font-medium text-muted-foreground text-xs">{t('questionSection')}</th>
              </tr>
            </thead>
            <tbody>
              {initialQuestions.map((q) => (
                <tr key={q.id} className="border-b border-border last:border-0 hover:bg-muted/20">
                  <td className="px-3 py-2 font-mono text-xs text-muted-foreground">{q.id}</td>
                  <td className="px-3 py-2 max-w-[240px] text-foreground">{q.en}</td>
                  <td className="px-3 py-2 max-w-[240px] text-foreground font-myanmar">{q.my}</td>
                  <td className="px-3 py-2"><TypeBadge type={q.type} /></td>
                  <td className="px-3 py-2 text-muted-foreground text-xs">{q.dimension ?? ''}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="py-10 text-center">
          <p className="text-sm text-muted-foreground mb-3">No questions added yet.</p>
          <Button variant="outline" size="sm" onClick={() => setEditingQuestions(true)}>
            <Pencil className="w-4 h-4 mr-1" /> Add Questions
          </Button>
        </div>
      )}
    </div>
  );
}
