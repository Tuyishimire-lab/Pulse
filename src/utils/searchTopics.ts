/**
 * Returns default search topic labels for a site based on its category.
 * Shared utility used by both the homepage and SiteDetailModal.
 */
export function getMostSearchedTopics(site: { name: string; category: string }) {
  switch (site.category) {
    case 'search':       return ['Translate', 'Maps', 'Images', 'Scholar', 'Drive'];
    case 'social':       return ['Stories', 'Feed', 'Groups', 'Photos', 'Messenger'];
    case 'ai':           return ['API', 'Prompts', 'GPT-4', 'Custom GPTs', 'Pricing'];
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
