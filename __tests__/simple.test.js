// 最简单的Jest单测
import React from 'react';
import { render } from '@testing-library/react';
import List from '../client/src/components/vList.tsx';

test('1 + 1 = 2', () => {
  expect(1 + 1).toBe(2);
});

test('字符串拼接', () => {
  expect('hello' + ' world').toBe('hello world');
});

// 测试vlist只渲染部分数据而不是全部
test('vlist只渲染可见区域的项目', () => {
  // 创建100个测试项目
  const totalItems = 100;
  const itemHeight = 50;
  const containerHeight = 200; // 只能显示4个项目
  
  const items = Array.from({ length: totalItems }, (_, i) => (
    <div key={i} data-testid={`item-${i}`}>Item {i}</div>
  ));

  const { container } = render(
    <List 
      height={containerHeight} 
      width={300} 
      itemSize={itemHeight} 
      itemCount={totalItems}
    >
      {items}
    </List>
  );

  // 计算应该渲染的项目数量（可见区域 + 1个缓冲）
  const expectedVisibleCount = Math.ceil(containerHeight / itemHeight) + 1; // 5个
  
  // 检查实际渲染的DOM元素数量
  const renderedItems = container.querySelectorAll('[data-testid^="item-"]');
  
  // 验证只渲染了部分项目，而不是全部100个
  expect(renderedItems.length).toBeLessThan(totalItems);
  expect(renderedItems.length).toBeLessThanOrEqual(expectedVisibleCount);
  expect(renderedItems.length).toBeGreaterThan(0);
});