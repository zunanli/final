import React, { useEffect, useState, useRef } from 'react';
import { createRoot } from 'react-dom/client';
import '../../../style.css';
import { Button } from "@/components/button"
import { ThemeProvider } from "@/components/theme-provider"
import { useTheme } from "next-themes"
import List from "@/components/vList"
import EditableRow from "@/components/EditableRow"
import useListStore from '../../store/listStore.ts';
import '../../lib/performance.js'; // 🚀 一行代码启用性能监控
import { ProfilerWrapper } from '../../lib/profiler'; // 🔍 React Profiler 监控

// 使用新的可编辑Row组件

function App() {
  const { itemCount, loading, loadData } = useListStore();
  const { setTheme } = useTheme();

  useEffect(() => {
    loadData();
  }, [loadData]);

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
          <p>总共 {itemCount} 条数据，只渲染可见区域的项目</p>
          
          <div style={{ marginTop: '20px' }}>
            <List
              height={400}
              width={600}
              itemCount={itemCount}
              itemSize={35}
            >
              {Array.from({ length: itemCount }, (_, index) => (
                <EditableRow key={index} index={index} />
              ))}
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
      <ProfilerWrapper id="myqpp">
        <App />
      </ProfilerWrapper>
    </ThemeProvider>
  );
}