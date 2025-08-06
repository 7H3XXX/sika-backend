import * as crypto from 'crypto';

interface Options {
  size: number;
}

export function getGravatarUrl(email: string, options?: Options) {
  const hash = crypto.hash('sha256', email.trim().toLowerCase());
  return `https://gravatar.com/avatar/${hash}?size=${options?.size ?? 200}`;
}
