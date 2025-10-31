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
  const [users, setUsers] = useState([]);
  const [usersLoading, setUsersLoading] = useState(false);

  useEffect(() => {
    loadData();
    loadUsers();
  }, [loadData]);

  // 加载 MySQL 用户数据
  const loadUsers = async () => {
    setUsersLoading(true);
    try {
      const response = await fetch('/api/users');
      const result = await response.json();
      if (result.success) {
        setUsers(result.data);
      }
    } catch (error) {
      console.error('Failed to load users:', error);
    } finally {
      setUsersLoading(false);
    }
  };

  return (
    <div style={{ padding: '20px' }}>      
      <div style={{ marginBottom: '20px', display: 'flex', gap: '10px' }}>
        <Button onClick={() => setTheme("light")}>Light</Button>
        <Button onClick={() => setTheme("dark")}>Dark</Button>
        <Button onClick={loadData} disabled={loading}>
          {loading ? 'Loading...' : '重新加载数据'}
        </Button>
        <Button onClick={loadUsers} disabled={usersLoading}>
          {usersLoading ? 'Loading...' : '重新加载用户'}
        </Button>
      </div>

        <div>
          <h2>MySQL 用户数据</h2>
          <div style={{ marginBottom: '20px', padding: '10px', border: '1px solid #ccc', borderRadius: '4px' }}>
            {usersLoading ? (
              <p>加载中...</p>
            ) : (
              <div>
                <p>共 {users.length} 个用户</p>
                <div style={{ display: 'grid', gap: '8px' }}>
                  {users.map(user => (
                    <div key={user.id} style={{ padding: '8px', backgroundColor: '#f5f5f5', borderRadius: '4px' }}>
                      <strong>{user.name}</strong> - {user.email}
                      <small style={{ marginLeft: '10px', color: '#666' }}>
                        {new Date(user.created_at).toLocaleString()}
                      </small>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
          
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