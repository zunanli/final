import React, { useEffect, useState, useRef } from 'react';
import { createRoot } from 'react-dom/client';
import '../../../style.css';
import { Button } from "@/components/ui/button"
import { ThemeProvider } from "@/components/theme-provider"
import { useTheme } from "next-themes"

// 简易定高虚拟列表组件
function List({ height, width, itemCount, itemSize, children: Row }) {
  const [scrollTop, setScrollTop] = useState(0);
  const containerRef = useRef(null);

  // 计算可见区域
  const visibleCount = Math.ceil(height / itemSize);
  const startIndex = Math.floor(scrollTop / itemSize);
  const endIndex = Math.min(startIndex + visibleCount + 1, itemCount);

  // 处理滚动事件
  const handleScroll = (e) => {
    setScrollTop(e.target.scrollTop);
  };

  // 生成可见项
  const visibleItems = [];
  for (let i = startIndex; i < endIndex; i++) {
    visibleItems.push(
      <div
        key={i}
        style={{
          position: 'absolute',
          top: i * itemSize,
          left: 0,
          right: 0,
          height: itemSize,
        }}
      >
        <Row index={i} />
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      style={{
        height,
        width,
        overflow: 'auto',
        position: 'relative',
        border: '1px solid #ddd',
        borderRadius: '4px',
      }}
      onScroll={handleScroll}
    >
      <div
        style={{
          height: itemCount * itemSize,
          position: 'relative',
        }}
      >
        {visibleItems}
      </div>
    </div>
  );
}

// 列表项组件
function Row({ index }) {
  return (
    <div
      style={{
        padding: '8px 16px',
        borderBottom: '1px solid #eee',
        display: 'flex',
        alignItems: 'center',
        backgroundColor: index % 2 === 0 ? '#f9f9f9' : '#fff',
      }}
    >
      <span style={{ fontWeight: 'bold', marginRight: '12px' }}>#{index + 1}</span>
      <span>Item {index + 1}</span>
    </div>
  );
}

function App() {
  const [msg, setMsg] = useState('');
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showVirtualList, setShowVirtualList] = useState(false);
  const { setTheme } = useTheme()

  useEffect(() => {
    fetch('/api/hello')
      .then((r) => r.json())
      .then((d) => setMsg(d.message))
      .catch(() => setMsg('api error'));
  }, []);

  const loadData = () => {
    setLoading(true);
    fetch('/api/data')
      .then(res => res.json())
      .then(result => {
        if (result.success) {
          setData(result.data);
          setShowVirtualList(true);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to fetch data:', err);
        setLoading(false);
      });
  };

  return (
    <div style={{ padding: '20px' }}>
      <p>Client script loaded.</p>
      <p>/api/hello: {msg}</p>
      
      <div style={{ marginBottom: '20px' }}>
        <Button>DDDDDDEPLOY</Button>
        <Button onClick={() => setTheme("light")}>Light</Button>
        <Button onClick={() => setTheme("dark")}>Dark</Button>
        <Button onClick={loadData} disabled={loading}>
          {loading ? 'Loading...' : '加载虚拟列表 (5000条数据)'}
        </Button>
      </div>

      {showVirtualList && (
        <div>
          <h2>虚拟列表 Demo</h2>
          <p>总共 {data.length} 条数据，只渲染可见区域的项目</p>
          
          <div style={{ marginTop: '20px' }}>
            <List
              height={400}
              width={600}
              itemCount={data.length}
              itemSize={35}
            >
              {Row}
            </List>
          </div>
        </div>
      )}
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