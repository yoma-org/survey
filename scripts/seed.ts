/**
 * Database seeding script for Surey-Yoma
 * Populates Supabase PostgreSQL with realistic GPTW survey data.
 *
 * Run: npx tsx scripts/seed.ts
 */

import 'dotenv/config';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { randomBytes } from 'node:crypto';
import * as schema from '../src/lib/db/schema';
import { GPTW_QUESTIONS, OPEN_ENDED_QUESTIONS, DEMOGRAPHIC_FIELDS } from '../src/lib/constants';

// ---------------------------------------------------------------------------
// DB setup (mirrors src/lib/db/index.ts but without module caching issues)
// ---------------------------------------------------------------------------
const connectionString = process.env.DATABASE_URL!;
if (!connectionString) {
  console.error('DATABASE_URL is not set');
  process.exit(1);
}
const client = postgres(connectionString, { max: 5, idle_timeout: 20, connect_timeout: 10 });
const db = drizzle(client, { schema });

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function randomToken(): string {
  return randomBytes(32).toString('hex');
}

/** Weighted random integer. Higher weight on 4-5, a few 1-2 for realism. */
function randomLikert(bias: 'high' | 'medium' | 'low' = 'high'): string {
  const r = Math.random();
  if (bias === 'high') {
    // 5=35%, 4=35%, 3=18%, 2=7%, 1=5%
    if (r < 0.35) return '5';
    if (r < 0.70) return '4';
    if (r < 0.88) return '3';
    if (r < 0.95) return '2';
    return '1';
  }
  if (bias === 'medium') {
    // 5=20%, 4=30%, 3=30%, 2=13%, 1=7%
    if (r < 0.20) return '5';
    if (r < 0.50) return '4';
    if (r < 0.80) return '3';
    if (r < 0.93) return '2';
    return '1';
  }
  // low
  // 5=10%, 4=20%, 3=30%, 2=25%, 1=15%
  if (r < 0.10) return '5';
  if (r < 0.30) return '4';
  if (r < 0.60) return '3';
  if (r < 0.85) return '2';
  return '1';
}

/** Dimension-specific bias per department for interesting analytics patterns. */
const DEPT_DIMENSION_BIAS: Record<string, Record<string, 'high' | 'medium' | 'low'>> = {
  Technology: { camaraderie: 'high', credibility: 'high', fairness: 'medium', pride: 'high', respect: 'high' },
  Operations: { camaraderie: 'medium', credibility: 'medium', fairness: 'medium', pride: 'medium', respect: 'medium' },
  Finance: { camaraderie: 'high', credibility: 'high', fairness: 'high', pride: 'high', respect: 'high' },
  'Human Resources': { camaraderie: 'high', credibility: 'medium', fairness: 'high', pride: 'high', respect: 'high' },
  Marketing: { camaraderie: 'high', credibility: 'medium', fairness: 'medium', pride: 'high', respect: 'medium' },
  'Customer Service': { camaraderie: 'medium', credibility: 'low', fairness: 'low', pride: 'medium', respect: 'low' },
};

const DEPARTMENTS = Object.keys(DEPT_DIMENSION_BIAS);

function getLikertBias(
  dimension: string | undefined,
  dept: string,
  org: 'Wave Money' | 'Yoma Bank'
): 'high' | 'medium' | 'low' {
  const dim = dimension ?? 'uncategorized';
  const base: 'high' | 'medium' | 'low' =
    (DEPT_DIMENSION_BIAS[dept]?.[dim] as 'high' | 'medium' | 'low') ?? 'medium';

  // Wave Money gets a 1-step bonus
  if (org === 'Wave Money') {
    if (base === 'medium') return 'high';
    if (base === 'low') return 'medium';
  }
  return base;
}

const SERVICE_YEAR_OPTIONS = [
  'Less than 1 year',
  '1 to 3 years',
  '3 to 5 years',
  '5 to 10 years',
  '10 to 20 years',
  'More than 20 years',
] as const;

const SERVICE_YEAR_WEIGHTS = [0.10, 0.25, 0.25, 0.25, 0.12, 0.03]; // sums to 1

function randomServiceYear(): string {
  const r = Math.random();
  let cumulative = 0;
  for (let i = 0; i < SERVICE_YEAR_WEIGHTS.length; i++) {
    cumulative += SERVICE_YEAR_WEIGHTS[i];
    if (r < cumulative) return SERVICE_YEAR_OPTIONS[i];
  }
  return SERVICE_YEAR_OPTIONS[SERVICE_YEAR_OPTIONS.length - 1];
}

function randomRole(): string {
  return Math.random() < 0.20 ? 'People Manager' : 'Individual Contributor';
}

const OE_01_ANSWERS = [
  'The leadership genuinely listens to employee feedback and acts on it quickly.',
  'We have flexible work arrangements that truly support work-life balance.',
  'The culture of continuous learning -- training budgets are generous and encouraged.',
  'Cross-department collaboration is organic; people help each other without being asked.',
  'Our CEO does monthly all-hands and actually answers tough questions live.',
  "Benefits package is among the best I've seen -- health coverage extends to family.",
  "The company's mission feels meaningful; we're genuinely improving people's lives.",
  'Strong psychological safety -- mistakes are treated as learning, not failure.',
  'Women in leadership is well above industry average here.',
  'Office perks are great, but what stands out is how much we celebrate team wins.',
  'Transparent salary bands -- no politics, you know exactly how to grow.',
  'The onboarding experience was exceptional; I felt productive in week one.',
  'We have a culture of recognition -- small wins get celebrated too.',
  'International exposure -- I get to work with colleagues across Southeast Asia.',
  'Commitment to CSR is real, not performative -- we spend real time on it.',
];

const OE_02_ANSWERS = [
  "Better career path visibility -- it's sometimes unclear how to advance.",
  'Reduce meeting frequency; too many meetings eat into deep work time.',
  'More cross-department rotation opportunities to build broader skills.',
  'Faster IT equipment refresh cycle -- some hardware is outdated.',
  'Improve internal communication from senior leadership during major changes.',
  'Clearer promotion criteria; merit vs. tenure is not always transparent.',
  'More competitive salaries for mid-level individual contributors.',
  'Stronger mental health support programs beyond the EAP hotline.',
  'Better project management tooling -- we rely too heavily on spreadsheets.',
  'Reduce bureaucracy in procurement; approvals take too long.',
  'More mentorship programs, especially for junior team members.',
  'Better childcare benefits or nursery subsidies.',
  'More parking or better shuttle service options.',
  'Consolidate the number of internal communication channels (too many apps).',
  'Clearer escalation paths for HR concerns.',
];

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

// ---------------------------------------------------------------------------
// Email generators
// ---------------------------------------------------------------------------

const FIRST_NAMES = [
  'Aye', 'Mg', 'Zaw', 'Kyaw', 'Thida', 'Su', 'Hla', 'Myint', 'Win', 'Nyi',
  'Tin', 'Wai', 'Phyo', 'Ei', 'Khin', 'Nan', 'May', 'Zin', 'Thet', 'Soe',
  'Lin', 'Thu', 'Yee', 'Htun', 'Mya', 'San', 'Hnin', 'Ko', 'Ma', 'Aung',
];
const LAST_NAMES = [
  'Tun', 'Lwin', 'Htwe', 'Aung', 'Moe', 'Zaw', 'Win', 'Kyaw', 'Thein', 'Oo',
  'Naing', 'Nwe', 'Phyo', 'Soe', 'Hlaing', 'Myint', 'Htay', 'Wai', 'Cho', 'Khin',
];

const emailSet = new Set<string>();

function generateEmail(org: string): string {
  const domain = org === 'Wave Money' ? 'wavemoney.com.mm' : 'yomabank.com';
  let attempts = 0;
  while (attempts < 100) {
    const first = pickRandom(FIRST_NAMES).toLowerCase();
    const last = pickRandom(LAST_NAMES).toLowerCase();
    const num = Math.floor(Math.random() * 99) + 1;
    const email = `${first}.${last}${num}@${domain}`;
    if (!emailSet.has(email)) {
      emailSet.add(email);
      return email;
    }
    attempts++;
  }
  // Fallback with timestamp uniqueness
  const ts = Date.now().toString(36);
  return `respondent.${ts}@${org === 'Wave Money' ? 'wavemoney.com.mm' : 'yomabank.com'}`;
}

// ---------------------------------------------------------------------------
// Answer builder
// ---------------------------------------------------------------------------

function buildAnswers(
  org: 'Wave Money' | 'Yoma Bank',
  dept: string
): Record<string, string> {
  const answers: Record<string, string> = {};

  // Likert questions
  for (const q of GPTW_QUESTIONS) {
    answers[q.id] = randomLikert(getLikertBias(q.dimension, dept, org));
  }

  // Open-ended
  answers['OE-01'] = pickRandom(OE_01_ANSWERS);
  answers['OE-02'] = pickRandom(OE_02_ANSWERS);

  // Demographics
  answers['DEM-ORG'] = org;
  answers['DEM-YEAR'] = randomServiceYear();
  answers['DEM-ROLE'] = randomRole();

  return answers;
}

// ---------------------------------------------------------------------------
// Date helpers -- spread responses realistically over survey period
// ---------------------------------------------------------------------------

function randomDateBetween(start: Date, end: Date): Date {
  const diff = end.getTime() - start.getTime();
  return new Date(start.getTime() + Math.random() * diff);
}

// ---------------------------------------------------------------------------
// Main seeding logic
// ---------------------------------------------------------------------------

async function seed() {
  console.log('Starting database seed...\n');

  // ------------------------------------------------------------------
  // 0. Clean existing data (order matters for FK constraints)
  // ------------------------------------------------------------------
  console.log('Truncating existing data...');
  await db.delete(schema.responses);
  await db.delete(schema.tokens);
  await db.delete(schema.questions);
  await db.delete(schema.smtpSettings);
  await db.delete(schema.surveys);
  console.log('  Done.\n');

  // ------------------------------------------------------------------
  // 1. SMTP Settings (singleton)
  // ------------------------------------------------------------------
  console.log('Seeding SMTP settings...');
  await db.insert(schema.smtpSettings).values({
    id: 1,
    host: 'smtp.gmail.com',
    port: '587',
    username: 'surveys@wavemoney.com.mm',
    password: 'smtp_placeholder_password',
    fromAddress: 'surveys@wavemoney.com.mm',
    fromName: 'Yoma Group People & Culture',
  });
  console.log('  SMTP settings seeded.\n');

  // ------------------------------------------------------------------
  // 2. Surveys
  // ------------------------------------------------------------------
  console.log('Seeding surveys...');

  const surveyRows = await db
    .insert(schema.surveys)
    .values([
      {
        name: 'Annual GPTW Survey 2024',
        description: 'Great Place To Work annual employee engagement survey for FY 2024.',
        status: 'closed',
        createdAt: new Date('2024-01-15T08:00:00Z'),
      },
      {
        name: 'Annual GPTW Survey 2025',
        description: 'Great Place To Work annual employee engagement survey for FY 2025.',
        status: 'closed',
        createdAt: new Date('2025-01-20T08:00:00Z'),
      },
      {
        name: 'Annual GPTW Survey 2026',
        description: 'Great Place To Work annual employee engagement survey for FY 2026.',
        status: 'active',
        createdAt: new Date('2026-01-15T08:00:00Z'),
      },
    ])
    .returning({ id: schema.surveys.id, name: schema.surveys.name });

  const [survey2024, survey2025, survey2026] = surveyRows;
  console.log(`  Created surveys: ${surveyRows.map(s => s.name).join(', ')}\n`);

  // ------------------------------------------------------------------
  // 3. Questions (for all 3 surveys)
  // ------------------------------------------------------------------
  console.log('Seeding questions for all surveys...');

  const allQuestions = [...GPTW_QUESTIONS, ...OPEN_ENDED_QUESTIONS, ...DEMOGRAPHIC_FIELDS];

  for (const survey of [survey2024, survey2025, survey2026]) {
    const questionRows = allQuestions.map((q, idx) => ({
      id: q.id,
      surveyId: survey.id,
      type: q.type,
      dimension: q.dimension ?? null,
      subPillar: q.subPillar ?? null,
      en: q.en,
      my: q.my,
      options: q.options ?? null,
      sortOrder: idx,
    }));

    // Insert in batches to avoid hitting parameter limits
    const batchSize = 20;
    for (let i = 0; i < questionRows.length; i += batchSize) {
      await db.insert(schema.questions).values(questionRows.slice(i, i + batchSize));
    }
    console.log(`  ${questionRows.length} questions seeded for "${survey.name}"`);
  }
  console.log();

  // ------------------------------------------------------------------
  // 4. Response + token generation helper
  // ------------------------------------------------------------------

  interface ResponseSpec {
    surveyId: string;
    count: number;
    startDate: Date;
    endDate: Date;
    wavePct: number; // fraction of responses from Wave Money
  }

  async function seedResponses(spec: ResponseSpec) {
    const { surveyId, count, startDate, endDate, wavePct } = spec;

    const tokenRows: (typeof schema.tokens.$inferInsert)[] = [];
    const responseRows: (typeof schema.responses.$inferInsert)[] = [];

    for (let i = 0; i < count; i++) {
      const org: 'Wave Money' | 'Yoma Bank' = Math.random() < wavePct ? 'Wave Money' : 'Yoma Bank';
      const dept = pickRandom(DEPARTMENTS);
      const email = generateEmail(org);
      const tok = randomToken();
      const submittedAt = randomDateBetween(startDate, endDate);

      tokenRows.push({
        token: tok,
        surveyId,
        email,
        status: 'submitted',
        createdAt: new Date(submittedAt.getTime() - Math.random() * 7 * 24 * 60 * 60 * 1000),
        submittedAt,
      });

      responseRows.push({
        surveyId,
        token: tok,
        email,
        answers: buildAnswers(org, dept),
        submittedAt,
      });
    }

    // Batch insert tokens
    const batchSize = 50;
    for (let i = 0; i < tokenRows.length; i += batchSize) {
      await db.insert(schema.tokens).values(tokenRows.slice(i, i + batchSize));
    }

    // Batch insert responses
    for (let i = 0; i < responseRows.length; i += batchSize) {
      await db.insert(schema.responses).values(responseRows.slice(i, i + batchSize));
    }

    return count;
  }

  // ------------------------------------------------------------------
  // 5. Seed responses for each survey
  // ------------------------------------------------------------------

  console.log('Seeding responses for 2024 survey (60 responses)...');
  const count2024 = await seedResponses({
    surveyId: survey2024.id,
    count: 60,
    startDate: new Date('2024-02-01T08:00:00Z'),
    endDate: new Date('2024-03-15T17:00:00Z'),
    wavePct: 0.55,
  });
  console.log(`  ${count2024} responses seeded for 2024.\n`);

  console.log('Seeding responses for 2025 survey (80 responses)...');
  const count2025 = await seedResponses({
    surveyId: survey2025.id,
    count: 80,
    startDate: new Date('2025-02-01T08:00:00Z'),
    endDate: new Date('2025-03-15T17:00:00Z'),
    wavePct: 0.55,
  });
  console.log(`  ${count2025} responses seeded for 2025.\n`);

  console.log('Seeding responses for 2026 survey (120 responses)...');
  const count2026 = await seedResponses({
    surveyId: survey2026.id,
    count: 120,
    startDate: new Date('2026-02-01T08:00:00Z'),
    endDate: new Date('2026-03-28T17:00:00Z'),
    wavePct: 0.55,
  });
  console.log(`  ${count2026} responses seeded for 2026.\n`);

  // ------------------------------------------------------------------
  // 6. Pending tokens for 2026 survey (20 invited, not yet responded)
  // ------------------------------------------------------------------

  console.log('Seeding 20 pending tokens for 2026 survey...');
  const pendingTokenRows: (typeof schema.tokens.$inferInsert)[] = [];

  for (let i = 0; i < 20; i++) {
    const org: 'Wave Money' | 'Yoma Bank' = i < 11 ? 'Wave Money' : 'Yoma Bank';
    const email = generateEmail(org);
    pendingTokenRows.push({
      token: randomToken(),
      surveyId: survey2026.id,
      email,
      status: 'pending',
      createdAt: randomDateBetween(
        new Date('2026-01-20T08:00:00Z'),
        new Date('2026-02-01T00:00:00Z')
      ),
      submittedAt: null,
    });
  }

  const batchSize = 20;
  for (let i = 0; i < pendingTokenRows.length; i += batchSize) {
    await db.insert(schema.tokens).values(pendingTokenRows.slice(i, i + batchSize));
  }
  console.log(`  20 pending tokens seeded for 2026.\n`);

  // ------------------------------------------------------------------
  // 7. Summary
  // ------------------------------------------------------------------
  const totalResponses = count2024 + count2025 + count2026;
  const totalTokens = count2024 + count2025 + count2026 + 20;

  console.log('='.repeat(60));
  console.log('Seed complete!');
  console.log(`  Surveys:       3`);
  console.log(`  Questions:     ${allQuestions.length} per survey (${allQuestions.length * 3} total)`);
  console.log(`  Responses:     ${totalResponses} (2024: ${count2024}, 2025: ${count2025}, 2026: ${count2026})`);
  console.log(`  Tokens:        ${totalTokens} (${totalTokens - 20} submitted + 20 pending)`);
  console.log(`  SMTP settings: 1`);
  console.log('='.repeat(60));
}

// ---------------------------------------------------------------------------
// Run
// ---------------------------------------------------------------------------

seed()
  .catch((err) => {
    console.error('Seed failed:', err);
    process.exit(1);
  })
  .finally(() => {
    client.end();
  });
