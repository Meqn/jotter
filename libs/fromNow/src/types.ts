export interface IRelativeTimeOptions {
  future: string;
  past: string;
  s: string[] | string;
  ss: string;
  m: string;
  mm: string;
  h: string;
  hh: string;
  d: string;
  dd: string;
  w: string;
  ww: string;
  M: string;
  MM: string;
  y: string;
  yy: string;
}

export interface IThresholdsOptions {
  ss: number;
  s: number;
  m: number;
  h: number;
  d: number;
  w: number | null;
  M: number;
}

export type DateType = Date | string | number
export interface IOptions {
  locale?: Partial<IRelativeTimeOptions>
  thresholds?: Partial<IThresholdsOptions>
}

export interface IFromFunc {
  (date: DateType): string
  create?: CreateFunc
  locale: (name: 'zh' | 'en' | Partial<IRelativeTimeOptions>, config?: Partial<IRelativeTimeOptions>) => void
  thresholds: (thresholds: Partial<IThresholdsOptions>) => void
}

export type CreateFunc = (options?: {
  locale?: 'zh' | 'en' | Partial<IRelativeTimeOptions>
  thresholds?: Partial<IThresholdsOptions>
}) => IFromFunc
