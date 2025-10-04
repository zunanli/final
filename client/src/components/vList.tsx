import React, {  useState, useRef } from 'react';
import { useTheme } from "next-themes"

type ListProps = {
  height: number;
  width: number;
  itemCount: number;
  itemSize: number;
  children: (props: { index: number }) => React.ReactNode;
}

export default function List({ height, width, itemCount, itemSize, children: Row }: ListProps) {
  const [scrollTop, setScrollTop] = useState(0);
  const containerRef = useRef(null);
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  // 计算可见区域
  const visibleCount = Math.ceil(height / itemSize);
  const startIndex = Math.floor(scrollTop / itemSize);
  const endIndex = Math.min(startIndex + visibleCount + 1, itemCount);

  // 处理滚动事件
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(e.currentTarget.scrollTop);
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
        border: isDark ? '1px solid #444' : '1px solid #ddd',
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