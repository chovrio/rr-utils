export class Logger {
  info(...res: any) {
    console.info('[info]', ...res);
  }

  warn(...res: any) {
    console.warn('[warn]', ...res);
  }

  error(...res: any) {
    console.error('[error]', ...res);
  }

  debug(...res: any) {
    if (process.env.NODE_ENV === 'development') {
      console.log('[debug]', ...res);
    }
  }
}
