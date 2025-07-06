import { create } from 'zustand'

interface GlobalState {
  image: HTMLImageElement | null;
  setImage: (img: HTMLImageElement | null) => void;
  selectedTool: string;
  setSelectedTool: (tool: string) => void;
}

export const useGlobalStore = create<GlobalState>((set) => ({
  image: null,
  setImage: (img) => set({ image: img }),
  selectedTool: 'basic',
  setSelectedTool: (tool) => set({ selectedTool: tool }),
})); 