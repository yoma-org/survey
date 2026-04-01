import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { SmtpSettings } from '@/lib/types';

// Mock nodemailer
vi.mock('nodemailer', () => {
  const mockTransport = {
    verify: vi.fn(),
    sendMail: vi.fn(),
  };
  return {
    default: {
      createTransport: vi.fn(() => mockTransport),
    },
    createTransport: vi.fn(() => mockTransport),
  };
});

import nodemailer from 'nodemailer';
import { createTransporter, testSmtpConnection, sendInvitation } from '@/lib/services/email.service';

const mockSettings: SmtpSettings = {
  host: 'smtp.example.com',
  port: '587',
  username: 'user@example.com',
  password: 'secret',
  fromAddress: 'noreply@example.com',
  fromName: 'Test Sender',
};

describe('email.service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('createTransporter', () => {
    it('sets secure=false for port 587', () => {
      createTransporter({ ...mockSettings, port: '587' });

      expect(nodemailer.createTransport).toHaveBeenCalledWith(
        expect.objectContaining({ secure: false })
      );
    });

    it('sets secure=true for port 465', () => {
      createTransporter({ ...mockSettings, port: '465' });

      expect(nodemailer.createTransport).toHaveBeenCalledWith(
        expect.objectContaining({ secure: true })
      );
    });

    it('sets connectionTimeout to 15000', () => {
      createTransporter(mockSettings);

      expect(nodemailer.createTransport).toHaveBeenCalledWith(
        expect.objectContaining({ connectionTimeout: 15_000 })
      );
    });
  });

  describe('sendInvitation', () => {
    it('calls sendMail with the correct recipient address', async () => {
      const mockSendMail = vi.fn().mockResolvedValue({});
      const mockTransporter = { sendMail: mockSendMail } as unknown as ReturnType<typeof nodemailer.createTransport>;

      await sendInvitation({
        to: 'employee@example.com',
        surveyName: 'Annual Survey 2026',
        token: 'abc123',
        locale: 'en',
        fromName: 'Test Sender',
        fromAddress: 'noreply@example.com',
        transporter: mockTransporter,
      });

      expect(mockSendMail).toHaveBeenCalledOnce();
      const callArgs = mockSendMail.mock.calls[0][0];
      expect(callArgs.to).toBe('employee@example.com');
    });

    it('calls sendMail with correct subject containing survey name', async () => {
      const mockSendMail = vi.fn().mockResolvedValue({});
      const mockTransporter = { sendMail: mockSendMail } as unknown as ReturnType<typeof nodemailer.createTransport>;

      await sendInvitation({
        to: 'employee@example.com',
        surveyName: 'Annual Survey 2026',
        token: 'abc123',
        locale: 'en',
        fromName: 'Test Sender',
        fromAddress: 'noreply@example.com',
        transporter: mockTransporter,
      });

      const callArgs = mockSendMail.mock.calls[0][0];
      expect(callArgs.subject).toContain('Annual Survey 2026');
    });

    it('includes token-based survey link in HTML', async () => {
      const mockSendMail = vi.fn().mockResolvedValue({});
      const mockTransporter = { sendMail: mockSendMail } as unknown as ReturnType<typeof nodemailer.createTransport>;

      await sendInvitation({
        to: 'employee@example.com',
        surveyName: 'Annual Survey 2026',
        token: 'uniquetoken123',
        locale: 'en',
        fromName: 'Test Sender',
        fromAddress: 'noreply@example.com',
        transporter: mockTransporter,
      });

      const callArgs = mockSendMail.mock.calls[0][0];
      expect(callArgs.html).toContain('uniquetoken123');
    });
  });

  describe('testSmtpConnection', () => {
    it('calls transporter.verify()', async () => {
      const mockVerify = vi.fn().mockResolvedValue(true);
      vi.mocked(nodemailer.createTransport).mockReturnValue(
        { verify: mockVerify } as unknown as ReturnType<typeof nodemailer.createTransport>
      );

      await testSmtpConnection(mockSettings);

      expect(mockVerify).toHaveBeenCalledOnce();
    });
  });
});
