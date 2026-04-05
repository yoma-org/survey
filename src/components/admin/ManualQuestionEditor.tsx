'use client';

import { useState, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useLocale } from 'next-intl';
import { Plus, Trash2, GripVertical, Save, Languages, Loader2, ImagePlus, Sparkles, Upload, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useAutoTranslate } from '@/hooks/use-auto-translate';
import type { Question, QuestionType, Dimension } from '@/lib/types';

interface ManualQuestionEditorProps {
  surveyId: string;
  initialQuestions?: Question[];
}

const TYPES: { value: QuestionType; label: string }[] = [
  { value: 'likert', label: 'Likert (1-5 scale)' },
  { value: 'open_ended', label: 'Open-ended text' },
  { value: 'demographic', label: 'Demographic select' },
];

const DIMENSIONS: { value: string; label: string }[] = [
  { value: '_none', label: 'None' },
  { value: 'camaraderie', label: 'Camaraderie' },
  { value: 'credibility', label: 'Credibility' },
  { value: 'fairness', label: 'Fairness' },
  { value: 'pride', label: 'Pride' },
  { value: 'respect', label: 'Respect' },
];

interface QuestionDraft {
  localId: string;
  id: string;
  type: QuestionType;
  en: string;
  my: string;
  dimension: Dimension | '';
  subPillar: string;
  options: string; // JSON string for demographic options
  imageUrl: string;
}

function createBlankQuestion(index: number): QuestionDraft {
  return {
    localId: crypto.randomUUID(),
    id: `Q-${String(index + 1).padStart(2, '0')}`,
    type: 'likert',
    en: '',
    my: '',
    dimension: '',
    subPillar: '',
    options: '',
    imageUrl: '',
  };
}

function QuestionCard({
  question: q,
  index,
  onUpdate,
  onRemove,
}: {
  question: QuestionDraft;
  index: number;
  onUpdate: (localId: string, field: keyof QuestionDraft, value: string) => void;
  onRemove: (localId: string) => void;
}) {
  const handleTranslated = useCallback(
    (text: string) => onUpdate(q.localId, 'my', text),
    [q.localId, onUpdate]
  );

  const { isTranslating, markTargetEdited, resetTargetEdited, activate, deactivate } = useAutoTranslate({
    sourceText: q.en,
    onTranslated: handleTranslated,
  });

  const [isUploading, setIsUploading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [imagePrompt, setImagePrompt] = useState('');
  const [showImagePrompt, setShowImagePrompt] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await fetch('/api/images/upload', { method: 'POST', body: formData });
      if (res.ok) {
        const { url } = await res.json();
        onUpdate(q.localId, 'imageUrl', url);
      }
    } catch { /* ignore */ } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const [imageError, setImageError] = useState('');

  const handleGenerate = async () => {
    const prompt = imagePrompt.trim() || q.en.trim();
    if (!prompt || isGenerating) return;
    setIsGenerating(true);
    setImageError('');
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 60000);
      const res = await fetch('/api/images/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt }),
        signal: controller.signal,
      });
      clearTimeout(timeout);
      if (res.ok) {
        const { url } = await res.json();
        onUpdate(q.localId, 'imageUrl', url);
        setShowImagePrompt(false);
        setImagePrompt('');
      } else {
        const data = await res.json().catch(() => ({ error: 'Generation failed' }));
        setImageError(data.error || 'Generation failed');
      }
    } catch (err) {
      setImageError(err instanceof DOMException && err.name === 'AbortError' ? 'Request timed out' : 'Generation failed');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="border border-border rounded-lg p-4 space-y-3 bg-white">
      <div className="flex items-center gap-2">
        <GripVertical className="w-4 h-4 text-muted-foreground/40 flex-shrink-0" />
        <span className="text-xs text-muted-foreground tabular-nums font-medium w-6">
          {index + 1}
        </span>

        {/* ID */}
        <Input
          value={q.id}
          onChange={e => onUpdate(q.localId, 'id', e.target.value)}
          placeholder="ID (e.g. Q-01)"
          className="w-24 h-8 text-xs"
        />

        {/* Type */}
        <Select value={q.type} onValueChange={v => { if (v) onUpdate(q.localId, 'type', v); }}>
          <SelectTrigger className="w-40 h-8 text-xs">
            <span className="truncate">{TYPES.find(t => t.value === q.type)?.label || q.type}</span>
          </SelectTrigger>
          <SelectContent>
            {TYPES.map(t => (
              <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Dimension */}
        {q.type === 'likert' && (
          <Select value={q.dimension || '_none'} onValueChange={v => { if (v) onUpdate(q.localId, 'dimension', v === '_none' ? '' : v); }}>
            <SelectTrigger className="w-36 h-8 text-xs">
              <span className="truncate">{DIMENSIONS.find(d => d.value === (q.dimension || '_none'))?.label || 'Dimension'}</span>
            </SelectTrigger>
            <SelectContent>
              {DIMENSIONS.map(d => (
                <SelectItem key={d.value} value={d.value}>{d.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        <div className="flex-1" />

        <button
          type="button"
          onClick={() => onRemove(q.localId)}
          className="p-1.5 rounded-md hover:bg-red-50 text-muted-foreground hover:text-red-500 transition-colors"
          aria-label="Remove question"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      {/* English text */}
      <div>
        <label className="text-[11px] text-muted-foreground uppercase tracking-wider mb-1 block">
          English
        </label>
        <Textarea
          value={q.en}
          onChange={e => onUpdate(q.localId, 'en', e.target.value)}
          onFocus={activate}
          onBlur={deactivate}
          placeholder="Question text in English..."
          rows={2}
          className="text-sm"
        />
      </div>

      {/* Burmese text — auto-translated */}
      <div className="relative">
        <div className="flex items-center gap-2 mb-1">
          <label className="text-[11px] text-muted-foreground uppercase tracking-wider">
            Burmese (optional — defaults to English)
          </label>
          <span
            className={`inline-flex items-center gap-1 text-[11px] transition-all duration-300 ${
              isTranslating
                ? 'text-blue-500 opacity-100 translate-y-0'
                : q.my && q.en
                  ? 'text-emerald-500 opacity-100 translate-y-0'
                  : 'opacity-0 translate-y-1'
            }`}
          >
            {isTranslating ? (
              <>
                <Loader2 className="w-3 h-3 animate-spin" />
                Translating...
              </>
            ) : q.my && q.en ? (
              <>
                <Languages className="w-3 h-3" />
                Auto-translated
              </>
            ) : null}
          </span>
        </div>
        <div className="relative">
          <Textarea
            value={q.my}
            onChange={e => {
              onUpdate(q.localId, 'my', e.target.value);
              if (e.target.value.trim()) {
                markTargetEdited();
              } else {
                resetTargetEdited();
              }
            }}
            placeholder="မြန်မာဘာသာ... (auto-translates from English)"
            rows={2}
            className={`text-sm font-myanmar transition-all duration-500 ${
              isTranslating ? 'border-blue-200 bg-blue-50/30' : ''
            }`}
          />
          {isTranslating && (
            <div className="absolute inset-0 rounded-md overflow-hidden pointer-events-none">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-blue-100/40 to-transparent animate-shimmer" />
            </div>
          )}
        </div>
      </div>

      {/* Image section */}
      <div>
        <label className="text-[11px] text-muted-foreground uppercase tracking-wider mb-2 block">
          Image (optional)
        </label>

        {q.imageUrl ? (
          <div className="relative inline-block">
            <img
              src={q.imageUrl}
              alt="Question image"
              className="max-h-40 rounded-lg border border-border object-contain"
            />
            <button
              type="button"
              onClick={() => onUpdate(q.localId, 'imageUrl', '')}
              className="absolute -top-2 -right-2 p-1 rounded-full bg-white border border-border shadow-sm text-muted-foreground hover:text-red-500 transition-colors"
              aria-label="Remove image"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            <div className="flex gap-2">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className="text-xs"
              >
                {isUploading ? (
                  <><Loader2 className="w-3.5 h-3.5 mr-1 animate-spin" /> Uploading...</>
                ) : (
                  <><Upload className="w-3.5 h-3.5 mr-1" /> Upload</>
                )}
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setShowImagePrompt(!showImagePrompt)}
                className="text-xs"
              >
                <Sparkles className="w-3.5 h-3.5 mr-1" /> Generate with AI
              </Button>
            </div>

            {showImagePrompt && (
              <div className="space-y-2">
                <div className="flex gap-2">
                  <Input
                    value={imagePrompt}
                    onChange={e => { setImagePrompt(e.target.value); setImageError(''); }}
                    placeholder={q.en.trim() ? `Describe the image... (leave empty to use question text)` : 'Describe the image to generate...'}
                    className="h-8 text-xs flex-1"
                    onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleGenerate(); } }}
                  />
                  <Button
                    type="button"
                    size="sm"
                    onClick={handleGenerate}
                    disabled={isGenerating || (!imagePrompt.trim() && !q.en.trim())}
                    className="text-xs"
                  >
                    {isGenerating ? (
                      <><Loader2 className="w-3.5 h-3.5 mr-1 animate-spin" /> Generating...</>
                    ) : (
                      <><Sparkles className="w-3.5 h-3.5 mr-1" /> Generate</>
                    )}
                  </Button>
                </div>
                {imageError && (
                  <p className="text-xs text-red-500">{imageError}</p>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Sub-pillar for likert */}
      {q.type === 'likert' && q.dimension && (
        <Input
          value={q.subPillar}
          onChange={e => onUpdate(q.localId, 'subPillar', e.target.value)}
          placeholder="Sub-pillar (e.g. Community, Integrity)"
          className="h-8 text-xs"
        />
      )}

      {/* Options for demographic */}
      {q.type === 'demographic' && (
        <div>
          <label className="text-[11px] text-muted-foreground uppercase tracking-wider mb-1 block">
            Options (JSON array)
          </label>
          <Textarea
            value={q.options}
            onChange={e => onUpdate(q.localId, 'options', e.target.value)}
            placeholder='[{"en": "Option 1", "my": "ရွေးချယ်စရာ ၁"}, {"en": "Option 2", "my": "ရွေးချယ်စရာ ၂"}]'
            rows={2}
            className="text-xs font-mono"
          />
        </div>
      )}
    </div>
  );
}

export function ManualQuestionEditor({ surveyId, initialQuestions }: ManualQuestionEditorProps) {
  const router = useRouter();
  const locale = useLocale();

  const [questions, setQuestions] = useState<QuestionDraft[]>(() => {
    if (initialQuestions && initialQuestions.length > 0) {
      return initialQuestions.map((q) => ({
        localId: crypto.randomUUID(),
        id: q.id,
        type: q.type,
        en: q.en,
        my: q.my,
        dimension: q.dimension || '',
        subPillar: q.subPillar || '',
        options: q.options ? JSON.stringify(q.options) : '',
        imageUrl: q.imageUrl || '',
      }));
    }
    return [createBlankQuestion(0)];
  });

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function addQuestion() {
    setQuestions(prev => [...prev, createBlankQuestion(prev.length)]);
  }

  function removeQuestion(localId: string) {
    setQuestions(prev => prev.filter(q => q.localId !== localId));
  }

  function updateQuestion(localId: string, field: keyof QuestionDraft, value: string) {
    setQuestions(prev => prev.map(q =>
      q.localId === localId ? { ...q, [field]: value } : q
    ));
  }

  async function handleSave() {
    // Validate — at least one question with English text
    const valid = questions.filter(q => q.en.trim() !== '');
    if (valid.length === 0) {
      setError('Add at least one question with English text.');
      return;
    }

    setSaving(true);
    setError(null);

    const payload: Question[] = valid.map(q => ({
      id: q.id,
      type: q.type,
      en: q.en.trim(),
      my: q.my.trim() || q.en.trim(),
      dimension: (q.dimension || undefined) as Question['dimension'],
      subPillar: q.subPillar || undefined,
      options: q.options ? (() => {
        try { return JSON.parse(q.options); } catch { return undefined; }
      })() : undefined,
      imageUrl: q.imageUrl || undefined,
    }));

    try {
      const res = await fetch(`/api/surveys/${surveyId}/questions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ questions: payload }),
      });

      if (res.ok) {
        router.push(`/${locale}/admin/surveys/${surveyId}`);
      } else {
        const data = await res.json().catch(() => ({ error: 'Save failed' }));
        setError(data.error || 'Save failed');
      }
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {questions.length} question{questions.length !== 1 ? 's' : ''}
        </p>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={addQuestion}>
            <Plus className="w-4 h-4 mr-1" /> Add Question
          </Button>
          <Button size="sm" onClick={handleSave} disabled={saving}>
            <Save className="w-4 h-4 mr-1" />
            {saving ? 'Saving...' : 'Save Questions'}
          </Button>
        </div>
      </div>

      {error && (
        <div className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</div>
      )}

      <div className="space-y-3">
        {questions.map((q, index) => (
          <QuestionCard
            key={q.localId}
            question={q}
            index={index}
            onUpdate={updateQuestion}
            onRemove={removeQuestion}
          />
        ))}
      </div>

      <div className="flex gap-2 pt-4">
        <Button variant="outline" onClick={addQuestion} className="w-full">
          <Plus className="w-4 h-4 mr-1" /> Add Another Question
        </Button>
      </div>
    </div>
  );
}
