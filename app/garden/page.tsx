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

    const dec = params.get('decoration') as DecorationKey | null;
    const taskId = params.get('taskId');
    if (dec && Object.keys(DECORATION_EMOJI).includes(dec)) {
      setPending(dec);
      setPendingTaskId(taskId);
    }
  }, [router, params]);

  function handleCell(x: number, y: number) {
    if (isWater(x, y)) return;
    if (!pending) return;

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

      {/* Placement hint */}
      {pending && (
        <div className="text-center mb-3">
          <div className="inline-flex items-center gap-2 bg-amber-100 border-2 border-amber-400 rounded-xl px-4 py-2">
            <span className="text-xl">{DECORATION_EMOJI[pending]}</span>
            <span className="font-pixel text-xs text-amber-700">Click a grass tile to plant!</span>
          </div>
        </div>
      )}

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

      {/* Footer info */}
      <div className="max-w-[664px] mx-auto mt-4 flex items-center justify-between text-xs text-gray-400">
        <div className="flex gap-4">
          {(Object.entries(DECORATION_EMOJI) as [DecorationKey, string][]).map(([k, e]) => (
            <span key={k}>{e} <span className="capitalize">{k}</span></span>
          ))}
        </div>
        <span className="font-pixel">{plantedCount} planted</span>
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
