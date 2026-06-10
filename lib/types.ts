export type AvatarId = 'forest' | 'night' | 'sunny' | 'lake';
export type DecorationKey = 'cactus' | 'rock' | 'sunflower' | 'bush' | 'mushroom' | 'fence';

export interface User {
  nickname: string;
  avatarId: AvatarId;
}

export interface Task {
  id: string;
  title: string;
  done: boolean;
  reward: DecorationKey;
  planted: boolean;
}

export interface GardenCell {
  x: number;
  y: number;
  decoration: DecorationKey;
}

export interface AppData {
  user: User | null;
  tasks: Task[];
  garden: GardenCell[];
}
