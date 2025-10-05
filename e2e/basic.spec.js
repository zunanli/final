// @ts-check
const { test, expect } = require('@playwright/test');

test.describe('Basic E2E Tests', () => {
  test('homepage loads successfully', async ({ page }) => {
    // 访问首页
    await page.goto('/');
    
    // 验证页面标题
    await expect(page).toHaveTitle(/Hello SSR/);
    
    // 验证页面内容加载
    await expect(page.locator('body')).toBeVisible();
  });

  test('navigation to h5 page works', async ({ page }) => {
    // 访问 h5 页面
    await page.goto('/h5');
    
    // 验证页面加载成功
    await expect(page.locator('body')).toBeVisible();
    
    // 验证 URL 正确
    expect(page.url()).toContain('/h5');
  });

  test('api endpoint responds correctly', async ({ page }) => {
    // 测试 API 端点
    const response = await page.request.get('/api/hello');
    
    // 验证响应状态
    expect(response.status()).toBe(200);
    
    // 验证响应内容
    const data = await response.json();
    expect(data).toHaveProperty('message');
  });
});