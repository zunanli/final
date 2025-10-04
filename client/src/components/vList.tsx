import React, {  useState, useRef } from 'react';
import { useTheme } from "next-themes"

type ListProps<T> = {
  height: number;
  width: number;
  itemSize: number;
  data: T[];
  children: (props: { index: number; item: T }) => React.ReactNode;
}

export default function List<T>({ height, width, data, itemSize, children: Row }: ListProps<T>) {
  const [scrollTop, setScrollTop] = useState(0);
  const containerRef = useRef(null);
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  // 计算可见区域
  const visibleCount = Math.ceil(height / itemSize);
  const startIndex = Math.floor(scrollTop / itemSize);
  const endIndex = Math.min(startIndex + visibleCount + 1, data.length);

  // 处理滚动事件
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(e.currentTarget.scrollTop);
  };


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
          height: data.length * itemSize,
          position: 'relative',
        }}
      >
        {data.slice(startIndex, endIndex).map((item, index) => {
    const itemIndex = startIndex + index;
    return (
      <div
        key={itemIndex}
        style={{
          position: 'absolute',
          top: itemIndex * itemSize,
          left: 0,
          right: 0,
          height: itemSize,
        }}
      >
        <Row index={itemIndex} item={item} />
      </div>
    );
  })}
      </div>
    </div>
  );
}