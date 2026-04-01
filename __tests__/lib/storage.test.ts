import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import * as fs from 'fs/promises';
import * as path from 'path';
import { LocalAdapter } from '@/lib/storage/local.adapter';

const TEST_DATA_DIR = path.join(process.cwd(), 'data-test');

// Override DATA_DIR for tests by using a test-specific directory
// LocalAdapter uses process.cwd()/data — we test in isolation
describe('LocalAdapter', () => {
  const adapter = new LocalAdapter(TEST_DATA_DIR);

  beforeEach(async () => {
    await fs.mkdir(TEST_DATA_DIR, { recursive: true });
  });

  afterEach(async () => {
    await fs.rm(TEST_DATA_DIR, { recursive: true, force: true });
  });

  it('read returns null for non-existent file', async () => {
    const result = await adapter.read('nonexistent.csv');
    expect(result).toBeNull();
  });

  it('write creates file and returns etag string', async () => {
    const result = await adapter.write('test.csv', 'id,name\n1,Alice');
    expect(typeof result.etag).toBe('string');
    expect(result.etag.length).toBeGreaterThan(0);
  });

  it('read returns content after write', async () => {
    await adapter.write('test.csv', 'id,name\n1,Alice');
    const content = await adapter.read('test.csv');
    expect(content).toBe('id,name\n1,Alice');
  });

  it('exists returns false for missing file', async () => {
    expect(await adapter.exists('missing.csv')).toBe(false);
  });

  it('exists returns true after write', async () => {
    await adapter.write('test.csv', 'id,name');
    expect(await adapter.exists('test.csv')).toBe(true);
  });
});
