'use client';

import { Angry, Frown, Meh, Smile, Laugh, type LucideIcon } from 'lucide-react';

const LIKERT_OPTIONS: { value: string; icon: LucideIcon; color: string; en: string; my: string }[] = [
  { value: '1', icon: Angry, color: '#ef4444', en: 'Strongly Disagree', my: 'လုံးဝမသဘောတူပါ' },
  { value: '2', icon: Frown, color: '#fb923c', en: 'Disagree', my: 'မသဘောတူပါ' },
  { value: '3', icon: Meh, color: '#a3a3a3', en: 'Neutral', my: 'ကြားနေ' },
  { value: '4', icon: Smile, color: '#4ade80', en: 'Agree', my: 'သဘောတူပါသည်' },
  { value: '5', icon: Laugh, color: '#16a34a', en: 'Strongly Agree', my: 'လုံးဝသဘောတူပါသည်' },
];

interface LikertInputProps {
  questionId: string;
  questionText: string;
  questionNumber: number;
  value: string;
  onChange: (value: string) => void;
  error?: boolean;
  displayLocale: 'en' | 'my';
  imageUrl?: string;
}

export function LikertInput({
  questionId,
  questionText,
  questionNumber,
  value,
  onChange,
  error,
  displayLocale,
  imageUrl,
}: LikertInputProps) {
  return (
    <div
      className={`py-5 ${error ? 'bg-red-50/50 -mx-4 px-4 rounded-lg border-l-2 border-red-400' : ''}`}
    >
      {imageUrl && (
        <div className="mb-3">
          <img
            src={imageUrl}
            alt=""
            className="max-h-48 rounded-lg object-contain"
            loading="lazy"
          />
        </div>
      )}

      <p
        id={`q-${questionId}`}
        style={displayLocale === 'my' ? { lineHeight: '1.75' } : undefined}
        className="text-[15px] text-foreground leading-relaxed mb-4"
      >
        <span className="text-xs text-muted-foreground/60 tabular-nums mr-2 font-medium">{questionNumber}.</span>
        {questionText}
      </p>

      {/* Desktop: horizontal chips */}
      <div
        className="hidden sm:flex gap-1.5"
        role="radiogroup"
        aria-labelledby={`q-${questionId}`}
        aria-invalid={error ? 'true' : undefined}
      >
        {LIKERT_OPTIONS.map(option => {
          const label = displayLocale === 'my' ? option.my : option.en;
          const isSelected = value === option.value;

          return (
            <button
              key={option.value}
              type="button"
              role="radio"
              aria-checked={isSelected}
              aria-label={label}
              onClick={() => onChange(option.value)}
              className={`flex-1 py-2.5 px-2 rounded-lg text-xs text-center transition-all duration-150 cursor-pointer border ${
                isSelected
                  ? 'bg-foreground text-background border-foreground font-medium shadow-sm'
                  : 'bg-transparent text-muted-foreground border-border hover:border-foreground/20 hover:bg-muted/30'
              }`}
            >
              <option.icon className="inline-block w-4 h-4 mr-1 -mt-0.5" style={isSelected ? undefined : { color: option.color }} />{label}
            </button>
          );
        })}
      </div>

      {/* Mobile: vertical tappable rows */}
      <div
        className="flex flex-col gap-1 sm:hidden"
        role="radiogroup"
        aria-labelledby={`q-${questionId}`}
        aria-invalid={error ? 'true' : undefined}
      >
        {LIKERT_OPTIONS.map(option => {
          const label = displayLocale === 'my' ? option.my : option.en;
          const isSelected = value === option.value;

          return (
            <button
              key={option.value}
              type="button"
              role="radio"
              aria-checked={isSelected}
              aria-label={label}
              onClick={() => onChange(option.value)}
              className={`flex items-center gap-3 min-h-[48px] px-4 rounded-lg text-sm text-left transition-all duration-150 border ${
                isSelected
                  ? 'bg-foreground text-background border-foreground font-medium'
                  : 'bg-transparent text-foreground border-border hover:bg-muted/30'
              }`}
            >
              <span className={`w-4 h-4 rounded-full border-2 flex-shrink-0 flex items-center justify-center ${
                isSelected ? 'border-background' : 'border-muted-foreground/40'
              }`}>
                {isSelected && <span className="w-2 h-2 rounded-full bg-background" />}
              </span>
              <option.icon className="w-5 h-5 flex-shrink-0" style={isSelected ? undefined : { color: option.color }} />
              {label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
