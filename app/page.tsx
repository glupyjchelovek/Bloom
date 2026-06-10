'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import type { AvatarId } from '@/lib/types';
import { loadData, saveData } from '@/lib/storage';

const AVATARS: { id: AvatarId; emoji: string; label: string }[] = [
  { id: 'forest', emoji: '🌲', label: 'Forest' },
  { id: 'night', emoji: '🌙', label: 'Night' },
  { id: 'sunny', emoji: '☀️', label: 'Sunny' },
  { id: 'lake', emoji: '💧', label: 'Lake' },
];

export default function LoginPage() {
  const router = useRouter();
  const [nickname, setNickname] = useState('');
  const [selected, setSelected] = useState<AvatarId | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const data = loadData();
    if (data.user) router.replace('/tasks');
  }, [router]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!nickname.trim()) { setError('Please enter a nickname!'); return; }
    if (!selected) { setError('Please pick an avatar!'); return; }

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
              Pick Your Vibe
            </label>
            <div className="grid grid-cols-4 gap-2">
              {AVATARS.map(av => (
                <button
                  key={av.id}
                  type="button"
                  onClick={() => { setSelected(av.id); setError(''); }}
                  className={`flex flex-col items-center justify-center py-3 rounded-xl border-2 transition-all ${
                    selected === av.id
                      ? 'border-green-500 bg-green-50 scale-105 shadow-sm'
                      : 'border-gray-200 hover:border-green-300'
                  }`}
                >
                  <span className="text-2xl">{av.emoji}</span>
                  <span className="text-xs text-gray-400 mt-1">{av.label}</span>
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
