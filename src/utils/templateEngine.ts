const TEMPLATE_RE = /\{\{[A-Z0-9_]+\}\}/;

export function hasTemplates(url: string): boolean {
  return TEMPLATE_RE.test(url);
}

interface ResolveContext {
  subscriptionUrl: string;
  happCryptoLink?: string | null;
  incyCryptoLink?: string | null;
  username?: string;
  cryptoLinksEnabled?: boolean;
}

export function isProtectedClientLink(url: string | null | undefined, client: 'happ' | 'incy'): boolean {
  if (!url || /[\s{}]/.test(url)) return false;
  return client === 'happ'
    ? /^happ:\/\/crypt5\/[^\s{}]+$/i.test(url)
    : /^incy:\/\/crypt1\/[^\s{}]+$/i.test(url);
}

export function resolveTemplate(template: string, ctx: ResolveContext): string {
  if (ctx.cryptoLinksEnabled !== false && (
    (/\{\{HAPP_CRYPT[345]_LINK\}\}/.test(template) && !isProtectedClientLink(ctx.happCryptoLink, 'happ')) ||
    (/\{\{INCY_CRYPT1_LINK\}\}/.test(template) && !isProtectedClientLink(ctx.incyCryptoLink, 'incy'))
  )) return '';
  let result = template;

  result = result.replace(/\{\{SUBSCRIPTION_LINK\}\}/g, ctx.subscriptionUrl);

  if (ctx.username) {
    result = result.replace(/\{\{USERNAME\}\}/g, ctx.username);
  }

  const happLink = ctx.happCryptoLink ?? (ctx.cryptoLinksEnabled === false ? ctx.subscriptionUrl : '');
  result = result.replace(/\{\{HAPP_CRYPT[345]_LINK\}\}/g, happLink);
  result = result.replace(/\{\{INCY_CRYPT1_LINK\}\}/g, ctx.incyCryptoLink ?? (ctx.cryptoLinksEnabled === false ? ctx.subscriptionUrl : ''));

  return result;
}
