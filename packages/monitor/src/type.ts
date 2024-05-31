export interface UrlChangeEvent {
  curUrl: UrlObj | undefined;
  prevUrl?: UrlObj;
  origEvent?: Event;
  triggeredBy?: 'both' | 'path' | 'hash';
}

interface UrlObj {
  hash: string;
  host: string;
  hostname: string;
  href: string;
  origin: string;
  pathname: string;
  port: string;
  protocol: string;
  search: string;
}
