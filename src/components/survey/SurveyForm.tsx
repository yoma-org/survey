'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import {
  Users,
  ShieldCheck,
  Scale,
  Trophy,
  Heart,
  HelpCircle,
  MessageSquare,
  User,
} from 'lucide-react';
import type { Survey, Question, Token } from '@/lib/types';
import { validateAnswers } from '@/lib/validation/survey-validation';
import { SectionCard } from '@/components/survey/SectionCard';
import { LikertInput } from '@/components/survey/LikertInput';
import { TableOfContents } from '@/components/survey/TableOfContents';
import { MobileProgressBar } from '@/components/survey/MobileProgressBar';
import { ConfirmationDialog } from '@/components/survey/ConfirmationDialog';
import { ThankYouScreen } from '@/components/survey/ThankYouScreen';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

interface SurveyTranslations {
  respondingAs: string;
  submitButton: string;
  optionalHelper: string;
  characterCount: string;
  demographicAnonymityNote: string;
  nameLabel: string;
  departmentLabel: string;
  optionalTag: string;
  namePlaceholder: string;
  departmentPlaceholder: string;
  selectPlaceholder: string;
  required: string;
  questionsNeedAnswer: string;
  validationErrorCount: string;
}

interface SurveyFormProps {
  survey: Survey;
  questions: Question[];
  tokenRow: Token;
  locale: 'en' | 'my';
  translations: Record<'en' | 'my', SurveyTranslations>;
}

const SECTION_ORDER: Array<'camaraderie' | 'credibility' | 'fairness' | 'pride' | 'respect' | 'uncategorized' | 'open_ended' | 'demographic'> = [
  'camaraderie',
  'credibility',
  'fairness',
  'pride',
  'respect',
  'uncategorized',
  'open_ended',
  'demographic',
];

const SECTION_I18N_KEYS: Record<string, string> = {
  camaraderie: 'sectionCamaraderie',
  credibility: 'sectionCredibility',
  fairness: 'sectionFairness',
  pride: 'sectionPride',
  respect: 'sectionRespect',
  uncategorized: 'sectionOther',
  open_ended: 'sectionOpenEnded',
  demographic: 'sectionDemographics',
};

const SECTION_ICONS: Record<string, React.ReactNode> = {
  camaraderie: <Users className="w-5 h-5" />,
  credibility: <ShieldCheck className="w-5 h-5" />,
  fairness: <Scale className="w-5 h-5" />,
  pride: <Trophy className="w-5 h-5" />,
  respect: <Heart className="w-5 h-5" />,
  uncategorized: <HelpCircle className="w-5 h-5" />,
  open_ended: <MessageSquare className="w-5 h-5" />,
  demographic: <User className="w-5 h-5" />,
};

export function SurveyForm({ survey, questions, tokenRow, locale, translations }: SurveyFormProps) {
  const tl = useTranslations('survey');
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [errors, setErrors] = useState<Set<string>>(new Set());
  const [hasSubmitAttempted, setHasSubmitAttempted] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [displayLocale, setDisplayLocale] = useState<'en' | 'my'>(locale);
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const [charCounts, setCharCounts] = useState<Record<string, number>>({});

  if (submitted) {
    return <ThankYouScreen />;
  }

  // Helper to get text in current display locale
  const q = (question: Question) =>
    displayLocale === 'en' ? question.en : question.my;

  // Get translation for current display locale
  const t = translations[displayLocale];

  const handleAnswer = (questionId: string, value: string) => {
    setAnswers(prev => ({ ...prev, [questionId]: value }));
    if (hasSubmitAttempted) {
      setErrors(prev => {
        const next = new Set(prev);
        next.delete(questionId);
        return next;
      });
    }
  };

  const handleSubmitClick = () => {
    const errorIds = validateAnswers(questions, answers);
    if (errorIds.length === 0) {
      setShowConfirmDialog(true);
    } else {
      setErrors(new Set(errorIds));
      setHasSubmitAttempted(true);
      // Scroll to first error
      const firstError = errorIds[0];
      if (firstError) {
        const el = document.getElementById(`q-${firstError}`);
        el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  };

  const handleConfirmSubmit = async () => {
    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/surveys/${survey.id}/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: tokenRow.token, answers }),
      });

      if (res.ok) {
        setSubmitted(true);
        setShowConfirmDialog(false);
      } else {
        const data = await res.json().catch(() => ({ error: 'Submission failed' }));
        alert(data.error ?? 'Submission failed. Please try again.');
        setIsSubmitting(false);
      }
    } catch {
      alert('Network error. Please check your connection and try again.');
      setIsSubmitting(false);
    }
  };

  // Group questions by section
  const groupedSections = SECTION_ORDER.map(sectionKey => {
    let sectionQuestions: Question[];
    if (sectionKey === 'open_ended') {
      sectionQuestions = questions.filter(q => q.type === 'open_ended');
    } else if (sectionKey === 'demographic') {
      sectionQuestions = questions.filter(q => q.type === 'demographic');
    } else {
      sectionQuestions = questions.filter(
        q => q.type === 'likert' && q.dimension === sectionKey
      );
    }
    return { sectionKey, questions: sectionQuestions };
  }).filter(s => s.questions.length > 0);

  // Compute answered counts per section
  const getSectionAnsweredCount = (sectionKey: string, sqs: Question[]) => {
    if (sectionKey === 'open_ended') return 0; // open_ended not required
    return sqs.filter(sq => answers[sq.id] && answers[sq.id].trim() !== '').length;
  };

  // Compute total progress
  const requiredQuestions = questions.filter(q => q.type !== 'open_ended');
  const answeredRequired = requiredQuestions.filter(
    q => answers[q.id] && answers[q.id].trim() !== ''
  ).length;
  const totalProgress =
    requiredQuestions.length > 0
      ? Math.round((answeredRequired / requiredQuestions.length) * 100)
      : 0;

  // Sections data for TOC and mobile bar
  const tocSections = groupedSections.map(({ sectionKey, questions: sqs }) => ({
    id: sectionKey,
    title: SECTION_I18N_KEYS[sectionKey] ? tl(SECTION_I18N_KEYS[sectionKey]) : sectionKey,
    answeredCount: getSectionAnsweredCount(sectionKey, sqs),
    totalCount: sectionKey === 'open_ended' ? 0 : sqs.length,
  }));

  return (
    <div>
      {/* Mobile progress bar — sticky, visible on mobile only */}
      <MobileProgressBar
        sections={tocSections}
        totalProgress={totalProgress}
        activeSection={activeSection}
        progressLabel={tl('progressTitle')}
      />

      <div className="max-w-screen-xl mx-auto px-4 py-8">
        <div className="flex flex-row gap-10">
          {/* Desktop TOC sidebar */}
          <div className="hidden lg:block w-56 flex-shrink-0">
            <TableOfContents
              sections={tocSections}
              totalProgress={totalProgress}
              progressLabel={tl('progressTitle')}
            />
          </div>

          {/* Form content */}
          <div className="flex-1 max-w-2xl">
            {/* Form header */}
            <div className="mb-10">
              <div className="flex items-start justify-between gap-4 mb-4">
                <div>
                  <h1 className="text-xl font-medium text-foreground">{survey.name}</h1>
                  {survey.description && (
                    <p className="text-sm text-muted-foreground mt-1">{survey.description}</p>
                  )}
                </div>
              </div>

              {/* Email — subtle inline, not a form field */}
              <div className="flex items-center gap-2 text-xs text-muted-foreground/60">
                <span>{t.respondingAs}</span>
                <span className="text-foreground/50">{tokenRow.email}</span>
              </div>
              <div className="divider-dot mt-6" />
            </div>

            {/* Sections */}
            {groupedSections.map(({ sectionKey, questions: sqs }) => (
              <SectionCard
                key={sectionKey}
                sectionId={sectionKey}
                title={SECTION_I18N_KEYS[sectionKey] ? tl(SECTION_I18N_KEYS[sectionKey]) : sectionKey}
                icon={SECTION_ICONS[sectionKey]}
                answeredCount={getSectionAnsweredCount(sectionKey, sqs)}
                totalCount={sectionKey === 'open_ended' ? 0 : sqs.length}
              >
                {/* Optional name + department for demographics section (FORM-12) */}
                {sectionKey === 'demographic' && (
                  <div className="py-4 space-y-5">
                    <p className="text-xs text-muted-foreground/60">
                      {t.demographicAnonymityNote}
                    </p>
                    <div>
                      <label className="text-[13px] text-muted-foreground block mb-1.5">
                        {t.nameLabel} <span className="text-muted-foreground/40">({t.optionalTag})</span>
                      </label>
                      <input
                        type="text"
                        value={answers['__name__'] ?? ''}
                        onChange={e => handleAnswer('__name__', e.target.value)}
                        className="block w-full rounded-lg border border-border bg-transparent px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:ring-1 focus:ring-foreground/20"
                        placeholder={t.namePlaceholder}
                      />
                    </div>
                    <div>
                      <label className="text-[13px] text-muted-foreground block mb-1.5">
                        {t.departmentLabel} <span className="text-muted-foreground/40">({t.optionalTag})</span>
                      </label>
                      <input
                        type="text"
                        value={answers['__department__'] ?? ''}
                        onChange={e => handleAnswer('__department__', e.target.value)}
                        className="block w-full rounded-lg border border-border bg-transparent px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:ring-1 focus:ring-foreground/20"
                        placeholder={t.departmentPlaceholder}
                      />
                    </div>
                  </div>
                )}

                {/* Render questions by type */}
                {sqs.map((question, index) => {
                  if (question.type === 'likert') {
                    return (
                      <LikertInput
                        key={question.id}
                        questionId={question.id}
                        questionText={q(question)}
                        questionNumber={index + 1}
                        value={answers[question.id] ?? ''}
                        onChange={value => handleAnswer(question.id, value)}
                        error={errors.has(question.id)}
                        displayLocale={displayLocale}
                      />
                    );
                  }

                  if (question.type === 'open_ended') {
                    return (
                      <div key={question.id} className="py-5">
                        <p
                          className="text-[15px] text-foreground leading-relaxed mb-2"
                          style={displayLocale === 'my' ? { lineHeight: '1.75' } : undefined}
                        >
                          <span className="text-xs text-muted-foreground/60 tabular-nums mr-2 font-medium">{index + 1}.</span>
                          {q(question)}
                        </p>
                        <p className="text-xs text-muted-foreground/50 mb-2">
                          {t.optionalHelper}
                        </p>
                        <Textarea
                          rows={4}
                          value={answers[question.id] ?? ''}
                          onChange={e => {
                            handleAnswer(question.id, e.target.value);
                            setCharCounts(prev => ({
                              ...prev,
                              [question.id]: e.target.value.length,
                            }));
                          }}
                          className="w-full resize-none"
                          style={{ maxHeight: '400px', overflowY: 'auto' }}
                          placeholder=""
                        />
                        <p className="text-xs text-gray-400 mt-1">
                          {t.characterCount.replace('{count}', String(charCounts[question.id] ?? 0))}
                        </p>
                      </div>
                    );
                  }

                  if (question.type === 'demographic') {
                    // RadioGroup for radio-type demographics (RoleType), Select for others
                    const isRadio = !question.options || question.id.toLowerCase().includes('role');
                    if (isRadio && question.options) {
                      return (
                        <div key={question.id} className="space-y-2">
                          <label
                            className="text-sm font-medium text-gray-700 block"
                            style={displayLocale === 'my' ? { lineHeight: '1.75' } : undefined}
                          >
                            {q(question)}
                            {errors.has(question.id) && (
                              <span className="ml-2 text-xs text-red-500">{t.required}</span>
                            )}
                          </label>
                          <RadioGroup
                            value={answers[question.id] ?? ''}
                            onValueChange={value => handleAnswer(question.id, value)}
                            className="flex flex-col gap-2"
                          >
                            {question.options.map(opt => {
                              const optLabel = displayLocale === 'my' ? opt.my : opt.en;
                              const isSelected = answers[question.id] === (displayLocale === 'my' ? opt.my : opt.en);
                              return (
                                <label
                                  key={opt.en}
                                  className={`flex items-center gap-3 cursor-pointer rounded-lg border px-4 min-h-[48px] transition-all duration-150 ${
                                    isSelected
                                      ? 'bg-foreground text-background border-foreground font-medium'
                                      : 'bg-transparent border-border text-foreground hover:bg-muted/30'
                                  }`}
                                >
                                  <RadioGroupItem value={optLabel} aria-label={optLabel} className="sr-only" />
                                  <span className={`w-4 h-4 rounded-full border-2 flex-shrink-0 flex items-center justify-center ${isSelected ? 'border-background' : 'border-muted-foreground/40'}`}>
                                    {isSelected && <span className="w-2 h-2 rounded-full bg-background" />}
                                  </span>
                                  <span className="text-sm">{optLabel}</span>
                                </label>
                              );
                            })}
                          </RadioGroup>
                        </div>
                      );
                    }

                    // Select dropdown for Organization and Service Year
                    return (
                      <div key={question.id} className="py-4 space-y-1.5">
                        <label
                          className="text-[13px] text-muted-foreground block"
                          style={displayLocale === 'my' ? { lineHeight: '1.75' } : undefined}
                        >
                          {q(question)}
                          {errors.has(question.id) && (
                            <span className="ml-2 text-xs text-red-500">{t.required}</span>
                          )}
                        </label>
                        <Select
                          value={answers[question.id] ?? ''}
                          onValueChange={value => { if (value) handleAnswer(question.id, value); }}
                        >
                          <SelectTrigger className="w-full">
                            <span className="truncate">{answers[question.id] || t.selectPlaceholder}</span>
                          </SelectTrigger>
                          <SelectContent>
                            {question.options?.map(opt => {
                              const optLabel = displayLocale === 'my' ? opt.my : opt.en;
                              return (
                                <SelectItem key={opt.en} value={optLabel}>
                                  {optLabel}
                                </SelectItem>
                              );
                            })}
                          </SelectContent>
                        </Select>
                      </div>
                    );
                  }

                  return null;
                })}
              </SectionCard>
            ))}

            {/* Validation error banner */}
            {hasSubmitAttempted && errors.size > 0 && (
              <div className="mb-6 flex items-center gap-2 text-sm text-red-600 bg-red-50 rounded-lg px-4 py-3 border border-red-100">
                <span className="font-medium tabular-nums">{errors.size}</span>
                <span>{t.questionsNeedAnswer}</span>
              </div>
            )}

            {/* Submit area */}
            <div className="divider-dot mb-8" />
            <div className="pb-20">
              <button
                type="button"
                onClick={handleSubmitClick}
                className="px-8 py-3 bg-foreground text-background font-medium rounded-lg hover:bg-foreground/90 transition-colors text-sm min-h-[48px]"
              >
                {t.submitButton}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation dialog */}
      <ConfirmationDialog
        open={showConfirmDialog}
        onOpenChange={setShowConfirmDialog}
        onConfirm={handleConfirmSubmit}
        isSubmitting={isSubmitting}
      />
    </div>
  );
}
