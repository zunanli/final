import React, { useEffect, useMemo, useRef, useState } from 'react';
import type { AutocompleteProps, ResultItem } from './types';

// Minimal MVP Autocomplete input with SSR-safe hooks only.
// - Debounce API calls
// - Timeout via AbortController
// - Simple in-memory cache with expiry
// - Basic theming and classNames overrides
// - No external UI libs to avoid SSR issues

type CacheEntry = { items: ResultItem[]; ts: number };

const defaultTheme = {
  textSize: 'text-sm',
  textColor: 'text-gray-900 dark:text-gray-100',
  bgColor: 'bg-white dark:bg-zinc-900',
  highlightColor: 'hover:bg-gray-100 dark:hover:bg-zinc-800',
};

export default function AutocompleteInput(props: AutocompleteProps) {
  const {
    apiUrl,
    maxResults = 8,
    onInput,
    onFocus,
    onBlur,
    onChange,
    onSelect,
    theme = defaultTheme,
    classNames = {},
    renderItem,
    renderEmpty,
    renderLoading,
    minQueryLength = 1,
    debounceMs = 200,
    timeoutMs = 8000,
    resultsSource = 'network-and-cache',
    cacheDurationMs = 5_000,
    mergeResults,
    initialQuery = '',
    initialResults = [],
    placeholder = 'Search…',
    silentRevalidate = true,
  } = props;

  const [query, setQuery] = useState(initialQuery);
  const [results, setResults] = useState<ResultItem[]>(initialResults);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  const debounceTimer = useRef<number | null>(null);
  const cacheRef = useRef<Map<string, CacheEntry>>(new Map());

  const classes = useMemo(() => ({
    root: classNames.root || '',
    input: classNames.input || `w-full px-3 py-2 border rounded ${theme.bgColor} ${theme.textColor} ${theme.textSize}`,
    list: classNames.list || `mt-1 border rounded ${theme.bgColor}`,
    item: classNames.item || `px-3 py-2 cursor-pointer ${theme.highlightColor}`,
    loading: classNames.loading || 'px-3 py-2 text-gray-500',
    empty: classNames.empty || 'px-3 py-2 text-gray-500',
  }), [classNames, theme]);

  useEffect(() => {
    // 低于最小长度：关闭列表并清空结果
    if (query.length < minQueryLength) {
      setResults([]);
      setOpen(false);
      return;
    }

    // 打开列表
    setOpen(true);

    // SWR：先尝试显示缓存，再后台静默重验证
    let hasCache = false;
    const now = Date.now();
    if (resultsSource !== 'network') {
      const cachedExact = cacheRef.current.get(query);
      if (cachedExact && now - cachedExact.ts < cacheDurationMs) {
        setResults(cachedExact.items.slice(0, maxResults));
        hasCache = true;
      }
    }

    // 仅当需要网络时才发起请求
    if (resultsSource === 'cache') return;

    const controller = new AbortController();
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = window.setTimeout(() => {
      const silent = silentRevalidate && hasCache;
      void fetchResults(query, controller, { silent });
    }, debounceMs);

    // 清理：终止上一轮请求与定时器
    return () => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
      controller.abort();
    };
  }, [query]);

  async function fetchResults(q: string, controller: AbortController, opts: { silent?: boolean } = {}) {
    const showLoading = !opts.silent;
    if (showLoading) setLoading(true);
    try {
      const url = new URL(apiUrl, window.location.origin);
      url.searchParams.set('q', q);
      url.searchParams.set('limit', String(maxResults));

      const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
      const resp = await fetch(url.toString(), { signal: controller.signal });
      clearTimeout(timeoutId);

      if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
      const raw = await resp.json();
      const dataRaw: any[] = Array.isArray(raw) ? raw : (raw?.items ?? []);

      // 统一字段：优先 label，其次 text；生成缺失 id 的回退
      const data: ResultItem[] = dataRaw.map((item: any, idx: number) => ({
        id: item.id ?? `${item.text ?? item.label ?? ''}-${idx}`,
        label: item.label ?? item.text ?? '',
        ...item,
      }));

      // 写入缓存（精确查询键），不做客户端过滤/合并
      cacheRef.current.set(q, { items: data, ts: Date.now() });

      setResults(data.slice(0, maxResults));
    } catch (e) {
      if ((e as any)?.name === 'AbortError') return;
      console.error('search failed', e);
    } finally {
      if (showLoading) setLoading(false);
    }
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const v = e.target.value;
    setQuery(v);
    onInput?.(v);
    onChange?.(v);
  }

  function handleFocus() {
    setOpen(true);
    onFocus?.();
  }

  function handleBlur() {
    // Slight delay to allow click on items
    window.setTimeout(() => setOpen(false), 150);
    onBlur?.();
  }

  function handleSelect(item: ResultItem) {
    onSelect?.(item);
    setOpen(false);
  }

  return (
    <div className={classes.root}>
      <input
        type="text"
        value={query}
        onChange={handleChange}
        onFocus={handleFocus}
        onBlur={handleBlur}
        placeholder={placeholder}
        className={classes.input}
      />
      {open && (
        <div className={classes.list}>
          {loading ? (
            renderLoading ? renderLoading() : <div className={classes.loading}>Loading…</div>
          ) : results.length === 0 ? (
            renderEmpty ? renderEmpty() : <div className={classes.empty}>No results</div>
          ) : (
            results.map((item, idx) => (
              <div key={item.id} className={classes.item} onMouseDown={() => handleSelect(item)}>
                {renderItem ? renderItem(item, idx) : <span>{item.label}</span>}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}