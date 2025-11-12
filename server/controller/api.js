/**
 * API 路由 - 包含路由定义和处理逻辑
 */
const Router = require('koa-router');
const { generateTestData, getDataStats } = require('../services/dataService');
const { query } = require('../db');

const router = new Router();

/**
 * 健康检查接口
 */
router.get('/api/hello', async (ctx) => {
  ctx.body = { 
    message: 'hello api',
    timestamp: new Date().toISOString(),
    status: 'ok'
  };
});

/**
 * 获取测试数据
 */
router.get('/api/data', async (ctx) => {
  try {
    const { count = 5000 } = ctx.query;
    const dataCount = Math.min(parseInt(count) || 5000, 10000); // 限制最大数据条数
    
    const data = generateTestData(dataCount);
    const stats = getDataStats(data);
    
    ctx.body = {
      success: true,
      data: data,
      total: data.length,
      stats: stats
    };
  } catch (error) {
    console.error('Error generating data:', error);
    ctx.status = 500;
    ctx.body = {
      success: false,
      error: 'Failed to generate data'
    };
  }
});

/**
 * 从 MySQL 读取数据
 */
router.get('/api/users', async (ctx) => {
  try {
    // 确保表存在
    await query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // 检查是否有数据，没有则插入示例数据
    const count = await query('SELECT COUNT(*) as count FROM users');
    if (count[0].count === 0) {
      await query('INSERT INTO users (name, email) VALUES (?, ?)', ['张三', 'zhangsan@example.com']);
      await query('INSERT INTO users (name, email) VALUES (?, ?)', ['李四', 'lisi@example.com']);
      await query('INSERT INTO users (name, email) VALUES (?, ?)', ['王五', 'wangwu@example.com']);
    }
    
    // 获取所有用户
    const users = await query('SELECT * FROM users ORDER BY created_at DESC');
    
    ctx.body = {
      success: true,
      data: users,
      count: users.length
    };
  } catch (error) {
    console.error('Error fetching users:', error);
    ctx.status = 500;
    ctx.body = {
      success: false,
      error: 'Failed to fetch users from database'
    };
  }
});

module.exports = router;
/**
 * 搜索接口：GET /api/search?q=keyword&limit=5
 * - 使用内存数据进行简单匹配，避免引入 DB
 * - 默认 limit=5，最大 50
 * - 返回 { items: ResultItem[], tookMs }
 */
router.get('/api/search', async (ctx) => {
  const start = Date.now();
  const q = (ctx.query.q || '').toString().trim();
  const limit = Math.min(Math.max(parseInt(ctx.query.limit, 10) || 5, 1), 50);

  // 最小查询长度限制：默认 3（与组件默认一致）
  if (q.length < 1) {
    ctx.body = { items: [], tookMs: Date.now() - start };
    return;
  }

  // 简单的内存数据集（可根据需要扩展）
  const DATA = [
    'Apple', 'Apricot', 'Avocado', 'Banana', 'Blueberry', 'Blackberry',
    'Cherry', 'Coconut', 'Cranberry', 'Date', 'Dragonfruit', 'Durian',
    'Fig', 'Grape', 'Grapefruit', 'Guava', 'Kiwi', 'Lemon', 'Lime', 'Lychee',
    'Mango', 'Melon', 'Nectarine', 'Orange', 'Papaya', 'Peach', 'Pear',
    'Pineapple', 'Plum', 'Pomegranate', 'Raspberry', 'Strawberry', 'Tangerine',
    'Watermelon'
  ];

  // 前缀优先，再 fallback 到包含匹配，均大小写不敏感
  const lcq = q.toLowerCase();
  const prefixMatches = DATA.filter((s) => s.toLowerCase().startsWith(lcq));
  const includeMatches = DATA.filter((s) => s.toLowerCase().includes(lcq));

  // 合并并去重，按前缀命中优先排序
  const merged = [...prefixMatches, ...includeMatches.filter((x) => !prefixMatches.includes(x))]
    .slice(0, limit)
    .map((label, idx) => ({ id: `${label}-${idx}`, label }));

  ctx.body = { items: merged, tookMs: Date.now() - start };
});