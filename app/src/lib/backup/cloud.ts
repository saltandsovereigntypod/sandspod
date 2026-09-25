// Account backups read and restore through the signed-in Supabase client, so
// row-level security keeps every query to the person's own rows, exactly as
// the website's SanctuaryBackup.collectCloud / buildCloudMergePlan do.

import { supabase } from '../supabase';
import { CLOUD_SECTIONS, PAGE_SIZE, sanitize, type CloudRestoreDb, type Row } from './format';

async function fetchAllOwned(table: string, userId: string): Promise<Row[]> {
  const rows: Row[] = [];
  for (let from = 0; ; from += PAGE_SIZE) {
    const { data, error } = await supabase
      .from(table)
      .select('*')
      .eq('user_id', userId)
      .range(from, from + PAGE_SIZE - 1);
    if (error) throw error;
    rows.push(...((data ?? []) as Row[]));
    if (!data || data.length < PAGE_SIZE) return rows.map((row) => sanitize(row) as Row);
  }
}

export type CloudCollection = {
  data: Record<string, Record<string, Row[]>>;
  failures: { section: string; table: string; message: string }[];
  complete: boolean;
};

export async function collectCloud(
  userId: string,
  options: { onProgress?: (message: string) => void; currentUserId?: () => string | null } = {},
): Promise<CloudCollection> {
  const data: CloudCollection['data'] = {};
  const failures: CloudCollection['failures'] = [];
  for (const [section, tables] of Object.entries(CLOUD_SECTIONS)) {
    data[section] = {};
    options.onProgress?.(`Gathering ${section}…`);
    for (const table of tables) {
      try {
        if (options.currentUserId && options.currentUserId() !== userId)
          throw new Error('The signed-in user changed during export.');
        if (table === 'community_submission_messages') {
          const ids = (data.community?.community_submissions ?? []).map((row) => row.id as string).filter(Boolean);
          const messages: Row[] = [];
          for (let index = 0; index < ids.length; index += 100) {
            const { data: rows, error } = await supabase
              .from(table)
              .select('*')
              .in('submission_id', ids.slice(index, index + 100));
            if (error) throw error;
            messages.push(...((rows ?? []) as Row[]).map((row) => sanitize(row) as Row));
          }
          data[section][table] = messages;
        } else data[section][table] = await fetchAllOwned(table, userId);
      } catch (error) {
        failures.push({ section, table, message: 'This section could not be collected.' });
        console.warn(`Backup collection failed for ${table}`, error instanceof Error ? error.message : 'unknown');
      }
    }
  }
  return { data, failures, complete: failures.length === 0 };
}

export const cloudRestoreDb: CloudRestoreDb = {
  async existingIds(table, userId, ids) {
    const { data, error } = await supabase.from(table).select('id').eq('user_id', userId).in('id', ids);
    if (error) throw error;
    return ((data ?? []) as { id: unknown }[]).map((row) => String(row.id));
  },
  async hasSettingsRow(userId) {
    const { data, error } = await supabase.from('user_settings').select('user_id').eq('user_id', userId).maybeSingle();
    if (error) throw error;
    return !!data;
  },
  async insert(table, rows) {
    const { error } = await supabase.from(table).insert(rows);
    return { error };
  },
};
