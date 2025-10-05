// 极简性能监控 - 只需一行代码启用
import { onCLS, onINP, onFCP, onLCP, onTTFB } from 'web-vitals';

// 简单的性能指标输出
const logPerf = (metric) => console.log(`🚀 ${metric.name}: ${Math.round(metric.value)}${metric.name === 'CLS' ? '' : 'ms'} (${metric.rating})`);

// 一键启用所有性能监控
export const startPerf = () => {
  console.log('🎯 性能监控启动');
  [onLCP, onINP, onCLS, onFCP, onTTFB].forEach(fn => fn(logPerf));
};

 startPerf();