import { type CSSProperties, useState, useCallback, useMemo, memo } from 'react';
import { useNavigate } from 'react-router';
import { useTranslation } from 'react-i18next';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { newsApi, normalizeNewsMediaUrl } from '../../api/news';
import {
  ultimaPaneClassName,
  ultimaPaneSurfaceStyle,
  ultimaPanelClassName,
  ultimaSurfaceStyle,
} from '../../features/ultima/surfaces';
import { useHapticFeedback } from '../../platform/hooks/useHaptic';
import { cn } from '../../lib/utils';
import type { NewsListItem } from '../../types/news';

// --- Security: hex color validation to prevent CSS injection ---
const HEX_COLOR_RE = /^#(?:[0-9a-fA-F]{3,4}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/;
function safeColor(color: string | null | undefined, fallback = '#888888'): string {
  if (!color || !HEX_COLOR_RE.test(color)) return fallback;
  return color;
}

// --- Animation variants ---
const EASE_OUT: [number, number, number, number] = [0.23, 1, 0.32, 1];

const fadeSlideUp = {
  hidden: { opacity: 0, y: 8 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.035,
      duration: 0.22,
      ease: EASE_OUT,
    },
  }),
};

// --- Icons ---
const ArrowIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
    <path
      d="M3 8h10M9 4l4 4-4 4"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

// --- Sub-components ---

interface CategoryBadgeProps {
  category: string;
  color: string;
  className?: string;
}

const CategoryBadge = memo(function CategoryBadge({
  category,
  color,
  className,
}: CategoryBadgeProps) {
  const c = safeColor(color);
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-md px-3 py-1 text-[12px] font-medium',
        className,
      )}
      style={{
        color: c,
        background: `${c}15`,
        border: `1px solid ${c}30`,
      }}
    >
      <span
        className="h-1.5 w-1.5 rounded-full"
        style={{
          background: c,
        }}
      />
      {category}
    </span>
  );
});

interface TagBadgeProps {
  text: string;
  color: string;
}

const TagBadge = memo(function TagBadge({ text, color }: TagBadgeProps) {
  const c = safeColor(color);
  return (
    <span
      className="inline-block rounded px-2 py-0.5 text-[12px] font-medium"
      style={{
        color: c,
        border: `1px solid ${c}33`,
        background: `${c}11`,
      }}
    >
      {text}
    </span>
  );
});

interface FilterTabsProps {
  categories: string[];
  active: string;
  onChange: (category: string) => void;
  variant?: 'default' | 'ultima';
}

const FilterTabs = memo(function FilterTabs({
  categories,
  active,
  onChange,
  variant = 'default',
}: FilterTabsProps) {
  const { t } = useTranslation();
  const haptic = useHapticFeedback();
  const isUltimaVariant = variant === 'ultima';

  return (
    <div className="flex flex-wrap gap-2" role="tablist" aria-label={t('news.title')}>
      {/* "All" tab — empty string means no filter */}
      <button
        role="tab"
        aria-selected={active === ''}
        onClick={() => {
          haptic.selectionChanged();
          onChange('');
        }}
        className={cn(
          'min-h-[44px] rounded-full px-4 py-2 text-[13px] font-medium transition-colors duration-200',
          active === '' && !isUltimaVariant
            ? 'border border-accent-400 bg-accent-400 text-dark-950'
            : !isUltimaVariant
              ? 'border border-dark-700 bg-dark-800 text-dark-400 hover:border-accent-400/30 hover:text-accent-400'
              : '',
        )}
        style={
          isUltimaVariant
            ? active === ''
              ? {
                  borderColor: 'transparent',
                  background: 'rgba(255,255,255,0.14)',
                  color: '#fff',
                }
              : {
                  borderColor:
                    'color-mix(in srgb, var(--ultima-color-surface-border) 28%, transparent)',
                  background: 'color-mix(in srgb, var(--ultima-color-secondary) 72%, transparent)',
                  color: 'rgba(255,255,255,0.82)',
                }
            : undefined
        }
      >
        {t('news.filterAll')}
      </button>
      {categories.map((cat) => {
        const isActive = active === cat;
        return (
          <button
            key={cat}
            role="tab"
            aria-selected={isActive}
            onClick={() => {
              haptic.selectionChanged();
              onChange(cat);
            }}
            className={cn(
              'min-h-[44px] rounded-full px-4 py-2 text-[13px] font-medium transition-colors duration-200',
              isActive && !isUltimaVariant
                ? 'border border-accent-400 bg-accent-400 text-dark-950'
                : !isUltimaVariant
                  ? 'border border-dark-700 bg-dark-800 text-dark-400 hover:border-accent-400/30 hover:text-accent-400'
                  : '',
            )}
            style={
              isUltimaVariant
                ? isActive
                  ? {
                      borderColor: 'transparent',
                      background: 'rgba(255,255,255,0.14)',
                      color: '#fff',
                    }
                  : {
                      borderColor:
                        'color-mix(in srgb, var(--ultima-color-surface-border) 28%, transparent)',
                      background:
                        'color-mix(in srgb, var(--ultima-color-secondary) 72%, transparent)',
                      color: 'rgba(255,255,255,0.82)',
                    }
                : undefined
            }
          >
            {cat}
          </button>
        );
      })}
    </div>
  );
});

interface FeaturedCardProps {
  item: NewsListItem;
  onClick: () => void;
  variant?: 'default' | 'ultima';
}

const FeaturedCard = memo(function FeaturedCard(props: FeaturedCardProps) {
  return <NewsCard {...props} index={0} featured />;
});

interface FeedContinuationTeaserProps {
  remainingCount: number;
  onReveal: () => void;
  variant?: 'default' | 'ultima';
  isLoading?: boolean;
}

const FeedContinuationTeaser = memo(function FeedContinuationTeaser({
  remainingCount, onReveal, isLoading = false,
}: FeedContinuationTeaserProps) {
  const { t } = useTranslation();
  return (
    <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-white/10 pt-5">
      <span className="text-[13px] text-white/60">
        {t('ultima.newsFeedContinuationCount', { count: remainingCount, defaultValue: `Еще ${remainingCount} новостей` })}
      </span>
      <button type="button" onClick={onReveal} disabled={isLoading}
        className="cabinet-glass-control min-h-[44px] rounded-full border border-white/15 bg-white/[0.06] px-5 text-[14px] font-medium text-white transition-colors duration-200 hover:bg-white/10 disabled:opacity-50">
        {isLoading ? t('common.loading') : t('news.loadMore')}
      </button>
    </div>
  );
});

interface NewsCardProps {
  item: NewsListItem;
  index: number;
  onClick: () => void;
  variant?: 'default' | 'ultima';
  featured?: boolean;
}

const NewsCard = memo(function NewsCard({ item, index, onClick, variant = 'default', featured = false }: NewsCardProps) {
  const { t, i18n } = useTranslation();
  const [imageFailed, setImageFailed] = useState(false);
  const image = normalizeNewsMediaUrl(item.featured_image_url);
  const color = safeColor(item.category_color);
  return (
    <motion.article custom={index} variants={fadeSlideUp} initial="hidden" animate="visible"
      role="link" tabIndex={0} onClick={onClick}
      onKeyDown={(event) => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); onClick(); } }}
      className={cn('cabinet-content-card group flex min-w-0 cursor-pointer flex-col overflow-hidden rounded-[24px] border border-white/10 bg-white/[0.035] transition-colors duration-200 hover:border-white/25 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#66b2ff]', featured && 'col-span-full sm:flex-row', variant === 'default' && 'bg-dark-900')}>
      {image && !imageFailed && (
        <div className={cn('overflow-hidden bg-black/15', featured ? 'sm:w-[42%] sm:shrink-0' : '')}>
          <img src={image} alt="" loading="lazy" decoding="async" onError={() => setImageFailed(true)}
            className={cn('aspect-[16/9] w-full object-cover', featured && 'sm:aspect-auto sm:h-full sm:min-h-[260px]')} />
        </div>
      )}
      <div className="flex min-w-0 flex-1 flex-col p-5 sm:p-6">
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <CategoryBadge category={item.category} color={color} />
          {item.is_featured && <span className="rounded-full border border-white/15 px-2.5 py-1 text-[12px] font-medium text-white/75">{t('news.featured', { defaultValue: 'Важное' })}</span>}
          {item.tag && <TagBadge text={item.tag} color={color} />}
        </div>
        <h3 className={cn('break-words font-semibold leading-[1.25] tracking-[-0.015em] text-white [overflow-wrap:anywhere]', featured ? 'text-[24px] sm:text-[28px]' : 'text-[20px]')}>
          {item.title}
        </h3>
        {item.excerpt && <p className="mt-3 line-clamp-3 break-words text-[14px] leading-[1.65] text-white/65 [overflow-wrap:anywhere]">{item.excerpt}</p>}
        <div className="mt-auto flex flex-wrap items-center gap-x-4 gap-y-2 pt-5 text-[12px] text-white/55">
          {item.published_at && <time dateTime={item.published_at}>{new Date(item.published_at).toLocaleDateString(i18n.language)}</time>}
          <span>{item.read_time_minutes} {t('news.readTime')}</span>
          <span className="ml-auto inline-flex items-center gap-2 text-[13px] font-medium text-white/85">{t('news.readMore')}<ArrowIcon /></span>
        </div>
      </div>
    </motion.article>
  );
});

// Thin wrapper that binds the per-item click handler without creating a new
// anonymous lambda in the parent's JSX on every render, which would defeat
// the memo on NewsCard.
interface NewsCardWrapperProps {
  item: NewsListItem;
  index: number;
  onCardClick: (slug: string) => void;
  variant?: 'default' | 'ultima';
}

const NewsCardWrapper = memo(function NewsCardWrapper({
  item,
  index,
  onCardClick,
  variant = 'default',
}: NewsCardWrapperProps) {
  const handleClick = useCallback(() => onCardClick(item.slug), [item.slug, onCardClick]);
  return <NewsCard item={item} index={index} onClick={handleClick} variant={variant} />;
});

// --- Main Component ---

const NEWS_LIMIT = 6;

type NewsSectionProps = {
  showHeader?: boolean;
  showEmptyState?: boolean;
  className?: string;
  variant?: 'default' | 'ultima';
};

export default function NewsSection({
  showHeader = true,
  showEmptyState = false,
  className,
  variant = 'default',
}: NewsSectionProps = {}) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const haptic = useHapticFeedback();
  const [filter, setFilter] = useState<string>('');
  const [limit, setLimit] = useState(NEWS_LIMIT);

  const categoryParam = filter || undefined;

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ['news', 'list', categoryParam, limit],
    queryFn: () => newsApi.getNews({ category: categoryParam, limit, offset: 0 }),
    // staleTime: serve cached data for 2 min before background re-fetch.
    // gcTime: keep in cache for 10 min so navigating away and back is instant.
    staleTime: 2 * 60_000,
    gcTime: 10 * 60_000,
  });

  const items = useMemo(() => data?.items ?? [], [data?.items]);
  const total = data?.total ?? 0;
  const categories = data?.categories ?? [];
  const remainingCount = Math.max(total - items.length, 0);

  // Memoized so FeaturedCard/NewsCard receive stable object references when
  // parent state unrelated to the list changes (e.g. load-more button state).
  const { featured, regular } = useMemo(
    () => {
      const featured = items.find((item) => item.is_featured);
      return { featured, regular: items.filter((item) => item.id !== featured?.id) };
    },
    [items],
  );

  const handleCardClick = useCallback(
    (slug: string) => {
      haptic.buttonPress();
      const articlePath = variant === 'ultima' ? `/ultima/news/${slug}` : `/news/${slug}`;
      void queryClient.prefetchQuery({
        queryKey: ['news', 'article', slug],
        queryFn: () => newsApi.getArticle(slug),
        staleTime: 60_000,
      });
      navigate(articlePath);
    },
    [haptic, navigate, queryClient, variant],
  );

  const handleLoadMore = useCallback(() => {
    haptic.buttonPress();
    setLimit((prev) => prev + NEWS_LIMIT);
  }, [haptic]);

  const handleFilterChange = useCallback((category: string) => {
    setFilter(category);
    setLimit(NEWS_LIMIT);
  }, []);

  // Stable reference for the featured card — avoids re-rendering FeaturedCard
  // when `featured` is a new object reference but contains the same slug.
  const featuredSlug = featured?.slug;
  const handleFeaturedClick = useCallback(() => {
    if (featuredSlug) handleCardClick(featuredSlug);
  }, [featuredSlug, handleCardClick]);

  const isUltimaVariant = variant === 'ultima';
  const emptyStateStyle: CSSProperties | undefined = isUltimaVariant
    ? ultimaSurfaceStyle
    : undefined;
  const sectionStyle: CSSProperties | undefined = isUltimaVariant ? ultimaSurfaceStyle : undefined;

  if (items.length === 0) {
    if (!showEmptyState) {
      return null;
    }

    return (
      <section
        className={cn(
          isUltimaVariant
            ? `${ultimaPanelClassName} relative overflow-hidden p-4 text-left sm:p-5`
            : 'relative overflow-hidden rounded-2xl bg-dark-850/80 px-5 py-8 text-center backdrop-blur-xl sm:px-6 sm:py-10',
          className,
        )}
        style={emptyStateStyle}
      >
        <div className={cn('mx-auto', isUltimaVariant ? 'max-w-2xl' : 'max-w-md')}>
          {showHeader ? (
            <p
              className={cn(
                'mb-2 font-mono text-[11px] font-bold uppercase tracking-[0.18em]',
                isUltimaVariant ? 'text-white/48' : 'text-dark-500',
              )}
            >
              {t('news.title')}
            </p>
          ) : null}
          <div
            className={cn(
              'rounded-[26px] px-6 py-6',
              isUltimaVariant
                ? `${ultimaPaneClassName} mt-3 max-w-xl shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]`
                : '',
            )}
            style={isUltimaVariant ? ultimaPaneSurfaceStyle : undefined}
          >
            <p
              className={cn(
                'text-sm leading-[1.8]',
                isUltimaVariant ? 'text-white/76' : 'text-dark-300',
              )}
            >
              {t('news.noNews')}
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section
      className={cn(
        isUltimaVariant
          ? `${ultimaPanelClassName} relative overflow-visible`
          : 'relative overflow-hidden rounded-2xl bg-dark-850/80 backdrop-blur-xl',
        className,
      )}
      style={sectionStyle}
    >
      <div className={cn(isUltimaVariant ? 'p-4 sm:p-5' : 'px-5 py-8 sm:px-6 sm:py-10')}>
        {showHeader ? (
          <motion.div
            variants={fadeSlideUp}
            custom={0}
            initial="hidden"
            animate="visible"
            className="mb-8"
          >
            <div className="mb-2 flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-accent-400 to-accent-600">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path
                    d="M4 4h16a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2Z"
                    fill="currentColor"
                    className="text-dark-950/20"
                  />
                  <path
                    d="M4 4h16a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2Z"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    className="text-dark-950"
                  />
                  <path
                    d="M7 8h4M7 11h10M7 14h10M7 17h6"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    className="text-dark-950"
                  />
                  <rect
                    x="14"
                    y="7"
                    width="4"
                    height="4"
                    rx="0.5"
                    fill="currentColor"
                    className="text-dark-950"
                  />
                </svg>
              </div>
              <span className="font-mono text-[11px] font-bold uppercase tracking-[0.18em] text-dark-500">
                {t('news.title')}
              </span>
            </div>
          </motion.div>
        ) : null}

        {categories.length > 0 && (
          <motion.div
            variants={fadeSlideUp}
            custom={0}
            initial="hidden"
            animate="visible"
            className={showHeader ? 'mb-8' : isUltimaVariant ? 'mb-4' : 'mb-6'}
          >
            <FilterTabs
              categories={categories}
              active={filter}
              onChange={handleFilterChange}
              variant={variant}
            />
          </motion.div>
        )}

        {/* Grid */}
        {items.length > 0 && (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
            {featured && (
              <FeaturedCard item={featured} onClick={handleFeaturedClick} variant={variant} />
            )}
            {regular.map((item, i) => (
              <NewsCardWrapper
                key={item.id}
                item={item}
                index={i}
                onCardClick={handleCardClick}
                variant={variant}
              />
            ))}
          </div>
        )}

        {/* Load more */}
        {!isLoading && remainingCount > 0 && (
          <FeedContinuationTeaser
            remainingCount={remainingCount}
            onReveal={handleLoadMore}
            variant={variant}
            isLoading={isFetching}
          />
        )}
      </div>
    </section>
  );
}
