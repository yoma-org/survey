import { describe, it, expect } from 'vitest';
// TODO: implement — tests will pass after Task 3
import { parseCSV, serializeCSV, appendRow } from '@/lib/services/csv.service';

describe('parseCSV', () => {
  it('returns typed array with header-keyed rows', () => {
    const csv = 'id,name\n1,Alice\n2,Bob';
    const result = parseCSV<{ id: string; name: string }>(csv);
    expect(result).toHaveLength(2);
    expect(result[0].id).toBe('1');
    expect(result[0].name).toBe('Alice');
  });

  it('returns empty array for empty string', () => {
    expect(parseCSV('')).toEqual([]);
  });
});

describe('serializeCSV', () => {
  it('produces CSV string with header row', () => {
    const rows = [{ id: '1', name: 'Alice' }];
    const result = serializeCSV(rows);
    expect(result).toContain('id,name');
    expect(result).toContain('1,Alice');
  });
});

describe('appendRow', () => {
  it('adds a new row to existing CSV content', async () => {
    // appendRow is tested via integration in storage.test.ts
    // This test validates serializeCSV round-trip
    const original = 'id,name\n1,Alice';
    const rows = parseCSV<{ id: string; name: string }>(original);
    rows.push({ id: '2', name: 'Bob' });
    const result = serializeCSV(rows);
    expect(result).toContain('2,Bob');
  });
});
