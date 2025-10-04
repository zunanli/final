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

// 单个item的selector hook
export const useItem = (index) => useListStore((state) => state.items[index]);

// 其他selector hooks
export const useItemCount = () => useListStore((state) => state.itemCount);
export const useLoading = () => useListStore((state) => state.loading);
export const useUpdateItem = () => useListStore((state) => state.updateItem);
export const useLoadData = () => useListStore((state) => state.loadData);

export default useListStore;