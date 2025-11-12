import type React from 'react';

export type ResultItem = {
  id: string;
  label: string;
  [key: string]: any;
};

export type ResultsSource = 'network' | 'cache' | 'network-and-cache';

export type ThemeOpts = {
  textSize?: string;
  textColor?: string;
  bgColor?: string;
  highlightColor?: string;
};

export type ClassNames = {
  root?: string;
  input?: string;
  list?: string;
  item?: string;
  loading?: string;
  empty?: string;
};

export type AutocompleteProps = {
  apiUrl: string;
  maxResults?: number;
  onInput?: (value: string) => void;
  onFocus?: () => void;
  onBlur?: () => void;
  onChange?: (value: string) => void;
  onSelect?: (item: ResultItem) => void;
  theme?: ThemeOpts;
  classNames?: ClassNames;
  renderItem?: (item: ResultItem, index: number) => React.ReactNode;
  renderEmpty?: () => React.ReactNode;
  renderLoading?: () => React.ReactNode;
  minQueryLength?: number;
  debounceMs?: number;
  timeoutMs?: number;
  resultsSource?: ResultsSource;
  cacheDurationMs?: number;
  mergeResults?: (server: ResultItem[], cache: ResultItem[]) => ResultItem[];
  initialQuery?: string;
  initialResults?: ResultItem[];
  placeholder?: string;
  // Whether to revalidate silently when cache is shown (no loading state)
  silentRevalidate?: boolean;
};