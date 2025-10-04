import { create } from 'zustand';

const useListStore = create((set, get) => ({
  items: {}, // 改为对象存储，key为index
  itemCount: 0,
  loading: false,
  
  loadData: async () => {
    set({ loading: true });
    try {
      const response = await fetch('/api/data');
      const result = await response.json();
      if (result.success) {
        const items = {};
        result.data.forEach((item, index) => {
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
export const useItem = (index) => useListStore((state) => state.items[index]);

export default useListStore;