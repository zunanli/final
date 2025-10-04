import React, {  useState, useRef } from 'react';
import { useTheme } from "next-themes"

type ListProps = {
  height: number;
  width: number | string;
  itemSize: number;
  itemCount: number;
  children: React.ReactNode;
}

export default function List({ height, width, itemCount, itemSize, children }: ListProps) {
  const [scrollTop, setScrollTop] = useState(0);
  const containerRef = useRef(null);

  // 计算可见区域
  const visibleCount = Math.ceil(height / itemSize);
  const startIndex = Math.floor(scrollTop / itemSize);
  const endIndex = Math.min(startIndex + visibleCount + 1, itemCount);

  // 处理滚动事件
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(e.currentTarget.scrollTop);
  };


  return (
    <div
      ref={containerRef}
      className="border border-border rounded overflow-auto relative"
      style={{
        height,
        width,
      }}
      onScroll={handleScroll}
    >
      <div
        style={{
          height: itemCount * itemSize,
          position: 'relative',
        }}
      >
        {React.Children.map(children, (child, index) => {
          // 只渲染可见区域内的元素
          if (index >= startIndex && index < endIndex) {
            return (
              <div
                key={index}
                style={{
                  position: 'absolute',
                  top: index * itemSize,
                  left: 0,
                  right: 0,
                  height: itemSize,
                }}
              >
                {child}
              </div>
            );
          }
          return null;
        })}
      </div>
    </div>
  );
}