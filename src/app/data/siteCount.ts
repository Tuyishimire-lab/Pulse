/**
 * Authoritative catalog size constant.
 * Isolated in a decoupled scalar module to guarantee bundler tree-shaking
 * and prevent bundling the 50 KB SITES array into client chunks.
 */
export const SITE_COUNT = 100;
