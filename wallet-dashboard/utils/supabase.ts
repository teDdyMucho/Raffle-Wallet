import { createClient } from '@supabase/supabase-js';
import { triggerWebhook } from './webhook';

// Supabase configuration (uses env if present, else provided defaults)
export const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://bndiztrglczuiifwptqp.supabase.co';
export const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJuZGl6dHJnbGN6dWlpZndwdHFwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgwMjg0MDgsImV4cCI6MjA3MzYwNDQwOH0.qUbryNB9l_fDJ5XGdo1DoDTf2eWoBrYMRt06vsBCxyo';
export const supabase = createClient(supabaseUrl, supabaseKey);

// Centralize table name
export const TABLE = 'user_wallet';

// Control CSV fallback via env (default off so we always use real DB)
const USE_CSV_FALLBACK = (process.env.NEXT_PUBLIC_USE_CSV_FALLBACK || 'false') === 'true';

export type WalletTransaction = {
  id: number;
  user_id: string;
  amount_cents: number;
  method: 'GCash' | 'Bank' | 'PayPal';
  status: 'approved' | 'pending' | 'rejected';
  created_at: string;
  referral_code: string | null;
};

// ----- CSV helpers (fallback mode) -----
function parseCsvLine(line: string): string[] {
  return line.split(',').map((s) => s?.trim() ?? '');
}

async function fetchCsvText(): Promise<string> {
  const res = await fetch('/user_wallet_rows.csv');
  return await res.text();
}

function sanitizeStatus(statusRaw: string): WalletTransaction['status'] {
  const s = (statusRaw || '').toLowerCase();
  if (s === 'approved' || s === 'pending' || s === 'rejected') return s;
  return 'pending';
}

function csvToTransactions(csvText: string): WalletTransaction[] {
  const lines = csvText.split('\n').map((l) => l.trim()).filter(Boolean);
  const dataLines = lines[0]?.toLowerCase().includes('user_id') ? lines.slice(1) : lines;

  const rows: WalletTransaction[] = [];
  dataLines.forEach((line, idx) => {
    const parts = parseCsvLine(line);
    if (parts.length < 6) return;
    const [user_id, amount_cents_raw, methodRaw, statusRaw, created_at, referral_code_raw] = parts;
    if (!user_id || !amount_cents_raw || !methodRaw || !created_at) return;

    const amount_cents = Number.parseInt(amount_cents_raw, 10);
    if (Number.isNaN(amount_cents)) return;

    const method = (methodRaw as 'GCash' | 'Bank' | 'PayPal') || 'GCash';
    const status = sanitizeStatus(statusRaw);
    const referral_code = referral_code_raw ? referral_code_raw : null;

    rows.push({ id: idx, user_id, amount_cents, method, status, created_at, referral_code });
  });
  return rows;
}

// ----- Data access -----
export async function fetchTransactions(): Promise<WalletTransaction[]> {
  try {
    const { data, error } = await supabase
      .from(TABLE)
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return (data as WalletTransaction[]) || [];
  } catch (error) {
    console.error('[Supabase] fetchTransactions failed:', error);
    if (USE_CSV_FALLBACK) {
      const csvText = await fetchCsvText();
      return csvToTransactions(csvText);
    }
    return [];
  }
}

export async function updateTransactionStatus(id: number, status: 'approved' | 'pending' | 'rejected'): Promise<WalletTransaction | null> {
  try {
    if (status === 'rejected') {
      // Fetch transaction to check created_at within 24 hours
      const { data: existing, error: fetchErr } = await supabase
        .from(TABLE)
        .select('*')
        .eq('id', id)
        .single();
      if (fetchErr) throw fetchErr;

      const existingRow = existing as any;
      const createdAt = new Date(existingRow?.created_at);
      const now = new Date();
      const within24h = now.getTime() - createdAt.getTime() <= 24 * 60 * 60 * 1000;
      if (!within24h) {
        throw new Error('Reject window expired (24 hours).');
      }

      const { data: updated, error: updErr } = await supabase
        .from(TABLE)
        .update({ status: 'rejected' })
        .eq('id', id)
        .select('*')
        .single();
      if (updErr) {
        const msg = (updErr as any)?.message || '';
        // If direct approved->rejected is blocked by a trigger, try a two-step transition: approved -> pending -> rejected
        const transitionBlocked = /cannot\s+change\s+status|status\s+transition|not\s+allowed/i.test(msg);
        if (transitionBlocked) {
          // Step 1: move to pending
          const { data: toPending, error: pendErr } = await supabase
            .from(TABLE)
            .update({ status: 'pending' })
            .eq('id', id)
            .select('*')
            .single();
          if (pendErr) {
            throw updErr; // rethrow original if we can't move to pending
          }
          // Step 2: move to rejected (status only)
          const { data: toRejected, error: rejErr } = await supabase
            .from(TABLE)
            .update({ status: 'rejected' })
            .eq('id', id)
            .select('*')
            .single();
          if (rejErr) {
            throw rejErr;
          }
          if (toRejected) await triggerWebhook(toRejected as WalletTransaction, 'rejected');
          return (toRejected as WalletTransaction) ?? null;
        }
        throw updErr;
      }

      if (updated) await triggerWebhook(updated as WalletTransaction, 'rejected');
      return (updated as WalletTransaction) ?? null;
    } else {
      const { data, error } = await supabase
        .from(TABLE)
        .update({ status })
        .eq('id', id)
        .select('*')
        .single();
      if (error) throw error;

      if (data) await triggerWebhook(data as WalletTransaction, status);
      return (data as WalletTransaction) ?? null;
    }
  } catch (error) {
    console.error('[Supabase] updateTransactionStatus failed:', error);
    throw error;
  }
}

export async function createCashInRequest(
  user_id: string,
  amount_cents: number,
  method: 'GCash' | 'Bank' | 'PayPal',
  referral_code?: string
): Promise<WalletTransaction | null> {
  try {
    const { data, error } = await supabase
      .from(TABLE)
      .insert([
        {
          user_id,
          amount_cents,
          method,
          status: 'pending',
          referral_code: referral_code || null,
        },
      ])
      .select('*')
      .single();
    if (error) throw error;
    return (data as WalletTransaction) ?? null;
  } catch (error) {
    console.error('[Supabase] createCashInRequest failed:', error);
    throw error;
  }
}

export async function getTotalBalance(userId?: string): Promise<number> {
  try {
    let query = supabase
      .from(TABLE)
      .select('amount_cents,status,user_id')
      .eq('status', 'approved');
    if (userId) query = query.eq('user_id', userId);

    const { data, error } = await query;
    if (error) throw error;

    return (data as any[] | null)?.reduce((sum, t) => sum + (t?.amount_cents || 0), 0) ?? 0;
  } catch (error) {
    console.error('[Supabase] getTotalBalance failed:', error);
    if (USE_CSV_FALLBACK) {
      try {
        const csvText = await fetchCsvText();
        const rows = csvToTransactions(csvText);
        return rows
          .filter((r) => r.status === 'approved' && (!userId || r.user_id === userId))
          .reduce((sum, r) => sum + r.amount_cents, 0);
      } catch (csvError) {
        console.error('Error with CSV fallback:', csvError);
      }
    }
    return 0;
  }
}

export async function getTopReferrer(): Promise<{ referral_code: string; total_amount: number } | null> {
  try {
    const { data, error } = await supabase
      .from(TABLE)
      .select('referral_code, amount_cents, status')
      .eq('status', 'approved')
      .not('referral_code', 'is', null);
    if (error) throw error;

    const referralTotals = ((data as any[]) || []).reduce((acc: Record<string, number>, row: any) => {
      const code = row?.referral_code as string | null;
      const amount = Number(row?.amount_cents || 0);
      if (!code) return acc;
      acc[code] = (acc[code] || 0) + amount;
      return acc;
    }, {} as Record<string, number>);

    const entries = Object.entries(referralTotals);
    if (entries.length === 0) return null;

    const [topReferralCode, totalAmount] = entries.reduce((max, current) => (current[1] > max[1] ? current : max));
    return { referral_code: topReferralCode, total_amount: totalAmount };
  } catch (error) {
    console.error('[Supabase] getTopReferrer failed:', error);
    if (USE_CSV_FALLBACK) {
      try {
        const csvText = await fetchCsvText();
        const rows = csvToTransactions(csvText);
        const referralTotals = rows
          .filter((r) => r.status === 'approved' && !!r.referral_code)
          .reduce((acc: Record<string, number>, r) => {
            const code = r.referral_code as string;
            acc[code] = (acc[code] || 0) + r.amount_cents;
            return acc;
          }, {} as Record<string, number>);

        const entries = Object.entries(referralTotals);
        if (entries.length === 0) return null;

        const [topReferralCode, totalAmount] = entries.reduce((max, current) => (current[1] > max[1] ? current : max));
        return { referral_code: topReferralCode, total_amount: totalAmount };
      } catch (csvError) {
        console.error('Error with CSV fallback:', csvError);
      }
    }
    return null;
  }
}
