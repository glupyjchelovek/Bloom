'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import type { Task, DecorationKey } from '@/lib/types';
import { loadData, saveData, getNextDecoration } from '@/lib/storage';

const DECORATION_EMOJI: Record<DecorationKey, string> = {
  cactus: '🌵',
  rock: '🪨',
  sunflower: '🌻',
  bush: '🌿',
  mushroom: '🍄',
  fence: '🪵',
};

const AVATAR_EMOJI: Record<string, string> = {
  forest: '🌲',
  night: '🌙',
  sunny: '☀️',
  lake: '💧',
};

export default function TasksPage() {
  const router = useRouter();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [nickname, setNickname] = useState('');
  const [avatarId, setAvatarId] = useState('');
  const [newTitle, setNewTitle] = useState('');

  useEffect(() => {
    const data = loadData();
    if (!data.user) { router.replace('/'); return; }
    setNickname(data.user.nickname);
    setAvatarId(data.user.avatarId);
    setTasks(data.tasks);
  }, [router]);

  function addTask(e: React.FormEvent) {
    e.preventDefault();
    if (!newTitle.trim()) return;
    const data = loadData();
    const task: Task = {
      id: Date.now().toString(),
      title: newTitle.trim(),
      done: false,
      reward: getNextDecoration(data.tasks),
      planted: false,
    };
    data.tasks.push(task);
    saveData(data);
    setTasks([...data.tasks]);
    setNewTitle('');
  }

  function toggleDone(id: string) {
    const data = loadData();
    const task = data.tasks.find(t => t.id === id);
    if (!task) return;
    task.done = !task.done;
    saveData(data);
    setTasks([...data.tasks]);
  }

  function plantIt(task: Task) {
    router.push(`/garden?decoration=${task.reward}&taskId=${task.id}`);
  }

  const doneCount = tasks.filter(t => t.done).length;
  const plantedCount = tasks.filter(t => t.planted).length;

  return (
    <main className="min-h-screen p-4 pb-12 max-w-xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mt-4 mb-6">
        <h1 className="font-pixel text-green-700 text-base">Tasks</h1>
        <div className="flex items-center gap-2 bg-white rounded-full px-4 py-2 shadow border border-green-200">
          <span className="text-lg">{AVATAR_EMOJI[avatarId]}</span>
          <span className="text-sm text-gray-600 font-medium">{nickname}</span>
        </div>
      </div>

      {/* Stats */}
      {tasks.length > 0 && (
        <div className="flex gap-3 mb-5">
          <div className="flex-1 bg-white rounded-xl border border-gray-100 shadow-sm p-3 text-center">
            <div className="font-pixel text-lg text-green-600">{doneCount}</div>
            <div className="text-xs text-gray-400 mt-1">done</div>
          </div>
          <div className="flex-1 bg-white rounded-xl border border-gray-100 shadow-sm p-3 text-center">
            <div className="font-pixel text-lg text-amber-500">{plantedCount}</div>
            <div className="text-xs text-gray-400 mt-1">planted</div>
          </div>
          <div className="flex-1 bg-white rounded-xl border border-gray-100 shadow-sm p-3 text-center">
            <div className="font-pixel text-lg text-blue-400">{tasks.length}</div>
            <div className="text-xs text-gray-400 mt-1">total</div>
          </div>
        </div>
      )}

      {/* Add task */}
      <form onSubmit={addTask} className="flex gap-2 mb-6">
        <input
          type="text"
          value={newTitle}
          onChange={e => setNewTitle(e.target.value)}
          placeholder="Add a new task..."
          className="flex-1 border-2 border-green-300 rounded-xl px-4 py-3 focus:outline-none focus:border-green-500 placeholder:text-gray-300 text-gray-800"
        />
        <button
          type="submit"
          className="font-pixel text-lg bg-green-500 hover:bg-green-600 active:bg-green-700 text-white w-12 rounded-xl transition-colors flex items-center justify-center"
        >
          +
        </button>
      </form>

      {/* Task list */}
      <div className="space-y-3">
        {tasks.length === 0 && (
          <div className="text-center py-16 text-gray-300 space-y-2">
            <div className="text-4xl">🌱</div>
            <p className="font-pixel text-xs">No tasks yet!</p>
            <p className="text-sm">Add one above to get started</p>
          </div>
        )}
        {tasks.map(task => (
          <div
            key={task.id}
            className={`bg-white rounded-xl border-2 px-4 py-3 flex items-center gap-3 shadow-sm transition-colors ${
              task.done ? 'border-green-200 bg-green-50' : 'border-gray-100'
            }`}
          >
            {/* Checkbox */}
            <button
              onClick={() => toggleDone(task.id)}
              className={`w-7 h-7 rounded-full border-2 flex-shrink-0 flex items-center justify-center text-sm transition-all ${
                task.done
                  ? 'bg-green-500 border-green-500 text-white'
                  : 'border-gray-300 hover:border-green-400'
              }`}
            >
              {task.done && '✓'}
            </button>

            {/* Title */}
            <span
              className={`flex-1 text-sm leading-snug ${
                task.done ? 'line-through text-gray-400' : 'text-gray-700'
              }`}
            >
              {task.title}
            </span>

            {/* Reward badge */}
            <span className="text-xl flex-shrink-0" title={`Reward: ${task.reward}`}>
              {DECORATION_EMOJI[task.reward]}
            </span>

            {/* Plant it / Planted */}
            {task.done && !task.planted && (
              <button
                onClick={() => plantIt(task)}
                className="font-pixel text-xs bg-amber-400 hover:bg-amber-500 active:bg-amber-600 text-white px-3 py-2 rounded-lg flex-shrink-0 transition-colors"
              >
                Plant it!
              </button>
            )}
            {task.planted && (
              <span className="font-pixel text-xs text-green-500 flex-shrink-0">✓ grown</span>
            )}
          </div>
        ))}
      </div>

      {/* Go to garden */}
      <div className="mt-8 text-center">
        <button
          onClick={() => router.push('/garden')}
          className="font-pixel text-xs bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-xl transition-colors"
        >
          View Garden →
        </button>
      </div>
    </main>
  );
}
