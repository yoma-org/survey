import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/lib/services/token.service', () => ({
  validateToken: vi.fn(),
  markTokenUsed: vi.fn(),
}));
vi.mock('@/lib/services/csv.service', () => ({
  appendRow: vi.fn(),
  readRows: vi.fn(),
}));
vi.mock('@/lib/services/survey.service', () => ({
  getQuestions: vi.fn(),
}));

import * as tokenService from '@/lib/services/token.service';
import * as csvService from '@/lib/services/csv.service';
import * as surveyService from '@/lib/services/survey.service';
import { POST } from '@/app/api/surveys/[id]/submit/route';
import type { Token, Question } from '@/lib/types';

const mockToken: Token = {
  token: 'abc123',
  surveyId: 'survey-1',
  email: 'user@example.com',
  status: 'pending',
  createdAt: new Date().toISOString(),
};

const mockQuestions: Question[] = [
  { id: 'CAM-01', type: 'likert', en: 'Q?', my: 'Q?' },
  { id: 'OE-01', type: 'open_ended', en: 'Q?', my: 'Q?' },
  { id: 'DEM-ORG', type: 'demographic', en: 'Q?', my: 'Q?', options: [] },
];

function makeRequest(body: object) {
  return new Request('http://localhost/api/surveys/survey-1/submit', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

describe('POST /api/surveys/[id]/submit', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(csvService.appendRow).mockResolvedValue(undefined);
    vi.mocked(tokenService.markTokenUsed).mockResolvedValue(undefined);
    vi.mocked(surveyService.getQuestions).mockResolvedValue(mockQuestions);
  });

  it('returns 400 when token missing from body', async () => {
    const res = await POST(makeRequest({ answers: {} }), { params: Promise.resolve({ id: 'survey-1' }) });
    expect(res.status).toBe(400);
  });

  it('returns 400 when answers missing from body', async () => {
    const res = await POST(makeRequest({ token: 'abc123' }), { params: Promise.resolve({ id: 'survey-1' }) });
    expect(res.status).toBe(400);
  });

  it('returns 410 when validateToken returns null', async () => {
    vi.mocked(tokenService.validateToken).mockResolvedValue(null);
    const res = await POST(makeRequest({ token: 'abc123', answers: { 'CAM-01': '4', 'DEM-ORG': 'Org A' } }), { params: Promise.resolve({ id: 'survey-1' }) });
    expect(res.status).toBe(410);
  });

  it('returns 200 with success:true for valid submission', async () => {
    vi.mocked(tokenService.validateToken).mockResolvedValue(mockToken);
    const res = await POST(makeRequest({ token: 'abc123', answers: { 'CAM-01': '4', 'DEM-ORG': 'Org A' } }), { params: Promise.resolve({ id: 'survey-1' }) });
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.success).toBe(true);
  });

  it('calls appendRow before markTokenUsed', async () => {
    vi.mocked(tokenService.validateToken).mockResolvedValue(mockToken);
    const callOrder: string[] = [];
    vi.mocked(csvService.appendRow).mockImplementation(async () => { callOrder.push('appendRow'); });
    vi.mocked(tokenService.markTokenUsed).mockImplementation(async () => { callOrder.push('markTokenUsed'); });

    await POST(makeRequest({ token: 'abc123', answers: { 'CAM-01': '4', 'DEM-ORG': 'Org A' } }), { params: Promise.resolve({ id: 'survey-1' }) });

    expect(callOrder.indexOf('appendRow')).toBeLessThan(callOrder.indexOf('markTokenUsed'));
  });

  it('includes all question IDs as columns in the response row (missing optional = empty string)', async () => {
    vi.mocked(tokenService.validateToken).mockResolvedValue(mockToken);
    await POST(makeRequest({ token: 'abc123', answers: { 'CAM-01': '4', 'DEM-ORG': 'Org A' } }), { params: Promise.resolve({ id: 'survey-1' }) });

    const [filename, row] = vi.mocked(csvService.appendRow).mock.calls[0];
    expect(filename).toBe('responses-survey-1.csv');
    expect(row['CAM-01']).toBe('4');
    expect(row['OE-01']).toBe('');   // open_ended not submitted → empty string
    expect(row['DEM-ORG']).toBe('Org A');
  });
});
