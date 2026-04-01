import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock csv.service before importing survey.service
vi.mock('@/lib/services/csv.service', () => ({
  readRows: vi.fn(),
  appendRow: vi.fn(),
  writeRows: vi.fn(),
}));

import {
  createSurvey,
  listSurveys,
  getSurvey,
  saveQuestions,
  getResponseCount,
} from '@/lib/services/survey.service';
import { readRows, appendRow, writeRows } from '@/lib/services/csv.service';

const mockReadRows = vi.mocked(readRows);
const mockAppendRow = vi.mocked(appendRow);
const mockWriteRows = vi.mocked(writeRows);

beforeEach(() => {
  vi.clearAllMocks();
  mockReadRows.mockResolvedValue([]);
  mockAppendRow.mockResolvedValue(undefined);
  mockWriteRows.mockResolvedValue(undefined);
});

describe('survey.service', () => {
  it('createSurvey appends a new row to surveys.csv with the given name', async () => {
    const survey = await createSurvey({ name: 'Employee Engagement 2026' });

    expect(mockAppendRow).toHaveBeenCalledOnce();
    const [filename, row] = mockAppendRow.mock.calls[0];
    expect(filename).toBe('surveys.csv');
    expect(row.name).toBe('Employee Engagement 2026');
    expect(row.status).toBe('draft');
    expect(survey.name).toBe('Employee Engagement 2026');
    expect(survey.id).toBeTruthy();
  });

  it('listSurveys returns surveys sorted by createdAt descending', async () => {
    mockReadRows.mockResolvedValue([
      { id: '1', name: 'Old Survey', status: 'draft', createdAt: '2026-01-01T00:00:00.000Z', description: '' },
      { id: '2', name: 'New Survey', status: 'active', createdAt: '2026-03-01T00:00:00.000Z', description: '' },
    ]);

    const surveys = await listSurveys();

    expect(surveys[0].id).toBe('2');
    expect(surveys[1].id).toBe('1');
  });

  it('getSurvey returns null when survey is not found', async () => {
    mockReadRows.mockResolvedValue([
      { id: 'other-id', name: 'Other', status: 'draft', createdAt: '2026-01-01T00:00:00.000Z', description: '' },
    ]);

    const result = await getSurvey('non-existent-id');

    expect(result).toBeNull();
  });

  it('saveQuestions calls writeRows with questions-{surveyId}.csv filename', async () => {
    const questions = [
      { id: 'CAM-01', type: 'likert' as const, en: 'I trust my manager', my: 'မန်နေဂျာ', dimension: 'camaraderie' as const },
    ];

    await saveQuestions('survey-123', questions);

    expect(mockWriteRows).toHaveBeenCalledOnce();
    const [filename] = mockWriteRows.mock.calls[0];
    expect(filename).toBe('questions-survey-123.csv');
  });

  it('getResponseCount returns 0 when readRows returns empty array', async () => {
    mockReadRows.mockResolvedValue([]);

    const count = await getResponseCount('survey-abc');

    expect(count).toBe(0);
  });

  it('getResponseCount returns 0 when readRows throws (file not found)', async () => {
    mockReadRows.mockRejectedValue(new Error('File not found'));

    const count = await getResponseCount('survey-abc');

    expect(count).toBe(0);
  });
});
