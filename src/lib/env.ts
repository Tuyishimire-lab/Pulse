export function getEnv(key: string, required: boolean = true): string {
  const value = process.env[key];
  if (!value && required) {
    if (process.env.NODE_ENV !== 'production') {
      console.warn(`[env] Missing environment variable: ${key}`);
      return '';
    }
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value || '';
}

export function getOptionalEnv(key: string, defaultValue: string = ''): string {
  return process.env[key] || defaultValue;
}
