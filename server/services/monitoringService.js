/**
 * 监控服务 - 处理监控数据和指标
 */
const { register, webVitalsLCP, webVitalsFID, webVitalsCLS } = require('../metrics');

/**
 * 获取 Prometheus 指标
 * @returns {Promise<string>} 指标数据
 */
const getMetrics = async () => {
  return await register.metrics();
};

/**
 * 获取指标内容类型
 * @returns {string} 内容类型
 */
const getContentType = () => {
  return register.contentType;
};

/**
 * 记录 Web Vitals 指标
 * @param {string} name - 指标名称 (LCP, FID, CLS)
 * @param {number} value - 指标值
 * @param {string} rating - 评级
 * @param {string} page - 页面名称
 */
const recordWebVital = (name, value, rating = 'unknown', page = 'unknown') => {
  const valueInSeconds = value / 1000; // 转换为秒
  const pageName = page || 'unknown';
  const metricRating = rating || 'unknown';

  // 根据指标类型记录到对应的 Prometheus 指标
  switch (name.toUpperCase()) {
    case 'LCP':
      webVitalsLCP.labels(pageName, metricRating).observe(valueInSeconds);
      break;
    case 'FID':
      webVitalsFID.labels(pageName, metricRating).observe(valueInSeconds);
      break;
    case 'CLS':
      webVitalsCLS.labels(pageName, metricRating).observe(value); // CLS 不需要转换
      break;
    default:
      console.warn(`Unknown Web Vital metric: ${name}`);
  }
};

/**
 * 验证 Web Vitals 数据格式
 * @param {Object} data - 上报的数据
 * @returns {Object} 验证结果
 */
const validateWebVitalsData = (data) => {
  const { name, value, rating, page } = data || {};
  
  if (!name || value === undefined) {
    return {
      valid: false,
      error: 'Missing required fields: name, value'
    };
  }

  if (typeof value !== 'number' || value < 0) {
    return {
      valid: false,
      error: 'Value must be a non-negative number'
    };
  }

  return { valid: true };
};

module.exports = {
  getMetrics,
  getContentType,
  recordWebVital,
  validateWebVitalsData
};