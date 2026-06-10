'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import type { DecorationKey, GardenCell } from '@/lib/types';
import { loadData, saveData } from '@/lib/storage';

const GRID = 16;

const DECORATION_EMOJI: Record<DecorationKey, string> = {
  cactus: '🌵',
  rock: '🪨',
  flower: '🌸',
  bench: '🪑',
};

const AVATAR_EMOJI: Record<string, string> = {
  forest: '🌲',
  night: '🌙',
  sunny: '☀️',
  lake: '💧',
};

function isWater(x: number, y: number) {
  return y === 0 || y === GRID - 1 || x === 0 || x === GRID - 1;
}

/** Tries sprite PNG, falls back to emoji on load error */
function CellDecoration({ decoration }: { decoration: DecorationKey }) {
  const [failed, setFailed] = useState(false);
  if (failed) {
    return <span className="text-base leading-none select-none">{DECORATION_EMOJI[decoration]}</span>;
  }
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={`/sprites/${decoration}.png`}
      alt={decoration}
      width={28}
      height={28}
      className="w-7 h-7 object-contain"
      onError={() => setFailed(true)}
    />
  );
}

function GardenContent() {
  const router = useRouter();
  const params = useSearchParams();

  const [garden, setGarden] = useState<GardenCell[]>([]);
  const [nickname, setNickname] = useState('');
  const [avatarId, setAvatarId] = useState('');
  const [pending, setPending] = useState<DecorationKey | null>(null);
  const [pendingTaskId, setPendingTaskId] = useState<string | null>(null);
  const [flash, setFlash] = useState('');

  useEffect(() => {
    const data = loadData();
    if (!data.user) { router.replace('/'); return; }
    setNickname(data.user.nickname);
    setAvatarId(data.user.avatarId);
    setGarden(data.garden);

    const taskId = params.get('taskId');
    if (taskId) {
      setPendingTaskId(taskId);
      // pre-select the task's suggested decoration, but user can change it
      const dec = params.get('decoration') as DecorationKey | null;
      if (dec && Object.keys(DECORATION_EMOJI).includes(dec)) setPending(dec);
    }
  }, [router, params]);

  function handleCell(x: number, y: number) {
    if (isWater(x, y)) return;
    if (!pending || !pendingTaskId) return; // planting requires a completed task

    const data = loadData();
    if (data.garden.find(c => c.x === x && c.y === y)) return;

    data.garden.push({ x, y, decoration: pending });

    if (pendingTaskId) {
      const task = data.tasks.find(t => t.id === pendingTaskId);
      if (task) task.planted = true;
    }

    saveData(data);
    setGarden([...data.garden]);

    const placed = pending;
    setPending(null);
    setPendingTaskId(null);
    router.replace('/garden');

    setFlash(`${DECORATION_EMOJI[placed]} Planted!`);
    setTimeout(() => setFlash(''), 2200);
  }

  function getDecoration(x: number, y: number): DecorationKey | null {
    return garden.find(c => c.x === x && c.y === y)?.decoration ?? null;
  }

  const plantedCount = garden.length;

  return (
    <main className="min-h-screen p-4 pb-12">
      {/* Header */}
      <div className="max-w-[664px] mx-auto flex items-center justify-between mt-2 mb-4">
        <button
          onClick={() => router.push('/tasks')}
          className="font-pixel text-xs text-gray-400 hover:text-gray-600 transition-colors"
        >
          ← Tasks
        </button>
        <h1 className="font-pixel text-green-700 text-sm">My Garden</h1>
        <div className="flex items-center gap-2 bg-white rounded-full px-3 py-1.5 shadow border border-green-200">
          <span className="text-base">{AVATAR_EMOJI[avatarId]}</span>
          <span className="text-xs text-gray-600">{nickname}</span>
        </div>
      </div>

      {/* Decoration palette */}
      <div className="max-w-[664px] mx-auto mb-4">
        {pendingTaskId ? (
          <>
            <p className="font-pixel text-xs text-green-600 mb-3 text-center">
              ✓ Task done! Choose what to plant:
            </p>
            <div className="flex justify-center gap-3">
              {(Object.entries(DECORATION_EMOJI) as [DecorationKey, string][]).map(([key, emoji]) => (
                <button
                  key={key}
                  onClick={() => setPending(prev => prev === key ? null : key)}
                  className={[
                    'flex flex-col items-center justify-center w-16 h-16 rounded-xl border-2 transition-all',
                    pending === key
                      ? 'border-amber-400 bg-amber-50 scale-110 shadow-md'
                      : 'border-gray-200 bg-white hover:border-amber-300 hover:scale-105',
                  ].join(' ')}
                >
                  <span className="text-2xl">{emoji}</span>
                  <span className="text-xs text-gray-400 mt-0.5 capitalize">{key}</span>
                </button>
              ))}
            </div>
            <p className="font-pixel text-xs text-center mt-3">
              {pending
                ? <span className="text-amber-600">{DECORATION_EMOJI[pending]} selected — click a grass tile!</span>
                : <span className="text-gray-400">↑ Pick one above, then click a grass tile</span>
              }
            </p>
          </>
        ) : (
          <>
            <p className="font-pixel text-xs text-gray-400 mb-3 text-center">Decorations</p>
            <div className="flex justify-center gap-3">
              {(Object.entries(DECORATION_EMOJI) as [DecorationKey, string][]).map(([key, emoji]) => (
                <div
                  key={key}
                  className="flex flex-col items-center justify-center w-16 h-16 rounded-xl border-2 border-gray-100 bg-gray-50 opacity-40 cursor-not-allowed"
                >
                  <span className="text-2xl">{emoji}</span>
                  <span className="text-xs text-gray-400 mt-0.5 capitalize">{key}</span>
                </div>
              ))}
            </div>
            <p className="font-pixel text-xs text-gray-400 text-center mt-3">
              Complete a task and tap &quot;Plant it!&quot; to unlock 🔒
            </p>
          </>
        )}
      </div>

      {/* Flash message */}
      {flash && (
        <div className="text-center mb-3">
          <div className="inline-block bg-green-100 border-2 border-green-400 rounded-xl px-5 py-2 font-pixel text-xs text-green-700 animate-bounce">
            {flash}
          </div>
        </div>
      )}

      {/* Grid */}
      <div className="overflow-x-auto">
        <div
          className="mx-auto border-4 border-blue-400 rounded-lg overflow-hidden shadow-lg"
          style={{ width: GRID * 40 }}
        >
          {Array.from({ length: GRID }, (_, y) => (
            <div key={y} className="flex">
              {Array.from({ length: GRID }, (_, x) => {
                const water = isWater(x, y);
                const dec = getDecoration(x, y);
                const canPlace = !water && !!pending && !dec;

                return (
                  <div
                    key={x}
                    onClick={() => handleCell(x, y)}
                    style={{ width: 40, height: 40 }}
                    className={[
                      'flex items-center justify-center border select-none transition-colors',
                      water
                        ? 'bg-blue-300 border-blue-400 cursor-default'
                        : dec
                        ? 'bg-green-300 border-green-400 cursor-default'
                        : canPlace
                        ? 'bg-green-300 border-green-400 cursor-pointer hover:bg-lime-200 active:bg-lime-300'
                        : 'bg-green-300 border-green-400 cursor-default',
                    ].join(' ')}
                  >
                    {water ? (
                      <span className="text-blue-500 text-xs font-bold opacity-50 select-none">~</span>
                    ) : dec ? (
                      <CellDecoration decoration={dec} />
                    ) : null}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="max-w-[664px] mx-auto mt-4 text-center">
        <span className="font-pixel text-xs text-gray-400">{plantedCount} planted</span>
      </div>
    </main>
  );
}

export default function GardenPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-screen">
          <span className="font-pixel text-green-700 text-xs">Loading garden…</span>
        </div>
      }
    >
      <GardenContent />
    </Suspense>
  );
}
