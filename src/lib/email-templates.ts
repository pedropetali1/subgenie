import { CATEGORY_MAP } from './constants';
import { formatCurrency, formatDate } from './utils';
import type { Category, Cycle } from '@/types';

interface AlertEmailInput {
  userName: string | null;
  serviceName: string;
  price: number;
  currency: string;
  billingDate: string;
  daysUntil: number;
  category: Category;
  cycle: Cycle;
  cancelUrl: string | null;
  cancelLabel?: string;
  appUrl: string;
}

export function buildAlertEmailSubject(input: {
  serviceName: string;
  price: number;
  currency: string;
  daysUntil: number;
}): string {
  const value = formatCurrency(input.price, input.currency);
  return `⚠️ ${input.serviceName} cobra ${value} em ${input.daysUntil} dia(s)`;
}

export function buildAlertEmailHtml(input: AlertEmailInput): string {
  const cat = CATEGORY_MAP[input.category];
  const greeting = input.userName ? `Olá, ${input.userName}!` : 'Olá!';
  const value = formatCurrency(input.price, input.currency);
  const date = formatDate(input.billingDate);

  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="utf-8" />
<title>SubGenie — Alerta de cobrança</title>
</head>
<body style="margin:0;padding:0;background:#0a0a14;color:#e0e0e8;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;">
  <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="background:#0a0a14;">
    <tr><td align="center" style="padding:32px 16px;">
      <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="max-width:560px;background:#16162a;border:1px solid #2a2a3a;border-radius:12px;overflow:hidden;">
        <tr><td style="padding:24px 28px;border-bottom:1px solid #2a2a3a;">
          <div style="display:inline-block;background:#6C5CE7;color:#fff;font-weight:700;font-size:14px;padding:6px 10px;border-radius:8px;">S</div>
          <span style="font-weight:700;color:#e0e0e8;font-size:16px;margin-left:8px;">SubGenie</span>
        </td></tr>
        <tr><td style="padding:28px;">
          <p style="color:#8888a0;font-size:14px;margin:0 0 8px;">${escapeHtml(greeting)}</p>
          <h1 style="color:#e0e0e8;font-size:22px;font-weight:700;margin:0 0 16px;">
            ${escapeHtml(input.serviceName)} cobra ${value} em ${input.daysUntil} dia(s).
          </h1>

          <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="background:#0d0d1a;border:1px solid #2a2a3a;border-radius:8px;margin:20px 0;">
            <tr><td style="padding:16px;">
              <table role="presentation" cellpadding="0" cellspacing="0" width="100%">
                <tr>
                  <td style="width:48px;vertical-align:middle;">
                    <div style="background:${cat.color}22;width:40px;height:40px;border-radius:8px;text-align:center;line-height:40px;font-size:20px;">${cat.emoji}</div>
                  </td>
                  <td style="vertical-align:middle;padding-left:12px;">
                    <div style="color:#e0e0e8;font-weight:600;font-size:15px;">${escapeHtml(input.serviceName)}</div>
                    <div style="color:#8888a0;font-size:12px;margin-top:2px;">${cat.label} · cobra em ${date}</div>
                  </td>
                  <td style="vertical-align:middle;text-align:right;">
                    <div style="color:#e0e0e8;font-weight:700;font-size:18px;font-family:ui-monospace,SFMono-Regular,monospace;">${value}</div>
                  </td>
                </tr>
              </table>
            </td></tr>
          </table>

          <div style="margin:24px 0;">
            <a href="${input.appUrl}/dashboard" style="display:inline-block;background:#6C5CE7;color:#fff;text-decoration:none;font-weight:500;padding:12px 20px;border-radius:8px;font-size:14px;">Ver todas as assinaturas</a>
            ${
              input.cancelUrl
                ? `<a href="${escapeHtml(input.cancelUrl)}" style="display:inline-block;color:#8888a0;text-decoration:underline;padding:12px 16px;font-size:14px;">${escapeHtml(input.cancelLabel || 'Gerenciar assinatura')}</a>`
                : ''
            }
          </div>
        </td></tr>
        <tr><td style="padding:20px 28px;border-top:1px solid #2a2a3a;color:#8888a0;font-size:12px;text-align:center;">
          Você recebe este e-mail porque ativou alertas no SubGenie.
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
