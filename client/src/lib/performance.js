// 极简性能监控 - 只需一行代码启用
import { onCLS, onINP, onFCP, onLCP, onTTFB } from 'web-vitals';

// 上报性能数据到后端
const reportMetric = async (metric) => {
  try {
    // 控制台输出（保留原有功能）
    console.log(`🚀 ${metric.name}: ${Math.round(metric.value)}${metric.name === 'CLS' ? '' : 'ms'} (${metric.rating})`);
    
    // 上报到后端监控系统
    await fetch('/api/report', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: metric.name,
        value: metric.value,
        rating: metric.rating,
        page: window.location.pathname,
        timestamp: Date.now(),
      }),
    });
  } catch (error) {
    // 静默处理上报错误，不影响用户体验
    console.warn('Failed to report metric:', error);
  }
};

// 一键启用所有性能监控
export const startPerf = () => {
  console.log('🎯 性能监控启动 - 数据将上报到 Prometheus');
  
  // 监控核心 Web Vitals 指标
  onLCP(reportMetric);  // Largest Contentful Paint
  onCLS(reportMetric);  // Cumulative Layout Shift
  onFCP(reportMetric);  // First Contentful Paint
  onTTFB(reportMetric); // Time to First Byte
  
  // 注意：onINP 替代了 FID，但我们保持向后兼容
  onINP(reportMetric);  // Interaction to Next Paint
};

startPerf();