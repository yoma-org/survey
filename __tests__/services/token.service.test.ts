import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock the csv.service module
vi.mock('@/lib/services/csv.service', () => ({
  readRows: vi.fn(),
  appendRow: vi.fn(),
  writeRows: vi.fn(),
}));

import * as csvService from '@/lib/services/csv.service';
import { generateToken, validateToken, listTokens } from '@/lib/services/token.service';

describe('token.service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('generateToken', () => {
    it('returns a 64-char hex string', async () => {
      vi.mocked(csvService.readRows).mockResolvedValue([]);
      vi.mocked(csvService.appendRow).mockResolvedValue(undefined);

      const token = await generateToken('survey-1', 'user@example.com');

      expect(token).toHaveLength(64);
      expect(token).toMatch(/^[0-9a-f]+$/);
    });

    it('is idempotent for the same email+surveyId combination', async () => {
      const existingToken = 'a'.repeat(64);
      vi.mocked(csvService.readRows).mockResolvedValue([
        {
          token: existingToken,
          email: 'user@example.com',
          surveyId: 'survey-1',
          status: 'pending',
          createdAt: new Date().toISOString(),
          submittedAt: '',
        },
      ]);

      const token = await generateToken('survey-1', 'user@example.com');

      expect(token).toBe(existingToken);
      expect(csvService.appendRow).not.toHaveBeenCalled();
    });

    it('appends a new row for a new email', async () => {
      vi.mocked(csvService.readRows).mockResolvedValue([]);
      vi.mocked(csvService.appendRow).mockResolvedValue(undefined);

      await generateToken('survey-1', 'newuser@example.com');

      expect(csvService.appendRow).toHaveBeenCalledOnce();
      const [filename, row] = vi.mocked(csvService.appendRow).mock.calls[0];
      expect(filename).toBe('tokens-survey-1.csv');
      expect(row.email).toBe('newuser@example.com');
      expect(row.status).toBe('pending');
    });
  });

  describe('validateToken', () => {
    it('returns null for non-existent token', async () => {
      vi.mocked(csvService.readRows).mockResolvedValue([]);

      const result = await validateToken('nonexistent', 'survey-1');

      expect(result).toBeNull();
    });

    it('returns null for submitted (used) token', async () => {
      vi.mocked(csvService.readRows).mockResolvedValue([
        {
          token: 'sometoken',
          email: 'user@example.com',
          surveyId: 'survey-1',
          status: 'submitted',
          createdAt: new Date().toISOString(),
          submittedAt: new Date().toISOString(),
        },
      ]);

      const result = await validateToken('sometoken', 'survey-1');

      expect(result).toBeNull();
    });

    it('returns the token row for a valid pending token', async () => {
      const iso = new Date().toISOString();
      vi.mocked(csvService.readRows).mockResolvedValue([
        {
          token: 'pendingtoken',
          email: 'user@example.com',
          surveyId: 'survey-1',
          status: 'pending',
          createdAt: iso,
          submittedAt: '',
        },
      ]);

      const result = await validateToken('pendingtoken', 'survey-1');

      expect(result).not.toBeNull();
      expect(result?.token).toBe('pendingtoken');
      expect(result?.status).toBe('pending');
    });
  });

  describe('listTokens', () => {
    it('returns [] when readRows returns []', async () => {
      vi.mocked(csvService.readRows).mockResolvedValue([]);

      const result = await listTokens('survey-1');

      expect(result).toEqual([]);
    });

    it('returns tokens sorted by createdAt descending', async () => {
      vi.mocked(csvService.readRows).mockResolvedValue([
        {
          token: 'token1',
          email: 'a@example.com',
          surveyId: 'survey-1',
          status: 'pending',
          createdAt: '2024-01-01T00:00:00.000Z',
          submittedAt: '',
        },
        {
          token: 'token2',
          email: 'b@example.com',
          surveyId: 'survey-1',
          status: 'pending',
          createdAt: '2024-01-03T00:00:00.000Z',
          submittedAt: '',
        },
        {
          token: 'token3',
          email: 'c@example.com',
          surveyId: 'survey-1',
          status: 'pending',
          createdAt: '2024-01-02T00:00:00.000Z',
          submittedAt: '',
        },
      ]);

      const result = await listTokens('survey-1');

      expect(result[0].token).toBe('token2');
      expect(result[1].token).toBe('token3');
      expect(result[2].token).toBe('token1');
    });

    it('returns [] when readRows throws (file not found)', async () => {
      vi.mocked(csvService.readRows).mockRejectedValue(new Error('File not found'));

      const result = await listTokens('survey-1');

      expect(result).toEqual([]);
    });
  });
});
