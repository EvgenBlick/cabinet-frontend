import { expect, test, type Page, type Route } from '@playwright/test';

const THEME_CONFIG = {
  themePresetId: 'custom',
  animationPresetId: 'minimal',
  primaryColor: '#ff4d67',
  primaryTextColor: '#ffffff',
  secondaryColor: '#25112d',
  secondaryTextColor: '#fff6fb',
  navBackgroundColor: '#1b1025',
  navActiveColor: '#ff4d67',
  navTextColor: '#f8eaf3',
  backgroundTopColor: '#160b20',
  backgroundBottomColor: '#08050f',
  auraColor: '#ff4d67',
  ringColor: '#ffb3c0',
  surfaceColor: '#25112d',
  surfaceBorderColor: '#ff9aae',
  scrollbarThumbColor: '#ff6d84',
  scrollbarTrackColor: '#160b20',
  contentEnterMs: 0,
  tapRingMs: 0,
  ringWaveSec: 18,
  sliderGlowSec: 2.6,
  stepRingSec: 5.8,
  successWaveMs: 0,
  itemEnterMs: 0,
  framesEnabled: false,
  homeUseBrandLogo: true,
};

async function mockGuestApi(page: Page) {
  await page.route('**/api/**', async (route: Route) => {
    const path = new URL(route.request().url()).pathname.replace(/^\/api/, '');

    if (path === '/cabinet/branding') {
      await route.fulfill({
        status: 200,
        json: {
          name: 'Custom VPN',
          logo_url: null,
          logo_letter: 'C',
          has_custom_logo: false,
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
    if (path === '/cabinet/branding/fullscreen') {
      await route.fulfill({ status: 200, json: { enabled: false } });
      return;
    }
    if (path === '/cabinet/theme/colors') {
      await route.fulfill({ status: 404, json: { detail: 'not configured' } });
      return;
    }

    await route.fulfill({ status: 404, json: { detail: 'not configured in guest test' } });
  });
}

test('uses the configured Ultima theme on the guest support page', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await mockGuestApi(page);
  await page.addInitScript((themeConfig) => {
    localStorage.setItem('cabinet_ultima_mode', 'true');
    localStorage.setItem('cabinet_ultima_theme_config', JSON.stringify(themeConfig));
  }, THEME_CONFIG);

  await page.goto('/support/guest');

  await expect(page.getByTestId('guest-support-page')).toBeVisible();
  await expect(page.getByText('Custom VPN')).toBeVisible();
  await expect(
    page.getByRole('heading', { name: 'Опишите вопрос, ответ появится здесь' }),
  ).toBeVisible();
  await expect(page.getByRole('button', { name: 'Начать чат' })).toBeVisible();
  await expect
    .poll(() =>
      page
        .locator('html')
        .evaluate((element) =>
          getComputedStyle(element).getPropertyValue('--ultima-color-primary').trim(),
        ),
    )
    .toBe('#ff4d67');
  await expect
    .poll(() => page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth))
    .toBe(true);
});
