import type { AppData, DecorationKey, Task } from './types';

const STORAGE_KEY = 'pixel-garden-v1';
const DECORATION_CYCLE: DecorationKey[] = ['cactus', 'rock', 'sunflower', 'bush', 'mushroom', 'fence'];

const EMPTY: AppData = { user: null, tasks: [], garden: [] };

export function loadData(): AppData {
  if (typeof window === 'undefined') return { ...EMPTY };
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { user: null, tasks: [], garden: [] };
    return JSON.parse(raw) as AppData;
  } catch {
    return { user: null, tasks: [], garden: [] };
  }
}

export function saveData(data: AppData): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export function clearData(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(STORAGE_KEY);
}

export function getNextDecoration(tasks: Task[]): DecorationKey {
  return DECORATION_CYCLE[tasks.length % DECORATION_CYCLE.length];
}
