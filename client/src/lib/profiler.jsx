import { Profiler } from 'react';

// 最简 React Profiler 包装组件
export const ProfilerWrapper = ({ id, children }) => {

  const onRender = (id, phase, actualDuration) => {
      console.log('🔍 React Profiler 监控已启用');
    // 只在渲染时间超过 16ms (一帧) 时输出警告
    if (actualDuration > 16) {
      console.warn(`🐌 慢渲染: ${id} - ${actualDuration.toFixed(2)}ms (${phase})`);
    } 
      // 开发环境显示所有渲染信息
      console.log(`⚡ 渲染: ${id} - ${actualDuration.toFixed(2)}ms (${phase})`);
    
  };

  return (
    <Profiler id={id} onRender={onRender}>
      {children}
    </Profiler>
  );
};