import { create } from 'zustand';

// 定义 Item 类型
export interface Item {
  id: number;
  text: string;
}

// 定义 Store 状态类型
export interface ListState {
  items: Record<number, Item>;
  itemCount: number;
  loading: boolean;
  loadData: () => Promise<void>;
  updateItem: (index: number, newValue: string) => void;
  getItem: (index: number) => Item | undefined;
  getItemCount: () => number;
}

const useListStore = create<ListState>((set, get) => ({
  items: {}, // 改为对象存储，key为index
  itemCount: 0,
  loading: false,
  
  loadData: async () => {
    set({ loading: true });
    try {
      const response = await fetch('/api/data');
      const result = await response.json();
      if (result.success) {
        const items: Record<number, Item> = {};
        result.data.forEach((item: any, index: number) => {
          items[index] = {
            id: index + 1,
            text: `Item ${index + 1} - ${item.name || '可编辑文本'}`
          };
        });
        set({ items, itemCount: result.data.length, loading: false });
      }
    } catch (err) {
      console.error('Failed to fetch data:', err);
      set({ loading: false });
    }
  },
  
  updateItem: (index, newValue) => set((state) => ({
    items: {
      ...state.items,
      [index]: { ...state.items[index], text: newValue }
    }
  })),
  
  // selector helpers
  getItem: (index) => get().items[index],
  getItemCount: () => get().itemCount
}));

// 单个item的selector hook - 这是唯一需要的selector，确保只有对应item变化时才重渲染
export const useItem = (index: number): Item | undefined => useListStore((state) => state.items[index]);

// 其他selector hooks
export const useItemCount = (): number => useListStore((state) => state.itemCount);
export const useLoading = (): boolean => useListStore((state) => state.loading);

export default useListStore;