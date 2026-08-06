import { expect, test, type Page, type Route } from '@playwright/test';

const ONE_PIXEL_PNG = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=',
  'base64',
);

const THEME_CONFIG = {
  themePresetId: 'emerald-classic',
  animationPresetId: 'meteor-stream',
  primaryColor: '#1bd29f',
  primaryTextColor: '#ffffff',
  secondaryColor: '#0c2d2a',
  secondaryTextColor: '#f7fffc',
  navBackgroundColor: '#0f3a38',
  navActiveColor: '#1bd29f',
  navTextColor: '#d6f6ee',
  backgroundTopColor: '#031824',
  backgroundBottomColor: '#06232b',
  auraColor: '#21d09a',
  ringColor: '#b8ffec',
  surfaceColor: '#0c2d2a',
  surfaceBorderColor: '#92f4d8',
  scrollbarThumbColor: '#49e9b3',
  scrollbarTrackColor: '#0c262a',
  contentEnterMs: 300,
  tapRingMs: 700,
  ringWaveSec: 12,
  sliderGlowSec: 2.2,
  stepRingSec: 4.8,
  successWaveMs: 900,
  itemEnterMs: 240,
  framesEnabled: false,
  homeUseBrandLogo: false,
};

async function mockPublicStartupApi(page: Page, requestedPaths: string[]) {
  await page.route('**/api/**', async (route: Route) => {
    const path = new URL(route.request().url()).pathname.replace(/^\/api/, '');
    requestedPaths.push(path);

    if (path === '/cabinet/branding/logo') {
      await route.fulfill({
        status: 200,
        contentType: 'image/png',
        body: ONE_PIXEL_PNG,
      });
      return;
    }
    if (path === '/cabinet/branding') {
      await new Promise((resolve) => setTimeout(resolve, 1_200));
      await route.fulfill({
        status: 200,
        json: {
          name: 'Ultimteam VPN',
          logo_url: '/cabinet/branding/logo',
          logo_letter: 'U',
          has_custom_logo: true,
        },
      });
      return;
    }
    if (path === '/cabinet/branding/ultima-mode') {
      await route.fulfill({ status: 200, json: { enabled: true } });
      return;
    }
    if (path === '/cabinet/branding/lite-mode') {
      await route.fulfill({ status: 200, json: { enabled: false } });
      return;
    }
    if (path === '/cabinet/branding/ultima-theme-config') {
      await route.fulfill({ status: 200, json: THEME_CONFIG });
      return;
    }
    if (path === '/cabinet/branding/email-auth') {
      await route.fulfill({ status: 200, json: { enabled: true } });
      return;
    }
    if (path === '/cabinet/auth/oauth/providers') {
      await route.fulfill({ status: 200, json: { providers: [] } });
      return;
    }

    await route.fulfill({ status: 404, json: { detail: 'not configured in startup test' } });
  });
}

test('keeps the themed startup cover visible and resolves a relative brand logo through the API', async ({
  page,
}) => {
  const requestedPaths: string[] = [];
  await mockPublicStartupApi(page, requestedPaths);
  await page.addInitScript((themeConfig) => {
    localStorage.setItem('cabinet_ultima_mode', 'true');
    localStorage.setItem('cabinet_ultima_theme_config', JSON.stringify(themeConfig));
  }, THEME_CONFIG);

  await page.goto('/login');

  await expect(page.getByTestId('app-startup-loader')).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Вход в личный кабинет' })).toHaveCount(0);

  const logo = page.locator('img[alt="Ultimteam VPN"]').first();
  await expect(logo).toBeVisible();
  await expect(logo).toHaveAttribute('src', '/api/cabinet/branding/logo');
  await expect
    .poll(() => logo.evaluate((image: HTMLImageElement) => image.naturalWidth))
    .toBeGreaterThan(0);
  await expect(page.getByTestId('app-startup-loader')).toHaveCount(0);
  const authLogo = page.locator('img[alt="Ultimteam VPN"]');
  await expect(authLogo).toBeVisible();
  await expect.poll(() => authLogo.evaluate((image) => getComputedStyle(image).opacity)).toBe('1');

  expect(requestedPaths).toContain('/cabinet/branding/logo');
});
