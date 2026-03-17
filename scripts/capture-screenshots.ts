import { chromium, Browser, Page, BrowserContext } from 'playwright';
import * as path from 'path';
import * as fs from 'fs';

const BASE_URL = 'http://localhost:3132';
const SCREENSHOTS_DIR = path.join(__dirname, '../public/screenshots');

async function takeScreenshots() {
  console.log('🚀 Starting MeetLink Screenshot Capture...\n');
  
  // Ensure screenshots directory exists
  if (!fs.existsSync(SCREENSHOTS_DIR)) {
    fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true });
  }

  const browser: Browser = await chromium.launch({
    headless: true,
  });

  const context: BrowserContext = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
  });

  const page: Page = await context.newPage();

  try {
    // ==========================================
    // Dashboard Screenshot
    // ==========================================
    console.log('📸 Capturing Dashboard...');
    await page.goto(BASE_URL, { waitUntil: 'networkidle', timeout: 60000 });
    await page.waitForTimeout(3000); // Wait for animations
    
    await page.screenshot({
      path: path.join(SCREENSHOTS_DIR, 'dashboard.png'),
      fullPage: false,
    });
    console.log('   ✅ dashboard.png');

    // ==========================================
    // Sidebar Collapsed Screenshot
    // ==========================================
    console.log('📸 Capturing Sidebar Toggle...');
    const sidebarToggle = await page.locator('[data-testid="sidebar-toggle"], button:has-text("≡"), button[aria-label*="menu"]').first();
    if (await sidebarToggle.isVisible()) {
      await sidebarToggle.click();
      await page.waitForTimeout(500);
      await page.screenshot({
        path: path.join(SCREENSHOTS_DIR, 'sidebar-collapsed.png'),
        fullPage: false,
      });
      console.log('   ✅ sidebar-collapsed.png');
      // Expand again
      await sidebarToggle.click();
      await page.waitForTimeout(500);
    }

    // ==========================================
    // Event Types View Screenshot
    // ==========================================
    console.log('📸 Capturing Event Types...');
    const eventTypesNav = await page.locator('text=Event Types, text=Events, [href*="events"]').first();
    if (await eventTypesNav.isVisible()) {
      await eventTypesNav.click();
      await page.waitForTimeout(2000);
      await page.screenshot({
        path: path.join(SCREENSHOTS_DIR, 'event-types.png'),
        fullPage: false,
      });
      console.log('   ✅ event-types.png');
    }

    // ==========================================
    // Calendar View Screenshot
    // ==========================================
    console.log('📸 Capturing Calendar...');
    const calendarNav = await page.locator('text=Calendar, text=Bookings, [href*="calendar"], [href*="booking"]').first();
    if (await calendarNav.isVisible()) {
      await calendarNav.click();
      await page.waitForTimeout(2000);
      await page.screenshot({
        path: path.join(SCREENSHOTS_DIR, 'calendar.png'),
        fullPage: false,
      });
      console.log('   ✅ calendar.png');
    }

    // ==========================================
    // Contacts View Screenshot
    // ==========================================
    console.log('📸 Capturing Contacts...');
    const contactsNav = await page.locator('text=Contacts, [href*="contact"]').first();
    if (await contactsNav.isVisible()) {
      await contactsNav.click();
      await page.waitForTimeout(2000);
      await page.screenshot({
        path: path.join(SCREENSHOTS_DIR, 'contacts.png'),
        fullPage: false,
      });
      console.log('   ✅ contacts.png');
    }

    // ==========================================
    // Availability View Screenshot
    // ==========================================
    console.log('📸 Capturing Availability...');
    const availabilityNav = await page.locator('text=Availability, [href*="availability"]').first();
    if (await availabilityNav.isVisible()) {
      await availabilityNav.click();
      await page.waitForTimeout(2000);
      await page.screenshot({
        path: path.join(SCREENSHOTS_DIR, 'availability.png'),
        fullPage: false,
      });
      console.log('   ✅ availability.png');
    }

    // ==========================================
    // Settings View Screenshot
    // ==========================================
    console.log('📸 Capturing Settings...');
    const settingsNav = await page.locator('text=Settings, [href*="settings"]').first();
    if (await settingsNav.isVisible()) {
      await settingsNav.click();
      await page.waitForTimeout(2000);
      await page.screenshot({
        path: path.join(SCREENSHOTS_DIR, 'settings.png'),
        fullPage: false,
      });
      console.log('   ✅ settings.png');
    }

    // ==========================================
    // Theme Switcher Screenshot
    // ==========================================
    console.log('📸 Capturing Theme Switcher...');
    // Look for appearance tab or theme settings
    const appearanceTab = await page.locator('text=Appearance, text=Theme').first();
    if (await appearanceTab.isVisible()) {
      await appearanceTab.click();
      await page.waitForTimeout(1000);
      await page.screenshot({
        path: path.join(SCREENSHOTS_DIR, 'theme-switcher.png'),
        fullPage: false,
      });
      console.log('   ✅ theme-switcher.png');
    }

    // ==========================================
    // Dark Theme Screenshot
    // ==========================================
    console.log('📸 Capturing Dark Theme...');
    // Try to find and click the Dark theme
    const darkThemeButton = await page.locator('button:has-text("Dark"), [data-theme="dark"]').first();
    if (await darkThemeButton.isVisible()) {
      await darkThemeButton.click();
      await page.waitForTimeout(1000);
      
      // Go back to dashboard
      const dashboardNav = await page.locator('text=Dashboard').first();
      if (await dashboardNav.isVisible()) {
        await dashboardNav.click();
        await page.waitForTimeout(1000);
      }
      
      await page.screenshot({
        path: path.join(SCREENSHOTS_DIR, 'dashboard-dark.png'),
        fullPage: false,
      });
      console.log('   ✅ dashboard-dark.png');
    }

    // ==========================================
    // Mobile View Screenshot
    // ==========================================
    console.log('📸 Capturing Mobile View...');
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto(BASE_URL, { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);
    await page.screenshot({
      path: path.join(SCREENSHOTS_DIR, 'mobile-view.png'),
      fullPage: true,
    });
    console.log('   ✅ mobile-view.png');

    // Reset viewport
    await page.setViewportSize({ width: 1920, height: 1080 });

    console.log('\n✅ All screenshots captured successfully!');
    console.log(`📁 Screenshots saved to: ${SCREENSHOTS_DIR}`);

  } catch (error) {
    console.error('❌ Error capturing screenshots:', error);
    throw error;
  } finally {
    await browser.close();
  }
}

// Run the screenshot capture
takeScreenshots().catch((error) => {
  console.error('Failed to capture screenshots:', error);
  process.exit(1);
});
