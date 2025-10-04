import React, { useEffect, useState, useRef } from 'react';
import { createRoot } from 'react-dom/client';
import '../../../style.css';
import { Button } from "@/components/button"
import { ThemeProvider } from "@/components/theme-provider"
import { useTheme } from "next-themes"
import List from "@/components/vList"
import EditableRow from "@/components/EditableRow"
import useListStore from '../../store/listStore';

// 使用新的可编辑Row组件

function App() {
  const { data, loading, loadData, updateItem } = useListStore();
  const { setTheme } = useTheme();

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleItemChange = (index, newValue) => {
    updateItem(index, newValue);
  };

  return (
    <div style={{ padding: '20px' }}>      
      <div style={{ marginBottom: '20px', display: 'flex', gap: '10px' }}>
        <Button onClick={() => setTheme("light")}>Light</Button>
        <Button onClick={() => setTheme("dark")}>Dark</Button>
        <Button onClick={loadData} disabled={loading}>
          {loading ? 'Loading...' : '重新加载数据'}
        </Button>
      </div>

        <div>
          <h2>虚拟列表 Demo</h2>
          <p>总共 {data.length} 条数据，只渲染可见区域的项目</p>
          
          <div style={{ marginTop: '20px' }}>
            <List
              height={400}
              width={600}
              data={data}
              itemSize={35}
              onItemChange={handleItemChange}
            >
              {EditableRow}
            </List>
          </div>
        </div>
      
    </div>
  );
}

const container = document.getElementById('root');
if (container) {
  const root = createRoot(container);
  root.render(
    <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
    >
      <App />
    </ThemeProvider>
  );
}