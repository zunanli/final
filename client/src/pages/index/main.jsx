import React, { useEffect, useState, useRef } from 'react';
import { createRoot } from 'react-dom/client';
import '../../../style.css';
import { Button } from "@/components/button"
import { ThemeProvider } from "@/components/theme-provider"
import { useTheme } from "next-themes"
import List from "@/components/vList"
import EditableRow from "@/components/EditableRow"

// 使用新的可编辑Row组件

function App() {
  const [msg, setMsg] = useState('');
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const { setTheme } = useTheme()

  useEffect(() => {
    console.log('load');
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
          // 转换数据格式为可编辑的结构
          const editableData = result.data.map((item, index) => ({
            id: index + 1,
            text: `Item ${index + 1} - ${item.name || '可编辑文本'}`
          }));
          setData(editableData);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to fetch data:', err);
        setLoading(false);
      });
  };

  // 处理item编辑的回调函数
  const handleItemChange = (index, newValue) => {
    setData(prevData => {
      const newData = [...prevData];
      newData[index] = { ...newData[index], text: newValue };
      return newData;
    });
  };

  return (
    <div style={{ padding: '20px' }}>      
      <div style={{ marginBottom: '20px' }}>
        <Button onClick={() => setTheme("light")}>Light</Button>
        <Button onClick={() => setTheme("dark")}>Dark</Button>
        <Button onClick={loadData} disabled={loading}>
          {loading ? 'Loading...' : '加载虚拟列表 (5000条数据)'}
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