import { unstable_cache } from 'next/cache';
import { listSurveys, getSurvey, getQuestions, getResponseCount } from '@/lib/services/survey.service';
import { computeAnalytics, computeMultiSurveyAnalytics, getDistinctDepartments } from '@/lib/services/analytics.service';
import { getSmtpSettings } from '@/lib/services/smtp.service';
import { listTokens, countSurveyTokens } from '@/lib/services/token.service';

// Cache tags for targeted revalidation
export const CACHE_TAGS = {
  surveys: 'surveys',
  survey: (id: string) => `survey-${id}`,
  questions: (id: string) => `questions-${id}`,
  analytics: (id: string) => `analytics-${id}`,
  tokens: (id: string) => `tokens-${id}`,
  smtp: 'smtp',
} as const;

// Survey list — revalidate every 30s or on mutation
export const cachedListSurveys = unstable_cache(
  async () => listSurveys(),
  ['surveys-list'],
  { revalidate: 30, tags: [CACHE_TAGS.surveys] }
);

// Single survey
export const cachedGetSurvey = (id: string) =>
  unstable_cache(
    async () => getSurvey(id),
    [`survey-${id}`],
    { revalidate: 60, tags: [CACHE_TAGS.survey(id)] }
  )();

// Questions for a survey
export const cachedGetQuestions = (surveyId: string) =>
  unstable_cache(
    async () => getQuestions(surveyId),
    [`questions-${surveyId}`],
    { revalidate: 60, tags: [CACHE_TAGS.questions(surveyId)] }
  )();

// Response count
export const cachedGetResponseCount = (surveyId: string) =>
  unstable_cache(
    async () => getResponseCount(surveyId),
    [`response-count-${surveyId}`],
    { revalidate: 15, tags: [CACHE_TAGS.analytics(surveyId)] }
  )();

// Analytics — heavy computation, cache for 60s
export const cachedComputeAnalytics = (surveyId: string, org?: string, dept?: string, locale: string = 'en') =>
  unstable_cache(
    async () => computeAnalytics(surveyId, org, dept, locale),
    [`analytics-${surveyId}-${org ?? 'all'}-${dept ?? 'all'}-${locale}`],
    { revalidate: 60, tags: [CACHE_TAGS.analytics(surveyId)] }
  )();

// Distinct departments for a survey
export const cachedGetDistinctDepartments = (surveyId: string) =>
  unstable_cache(
    async () => getDistinctDepartments(surveyId),
    [`departments-${surveyId}`],
    { revalidate: 60, tags: [CACHE_TAGS.analytics(surveyId)] }
  )();

// SMTP settings
export const cachedGetSmtpSettings = unstable_cache(
  async () => getSmtpSettings(),
  ['smtp-settings'],
  { revalidate: 120, tags: [CACHE_TAGS.smtp] }
);

// Token list for a survey
export const cachedListTokens = (surveyId: string) =>
  unstable_cache(
    async () => listTokens(surveyId),
    [`tokens-${surveyId}`],
    { revalidate: 15, tags: [CACHE_TAGS.tokens(surveyId)] }
  )();

// Token count
export const cachedCountTokens = (surveyId: string) =>
  unstable_cache(
    async () => countSurveyTokens(surveyId),
    [`token-count-${surveyId}`],
    { revalidate: 15, tags: [CACHE_TAGS.tokens(surveyId)] }
  )();

// Multi-survey analytics — cross-survey trend, 120s TTL
export const cachedMultiSurveyAnalytics = (org?: string, locale: string = 'en') =>
  unstable_cache(
    async () => computeMultiSurveyAnalytics(org, locale),
    [`multi-survey-analytics-${org ?? 'all'}-${locale}`],
    { revalidate: 120, tags: [CACHE_TAGS.surveys] }
  )();
