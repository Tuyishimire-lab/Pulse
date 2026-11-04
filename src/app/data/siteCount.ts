/**
 * Authoritative catalog size constant (equals SITES.length = 200).
 * Isolated in a decoupled scalar module to guarantee bundler tree-shaking
 * and prevent bundling the SITES array into client chunks.
 */
export const SITE_COUNT = 200;
