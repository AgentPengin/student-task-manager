// Lightweight quick-add parser: supports patterns like
// "Math HW due tomorrow 17:00 ~90m #math #hw"
// "Finish report due 2025-09-20 23:59 ~2h"
// Returns {title, dueAt, estimatedMinutes, tags}

const RELATIVE_DAYS: Record<string, number> = {
  today: 0,
  tomorrow: 1,
};

function toISODate(date: Date) {
  return date.toISOString();
}

function parseRelativeDay(word: string): Date | null {
  const delta = RELATIVE_DAYS[word.toLowerCase()];
  if (delta === undefined) return null;
  const d = new Date();
  d.setDate(d.getDate() + delta);
  return d;
}

function parseTime(word: string) {
  // HH:mm or H:mm
  const m = word.match(/^([01]?\d|2[0-3]):([0-5]\d)$/);
  if (!m) return null;
  const h = parseInt(m[1], 10);
  const min = parseInt(m[2], 10);
  return { h, min };
}

function parseDate(word: string) {
  // yyyy-mm-dd
  const m = word.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!m) return null;
  const y = parseInt(m[1], 10);
  const mo = parseInt(m[2], 10) - 1;
  const d = parseInt(m[3], 10);
  const date = new Date(y, mo, d);
  return date;
}

function parseEstimate(word: string) {
  // ~90m or ~2h or 1h30m
  const clean = word.replace(/^~/, '');
  const m1 = clean.match(/^(\d+)m$/i);
  if (m1) return parseInt(m1[1], 10);
  const m2 = clean.match(/^(\d+)h$/i);
  if (m2) return parseInt(m2[1], 10) * 60;
  const m3 = clean.match(/^(\d+)h(\d+)m$/i);
  if (m3) return parseInt(m3[1], 10) * 60 + parseInt(m3[2], 10);
  return null;
}

export interface QuickAddResult {
  title: string;
  dueAt?: string;
  estimatedMinutes?: number;
  tags?: string[];
}

export function parseQuickAdd(input: string): QuickAddResult {
  const parts = input.trim().split(/\s+/);
  const tags: string[] = [];
  let date: Date | null = null;
  let time: { h: number; min: number } | null = null;
  let estimatedMinutes: number | undefined;

  const kept: string[] = [];

  for (const part of parts) {
    if (part.startsWith('#')) {
      const tag = part.slice(1);
      if (tag) tags.push(tag);
      continue;
    }
    if (part.toLowerCase() === 'due') continue;

    const rel = parseRelativeDay(part);
    if (rel) {
      date = rel;
      continue;
    }
    const abs = parseDate(part);
    if (abs) {
      date = abs;
      continue;
    }
    const t = parseTime(part);
    if (t) {
      time = t;
      continue;
    }
    const est = parseEstimate(part);
    if (est !== null) {
      estimatedMinutes = est;
      continue;
    }
    kept.push(part);
  }

  if (date && time) {
    date.setHours(time.h, time.min, 0, 0);
  } else if (date && !time) {
    // default to 18:00 if only date provided
    date.setHours(18, 0, 0, 0);
  }

  const title = kept.join(' ').trim();

  return {
    title: title || 'New Task',
    dueAt: date ? toISODate(date) : undefined,
    estimatedMinutes,
    tags: tags.length ? tags : undefined,
  };
}

