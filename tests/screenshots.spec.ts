import { test, expect } from '@playwright/test';
import path from 'path';

test.describe('MeetLink Screenshots', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the app and wait for it to load
    await page.goto('/', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000); // Wait for animations
  });

  test('take dashboard screenshot', async ({ page }) => {
    // Dashboard should be the default view
    await expect(page.locator('text=Dashboard').first()).toBeVisible({ timeout: 10000 });
    
    // Take screenshot
    await page.screenshot({
      path: path.join(__dirname, '../public/screenshots/dashboard.png'),
      fullPage: true,
    });
    
    console.log('✅ Dashboard screenshot captured');
  });

  test('take event types screenshot', async ({ page }) => {
    // Navigate to Event Types
    await page.click('text=Event Types');
    await page.waitForTimeout(1000);
    
    // Take screenshot
    await page.screenshot({
      path: path.join(__dirname, '../public/screenshots/event-types.png'),
      fullPage: true,
    });
    
    console.log('✅ Event Types screenshot captured');
  });

  test('take calendar screenshot', async ({ page }) => {
    // Navigate to Calendar
    await page.click('text=Calendar');
    await page.waitForTimeout(1000);
    
    // Take screenshot
    await page.screenshot({
      path: path.join(__dirname, '../public/screenshots/calendar.png'),
      fullPage: true,
    });
    
    console.log('✅ Calendar screenshot captured');
  });

  test('take contacts screenshot', async ({ page }) => {
    // Navigate to Contacts
    await page.click('text=Contacts');
    await page.waitForTimeout(1000);
    
    // Take screenshot
    await page.screenshot({
      path: path.join(__dirname, '../public/screenshots/contacts.png'),
      fullPage: true,
    });
    
    console.log('✅ Contacts screenshot captured');
  });

  test('take settings themes screenshot', async ({ page }) => {
    // Navigate to Settings
    await page.click('text=Settings');
    await page.waitForTimeout(500);
    
    // Click on Appearance tab
    await page.click('text=Appearance');
    await page.waitForTimeout(1000);
    
    // Take screenshot of themes
    await page.screenshot({
      path: path.join(__dirname, '../public/screenshots/themes.png'),
      fullPage: true,
    });
    
    console.log('✅ Themes screenshot captured');
  });

  test('take dark theme screenshot', async ({ page }) => {
    // Navigate to Settings
    await page.click('text=Settings');
    await page.waitForTimeout(500);
    
    // Click on Appearance tab
    await page.click('text=Appearance');
    await page.waitForTimeout(500);
    
    // Click on Dark theme (second theme card)
    const themeCards = page.locator('button:has-text("Dark")');
    await themeCards.click();
    await page.waitForTimeout(1000);
    
    // Navigate back to dashboard
    await page.click('text=Dashboard');
    await page.waitForTimeout(500);
    
    // Take screenshot with dark theme
    await page.screenshot({
      path: path.join(__dirname, '../public/screenshots/dashboard-dark.png'),
      fullPage: true,
    });
    
    console.log('✅ Dark theme screenshot captured');
  });

  test('take mobile view screenshot', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 812 });
    await page.waitForTimeout(500);
    
    // Take screenshot
    await page.screenshot({
      path: path.join(__dirname, '../public/screenshots/mobile-view.png'),
      fullPage: true,
    });
    
    console.log('✅ Mobile view screenshot captured');
  });
});
