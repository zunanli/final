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