import { useEffect, useRef, useState, useCallback } from 'react';

interface UseAutoTranslateOptions {
  sourceText: string;
  sourceLanguage?: string;
  targetLanguage?: string;
  debounceMs?: number;
  onTranslated: (text: string) => void;
}

export function useAutoTranslate({
  sourceText,
  sourceLanguage = 'en',
  targetLanguage = 'my',
  debounceMs = 2000,
  onTranslated,
}: UseAutoTranslateOptions) {
  const [isTranslating, setIsTranslating] = useState(false);
  const abortRef = useRef<AbortController | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastTranslatedSourceRef = useRef('');
  const userEditedTargetRef = useRef(false);
  const activeRef = useRef(false);

  const markTargetEdited = useCallback(() => {
    userEditedTargetRef.current = true;
  }, []);

  const resetTargetEdited = useCallback(() => {
    userEditedTargetRef.current = false;
  }, []);

  // Call when the source input receives focus
  const activate = useCallback(() => {
    activeRef.current = true;
  }, []);

  // Call when the source input loses focus
  const deactivate = useCallback(() => {
    activeRef.current = false;
  }, []);

  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current);

    const trimmed = sourceText.trim();

    // Only translate when user is actively typing in this field
    if (
      !activeRef.current ||
      !trimmed ||
      trimmed === lastTranslatedSourceRef.current ||
      userEditedTargetRef.current
    ) {
      return;
    }

    timerRef.current = setTimeout(async () => {
      if (abortRef.current) abortRef.current.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      setIsTranslating(true);
      try {
        const res = await fetch('/api/translate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            text: trimmed,
            sourceLanguage,
            targetLanguage,
          }),
          signal: controller.signal,
        });

        if (res.ok) {
          const { translatedText } = await res.json();
          if (translatedText && !controller.signal.aborted) {
            lastTranslatedSourceRef.current = trimmed;
            onTranslated(translatedText);
          }
        }
      } catch (err) {
        if (err instanceof DOMException && err.name === 'AbortError') return;
        console.error('Auto-translate failed:', err);
      } finally {
        if (!controller.signal.aborted) setIsTranslating(false);
      }
    }, debounceMs);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [sourceText, sourceLanguage, targetLanguage, debounceMs, onTranslated]);

  useEffect(() => {
    return () => {
      if (abortRef.current) abortRef.current.abort();
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  return { isTranslating, markTargetEdited, resetTargetEdited, activate, deactivate };
}
