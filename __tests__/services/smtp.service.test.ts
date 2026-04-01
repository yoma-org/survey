import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock the csv.service module
vi.mock('@/lib/services/csv.service', () => ({
  readRows: vi.fn(),
  appendRow: vi.fn(),
  writeRows: vi.fn(),
}));

import * as csvService from '@/lib/services/csv.service';
import { getSmtpSettings, saveSmtpSettings } from '@/lib/services/smtp.service';
import type { SmtpSettings } from '@/lib/types';

const mockSettings: SmtpSettings = {
  host: 'smtp.example.com',
  port: '587',
  username: 'user@example.com',
  password: 'secret',
  fromAddress: 'noreply@example.com',
  fromName: 'Test Sender',
};

describe('smtp.service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getSmtpSettings', () => {
    it('returns null when readRows returns []', async () => {
      vi.mocked(csvService.readRows).mockResolvedValue([]);

      const result = await getSmtpSettings();

      expect(result).toBeNull();
    });

    it('returns the first row when settings exist', async () => {
      vi.mocked(csvService.readRows).mockResolvedValue([mockSettings as unknown as Record<string, string>]);

      const result = await getSmtpSettings();

      expect(result).toEqual(mockSettings);
      expect(csvService.readRows).toHaveBeenCalledWith('smtp-settings.csv');
    });
  });

  describe('saveSmtpSettings', () => {
    it('calls writeRows with smtp-settings.csv and array of 1 row', async () => {
      vi.mocked(csvService.writeRows).mockResolvedValue(undefined);

      await saveSmtpSettings(mockSettings);

      expect(csvService.writeRows).toHaveBeenCalledOnce();
      const [filename, rows] = vi.mocked(csvService.writeRows).mock.calls[0];
      expect(filename).toBe('smtp-settings.csv');
      expect(rows).toHaveLength(1);
      expect(rows[0]).toMatchObject({
        host: 'smtp.example.com',
        port: '587',
        username: 'user@example.com',
      });
    });
  });
});
