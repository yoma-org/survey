import { describe, it, expect } from 'vitest';
import { routing } from '@/i18n/routing';
import enMessages from '../../messages/en.json';
import mmMessages from '../../messages/mm.json';

describe('i18n routing', () => {
  it('defines en and my as locales', () => {
    expect(routing.locales).toContain('en');
    expect(routing.locales).toContain('my');
  });

  it('defaults to en locale', () => {
    expect(routing.defaultLocale).toBe('en');
  });

  it('disables locale detection (URL path only)', () => {
    expect((routing as { localeDetection?: boolean }).localeDetection).toBe(false);
  });
});

describe('en.json messages', () => {
  it('has login section with required keys', () => {
    expect(enMessages.login).toBeDefined();
    expect(enMessages.login.title).toBeDefined();
    expect(enMessages.login.error).toBeDefined();
  });

  it('has nav section with required keys', () => {
    expect(enMessages.nav).toBeDefined();
    expect(enMessages.nav.dashboard).toBeDefined();
    expect(enMessages.nav.signOut).toBeDefined();
  });

  it('has errors section', () => {
    expect(enMessages.errors).toBeDefined();
    expect(enMessages.errors.invalidCredentials).toBeDefined();
  });
});

describe('mm.json messages', () => {
  it('has login section', () => {
    expect(mmMessages.login).toBeDefined();
    expect(mmMessages.login.error).toBeDefined();
  });

  it('has same top-level keys as en.json', () => {
    const enKeys = Object.keys(enMessages).sort();
    const mmKeys = Object.keys(mmMessages).sort();
    expect(mmKeys).toEqual(enKeys);
  });
});
