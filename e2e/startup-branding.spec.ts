import { expect, test, type Page, type Route } from '@playwright/test';

const WIDE_LOGO_SVG = '<svg xmlns="http://www.w3.org/2000/svg" width="240" height="80"></svg>';

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

async function mockPublicStartupApi(
  page: Page,
  requestedPaths: string[],
  options: { failFirstBrandingRequest?: boolean } = {},
) {
  let brandingRequestCount = 0;

  await page.route('**/api/**', async (route: Route) => {
    const path = new URL(route.request().url()).pathname.replace(/^\/api/, '');
    requestedPaths.push(path);

    if (path === '/cabinet/branding/logo') {
      await route.fulfill({
        status: 200,
        contentType: 'image/svg+xml',
        body: WIDE_LOGO_SVG,
      });
      return;
    }
    if (path === '/cabinet/branding') {
      brandingRequestCount += 1;
      if (options.failFirstBrandingRequest && brandingRequestCount === 1) {
        await route.fulfill({ status: 503, json: { detail: 'temporary startup failure' } });
        return;
      }
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

  const startupOverlay = page.locator('#app-startup-overlay');
  await expect(startupOverlay).toBeVisible();
  await expect(startupOverlay.locator('svg')).toHaveCount(0);
  await expect(page.getByRole('heading', { name: 'Вход в личный кабинет' })).toHaveCount(0);

  await expect
    .poll(() =>
      page.locator('html').evaluate((element) => element.classList.contains('startup-logo-ready')),
    )
    .toBe(true);
  await expect(startupOverlay).toHaveCount(0);
  const authLogo = page.locator('img[alt="Ultimteam VPN"]');
  await expect(authLogo).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Ultimteam VPN' })).toHaveCount(0);
  await expect(authLogo).toHaveAttribute('src', '/api/cabinet/branding/logo');
  await expect.poll(() => authLogo.evaluate((image) => getComputedStyle(image).opacity)).toBe('1');
  await expect
    .poll(() =>
      authLogo.evaluate((image) => {
        const rect = image.getBoundingClientRect();
        return rect.width > rect.height;
      }),
    )
    .toBe(true);

  expect(requestedPaths).toContain('/cabinet/branding/logo');
});

test('retries cold branding without caching a logo-less network fallback', async ({ page }) => {
  const requestedPaths: string[] = [];
  await mockPublicStartupApi(page, requestedPaths, { failFirstBrandingRequest: true });
  await page.addInitScript((themeConfig) => {
    localStorage.clear();
    sessionStorage.clear();
    localStorage.setItem('cabinet_ultima_mode', 'true');
    localStorage.setItem('cabinet_ultima_theme_config', JSON.stringify(themeConfig));
  }, THEME_CONFIG);

  await page.goto('/login');

  await expect
    .poll(() =>
      page.locator('html').evaluate((element) => element.classList.contains('startup-logo-ready')),
    )
    .toBe(true);
  await expect(page.locator('#app-startup-overlay')).toHaveCount(0);
  await expect(page.getByRole('heading', { name: 'Ultimteam VPN' })).toHaveCount(0);
  expect(requestedPaths.filter((path) => path === '/cabinet/branding')).toHaveLength(2);
  expect(requestedPaths).toContain('/cabinet/branding/logo');

  const cachedBranding = await page.evaluate(() => {
    const raw = localStorage.getItem('cabinet_branding');
    return raw ? JSON.parse(raw) : null;
  });
  expect(cachedBranding).toMatchObject({
    name: 'Ultimteam VPN',
    has_custom_logo: true,
    logo_url: '/cabinet/branding/logo',
  });
});
