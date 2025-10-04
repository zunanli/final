import { create } from 'zustand';

const useListStore = create((set) => ({
  data: [],
  loading: false,
  
  loadData: async () => {
    set({ loading: true });
    try {
      const response = await fetch('/api/data');
      const result = await response.json();
      if (result.success) {
        const editableData = result.data.map((item, index) => ({
          id: index + 1,
          text: `Item ${index + 1} - ${item.name || '可编辑文本'}`
        }));
        set({ data: editableData, loading: false });
      }
    } catch (err) {
      console.error('Failed to fetch data:', err);
      set({ loading: false });
    }
  },
  
  updateItem: (index, newValue) => set((state) => {
    const newData = [...state.data];
    newData[index] = { ...newData[index], text: newValue };
    return { data: newData };
  })
}));

export default useListStore;