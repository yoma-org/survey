'use client';

import { useState } from 'react';
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

interface SurveyFormProps {
  survey: Survey;
  questions: Question[];
  tokenRow: Token;
  locale: 'en' | 'my';
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

const SECTION_TITLE_KEYS: Record<string, string> = {
  camaraderie: 'Camaraderie',
  credibility: 'Credibility',
  fairness: 'Fairness',
  pride: 'Pride',
  respect: 'Respect',
  uncategorized: 'Other',
  open_ended: 'Open-Ended Questions',
  demographic: 'About You',
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

export function SurveyForm({ survey, questions, tokenRow, locale }: SurveyFormProps) {
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
    title: SECTION_TITLE_KEYS[sectionKey] ?? sectionKey,
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
      />

      <div className="max-w-screen-xl mx-auto px-4 py-8">
        <div className="flex flex-row gap-8">
          {/* Desktop TOC sidebar */}
          <div className="hidden lg:block w-60 flex-shrink-0">
            <TableOfContents
              sections={tocSections}
              totalProgress={totalProgress}
            />
          </div>

          {/* Form content */}
          <div className="flex-1 max-w-2xl">
            {/* Form header */}
            <div className="flex items-start justify-between mb-6 gap-4">
              <div>
                <h1 className="text-2xl font-semibold text-gray-900">{survey.name}</h1>
                {survey.description && (
                  <p className="text-sm text-gray-500 mt-1">{survey.description}</p>
                )}
              </div>

              {/* Language switcher */}
              <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden h-9 flex-shrink-0">
                {(['en', 'my'] as const).map(lang => (
                  <button
                    key={lang}
                    type="button"
                    onClick={() => setDisplayLocale(lang)}
                    className={`px-3 py-1 text-sm font-medium transition-colors ${
                      displayLocale === lang
                        ? 'bg-blue-600 text-white'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    {lang.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>

            {/* Readonly email field */}
            <div className="mb-6">
              <label className="text-sm font-medium text-gray-700 block mb-1">
                Email
              </label>
              <input
                type="email"
                readOnly
                value={tokenRow.email}
                className="block w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-600 cursor-not-allowed"
              />
            </div>

            {/* Sections */}
            {groupedSections.map(({ sectionKey, questions: sqs }) => (
              <SectionCard
                key={sectionKey}
                sectionId={sectionKey}
                title={SECTION_TITLE_KEYS[sectionKey] ?? sectionKey}
                icon={SECTION_ICONS[sectionKey]}
                answeredCount={getSectionAnsweredCount(sectionKey, sqs)}
                totalCount={sectionKey === 'open_ended' ? 0 : sqs.length}
              >
                {/* Optional name + department for demographics section (FORM-12) */}
                {sectionKey === 'demographic' && (
                  <div className="space-y-4 mb-6">
                    <p className="text-xs text-gray-400">
                      Your demographic information helps us analyze results by group. Individual responses remain anonymous.
                    </p>
                    <div>
                      <label className="text-sm font-medium text-gray-700">
                        Name (Optional)
                      </label>
                      <input
                        type="text"
                        value={answers['__name__'] ?? ''}
                        onChange={e => handleAnswer('__name__', e.target.value)}
                        className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Your name"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700">
                        Department (Optional)
                      </label>
                      <input
                        type="text"
                        value={answers['__department__'] ?? ''}
                        onChange={e => handleAnswer('__department__', e.target.value)}
                        className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Your department"
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
                      <div key={question.id} className="space-y-1">
                        <p
                          className="text-sm text-gray-800 mb-1"
                          style={displayLocale === 'my' ? { lineHeight: '1.75' } : undefined}
                        >
                          <span className="text-xs text-gray-400 font-mono mr-2">{index + 1}.</span>
                          {q(question)}
                        </p>
                        <p className="text-xs text-gray-400 mb-1">
                          Optional — share as much or as little as you would like
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
                          {charCounts[question.id] ?? 0} characters
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
                              <span className="ml-2 text-xs text-red-500">Required</span>
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
                                  className={`flex items-center gap-2 cursor-pointer rounded-lg border px-3 min-h-[44px] transition-colors ${
                                    isSelected
                                      ? 'bg-blue-50 border-blue-200'
                                      : 'bg-white border-gray-200 hover:bg-gray-50'
                                  }`}
                                >
                                  <RadioGroupItem value={optLabel} aria-label={optLabel} />
                                  <span className="text-sm text-gray-700">{optLabel}</span>
                                </label>
                              );
                            })}
                          </RadioGroup>
                        </div>
                      );
                    }

                    // Select dropdown for Organization and Service Year
                    return (
                      <div key={question.id} className="space-y-1">
                        <label
                          className="text-sm font-medium text-gray-700 block"
                          style={displayLocale === 'my' ? { lineHeight: '1.75' } : undefined}
                        >
                          {q(question)}
                          {errors.has(question.id) && (
                            <span className="ml-2 text-xs text-red-500">Required</span>
                          )}
                        </label>
                        <Select
                          value={answers[question.id] ?? ''}
                          onValueChange={value => { if (value) handleAnswer(question.id, value); }}
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select an option" />
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

            {/* Validation error count badge */}
            {hasSubmitAttempted && errors.size > 0 && (
              <div className="mb-4 flex items-center gap-2 text-red-600 text-sm font-medium">
                <span className="inline-flex items-center justify-center rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-semibold text-red-700">
                  {errors.size} unanswered
                </span>
                <span>Please answer all required questions before submitting.</span>
              </div>
            )}

            {/* Submit button */}
            <div className="pb-16">
              <button
                type="button"
                onClick={handleSubmitClick}
                className="w-full sm:w-auto px-8 py-3 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 transition-colors text-sm"
              >
                Submit Survey
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
