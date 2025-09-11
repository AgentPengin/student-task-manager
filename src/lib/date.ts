import { format, isToday, isPast, parseISO, startOfDay } from 'date-fns';

export const fmtDate = (iso?: string) => (iso ? format(parseISO(iso), 'EEE, MMM d') : '');
export const fmtTime = (iso?: string) => (iso ? format(parseISO(iso), 'HH:mm') : '');
export const isOverdue = (iso?: string) => (iso ? isPast(parseISO(iso)) && !isToday(parseISO(iso)) : false);
export const isDueToday = (iso?: string) => (iso ? isToday(parseISO(iso)) : false);
export const dayKey = (iso: string) => format(startOfDay(parseISO(iso)), 'yyyy-MM-dd');

