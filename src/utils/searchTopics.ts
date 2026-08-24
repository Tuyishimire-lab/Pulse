/**
 * Returns related topic labels for a site based on its category.
 * These are editorial category associations, NOT real search-query data.
 * They are derived from the site's Pulse category tag and are the same
 * for all sites in the same category.
 *
 * Shared utility used by both the homepage and SiteDetailModal.
 */
export function getRelatedTopics(site: { name: string; category: string }) {
  switch (site.category) {
    case 'search':       return ['Translate', 'Maps', 'Images', 'Scholar', 'Drive'];
    case 'social':       return ['Stories', 'Feed', 'Groups', 'Photos', 'Messenger'];
    case 'ai':           return ['API', 'Prompts', 'Models', 'Plugins', 'Pricing'];
    case 'ecommerce':
    case 'shopping':     return ['Prime', 'Deals', 'Tracking', 'Support', 'Shipping'];
    case 'dev':          return ['Docs', 'API', 'Tutorials', 'Libraries', 'GitHub'];
    case 'finance':      return ['Pricing', 'Stock Price', 'Payments', 'Calculator', 'Security'];
    case 'news':
    case 'media':        return ['Live Feed', 'Today', 'Opinion', 'Videos', 'Podcasts'];
    case 'reference':    return ['Definitions', 'History', 'Wiki', 'Facts', 'Citations'];
    case 'entertainment':return ['Stream', 'Trailer', 'Music', 'TV', 'Releases'];
    default:             return ['Website', 'Review', 'Support', 'API', 'Pricing'];
  }
}

/** @deprecated Use getRelatedTopics — avoids misleading "searched" connotation */
export const getMostSearchedTopics = getRelatedTopics;
