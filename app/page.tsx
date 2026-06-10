'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import type { AvatarId } from '@/lib/types';
import { loadData, saveData } from '@/lib/storage';

const VALID_AVATARS: AvatarId[] = ['character', 'cow', 'chicken'];

const AVATARS: { id: AvatarId; label: string; hint: string }[] = [
  { id: 'character', label: 'Farmer', hint: 'hard worker' },
  { id: 'cow', label: 'Cow', hint: 'gentle giant' },
  { id: 'chicken', label: 'Chicken', hint: 'early bird' },
];

export default function LoginPage() {
  const router = useRouter();
  const [nickname, setNickname] = useState('');
  const [selected, setSelected] = useState<AvatarId | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const data = loadData();
    if (data.user && VALID_AVATARS.includes(data.user.avatarId)) {
      router.replace('/tasks');
    }
  }, [router]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!nickname.trim()) { setError('Please enter a nickname!'); return; }
    if (!selected) { setError('Pick your character!'); return; }

    const data = loadData();
    data.user = { nickname: nickname.trim(), avatarId: selected };
    saveData(data);
    router.push('/tasks');
  }

  return (
    <main className="min-h-screen flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-sm border-4 border-green-400">
        <h1 className="font-pixel text-green-700 text-center text-base mb-2 leading-loose">
          Pixel Garden
        </h1>
        <p className="text-center text-gray-400 text-sm mb-8">
          Complete tasks · grow your garden 🌱
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block font-pixel text-xs text-gray-500 mb-2">
              Nickname
            </label>
            <input
              type="text"
              value={nickname}
              onChange={e => { setNickname(e.target.value); setError(''); }}
              placeholder="e.g. masha"
              maxLength={20}
              className="w-full border-2 border-green-300 rounded-xl px-4 py-3 text-gray-800 focus:outline-none focus:border-green-500 placeholder:text-gray-300"
            />
          </div>

          <div>
            <label className="block font-pixel text-xs text-gray-500 mb-3">
              Pick Your Character
            </label>
            <div className="grid grid-cols-3 gap-3">
              {AVATARS.map(av => (
                <button
                  key={av.id}
                  type="button"
                  onClick={() => { setSelected(av.id); setError(''); }}
                  className={[
                    'flex flex-col items-center justify-center py-4 rounded-xl border-2 transition-all gap-2',
                    selected === av.id
                      ? 'border-green-500 bg-green-50 scale-105 shadow-md'
                      : 'border-gray-200 hover:border-green-300',
                  ].join(' ')}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={`/sprites/avatar-${av.id}.png`}
                    alt={av.label}
                    width={48}
                    height={48}
                    style={{ imageRendering: 'pixelated', width: 48, height: 48 }}
                  />
                  <span className="font-pixel text-xs text-gray-600">{av.label}</span>
                  <span className="text-xs text-gray-400 italic">{av.hint}</span>
                </button>
              ))}
            </div>
          </div>

          {error && (
            <p className="font-pixel text-red-400 text-xs text-center">{error}</p>
          )}

          <button
            type="submit"
            className="w-full font-pixel text-xs bg-green-500 hover:bg-green-600 active:bg-green-700 text-white py-3 rounded-xl transition-colors"
          >
            Start Gardening →
          </button>
        </form>
      </div>
    </main>
  );
}
