import { chromium } from 'playwright';
import fs from 'fs';

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  page.on('console', msg => console.log('BROWSER:', msg.text()));
  page.on('pageerror', error => console.error('PAGE ERROR:', error.message));

  try {
    console.log('🌐 Navigating to app...');
    await page.goto('http://localhost:5173', { waitUntil: 'networkidle', timeout: 10000 });

    console.log('📸 Taking initial screenshot...');
    await page.screenshot({ path: 'test-1-initial.png', fullPage: true });

    // Create a test image
    console.log('🖼️  Creating test image...');
    const testImagePath = './test-image.png';

    // Upload the test image
    console.log('📤 Simulating file upload...');
    const fileInput = await page.locator('input[type="file"]');

    // Create a simple test image buffer (1000x800 PNG)
    const { createCanvas } = await import('canvas');
    const canvas = createCanvas(1000, 800);
    const ctx = canvas.getContext('2d');

    // Draw a gradient
    const gradient = ctx.createLinearGradient(0, 0, 1000, 800);
    gradient.addColorStop(0, '#3B82F6');
    gradient.addColorStop(1, '#8B5CF6');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 1000, 800);

    // Add some text
    ctx.fillStyle = 'white';
    ctx.font = 'bold 48px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Test Image', 500, 400);

    const buffer = canvas.toBuffer('image/png');
    fs.writeFileSync(testImagePath, buffer);

    await fileInput.setInputFiles(testImagePath);

    console.log('⏳ Waiting for image to load...');
    await page.waitForSelector('.canvas-renderer__canvas', { timeout: 5000 });
    await page.waitForTimeout(1000);

    console.log('📸 Taking screenshot after upload...');
    await page.screenshot({ path: 'test-2-uploaded.png', fullPage: true });

    // Test crop controls
    console.log('✂️  Testing crop preset 16:9...');
    await page.locator('text=16:9').first().click();
    await page.waitForTimeout(500);
    await page.screenshot({ path: 'test-3-crop-16-9.png', fullPage: true });

    // Test background toggle
    console.log('🎨 Testing background toggle...');
    const backgroundToggle = await page.locator('.toggle__button').filter({ hasText: 'Black' });
    await backgroundToggle.click();
    await page.waitForTimeout(500);
    await page.screenshot({ path: 'test-4-white-bg.png', fullPage: true });

    // Check if draggable preview exists
    const draggablePreview = await page.locator('.draggable-crop-preview').count();
    console.log(`🖱️  Draggable preview found: ${draggablePreview > 0 ? 'YES' : 'NO'}`);

    if (draggablePreview > 0) {
      await page.screenshot({ path: 'test-5-with-preview.png', fullPage: true });
    }

    console.log('\n✅ All tests completed successfully!');
    console.log('📁 Screenshots saved:');
    console.log('   - test-1-initial.png');
    console.log('   - test-2-uploaded.png');
    console.log('   - test-3-crop-16-9.png');
    console.log('   - test-4-white-bg.png');
    if (draggablePreview > 0) {
      console.log('   - test-5-with-preview.png');
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
    await page.screenshot({ path: 'test-error.png', fullPage: true });
  } finally {
    await browser.close();
  }
})();
