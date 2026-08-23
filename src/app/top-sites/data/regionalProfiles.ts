// Regional profiles for country-specific site rankings.
// Used as Tier-2 fallback when Cloudflare Radar has no data for a country.
// Each region has a curated 20-site list appropriate to that region's internet habits.

// Globally irrelevant sites excluded from the generic fallback (Tier 3)
export const GLOBALLY_IRRELEVANT = new Set([
  'baidu', 'yandex', 'taobao', 'qq', 'weibo', 'vk', 'rakuten', 'naver',
  'bilibili', 'jd', 'tieba', '360', 'sohu', 'sina', 'youku',
]);

// -------------------------------------------------------------------
// 6 Regional Profiles - curated for each region's actual internet mix
// -------------------------------------------------------------------
export const REGIONAL_PROFILES: Record<string, string[]> = {
  // Sub-Saharan Africa: Facebook/WhatsApp dominant, TikTok rising, no Baidu
  'sub-saharan-africa': [
    'google', 'youtube', 'facebook', 'instagram', 'tiktok',
    'x', 'chatgpt', 'wikipedia', 'whatsapp', 'reddit',
    'netflix', 'microsoft', 'spotify', 'discord', 'linkedin',
    'amazon', 'pinterest', 'twitch', 'github', 'bing',
  ],
  // Middle East & North Africa: Snapchat/Instagram high, WhatsApp primary messaging
  'middle-east-north-africa': [
    'google', 'youtube', 'facebook', 'instagram', 'x',
    'tiktok', 'chatgpt', 'wikipedia', 'snapchat', 'whatsapp',
    'netflix', 'amazon', 'microsoft', 'reddit', 'linkedin',
    'spotify', 'discord', 'ebay', 'pinterest', 'bing',
  ],
  // South & Southeast Asia: mobile-first, WhatsApp/TikTok/Facebook dominant
  'south-southeast-asia': [
    'google', 'youtube', 'facebook', 'instagram', 'tiktok',
    'chatgpt', 'wikipedia', 'x', 'whatsapp', 'reddit',
    'netflix', 'amazon', 'microsoft', 'discord', 'spotify',
    'linkedin', 'pinterest', 'ebay', 'twitch', 'bing',
  ],
  // Eastern Europe: close to global but no Baidu; Yandex only relevant in Russia/CIS
  'eastern-europe': [
    'google', 'youtube', 'facebook', 'instagram', 'chatgpt',
    'wikipedia', 'amazon', 'x', 'netflix', 'microsoft',
    'linkedin', 'discord', 'spotify', 'reddit', 'twitch',
    'github', 'ebay', 'bing', 'tiktok', 'pinterest',
  ],
  // Russia & CIS: Yandex and VK ARE relevant here
  'russia-cis': [
    'google', 'yandex', 'youtube', 'vk', 'facebook',
    'instagram', 'x', 'chatgpt', 'wikipedia', 'tiktok',
    'netflix', 'microsoft', 'discord', 'reddit', 'spotify',
    'linkedin', 'twitch', 'github', 'bing', 'amazon',
  ],
  // East Asia (non-China): YouTube, LINE, KakaoTalk, Naver - no Baidu
  'east-asia': [
    'google', 'youtube', 'instagram', 'facebook', 'tiktok',
    'x', 'chatgpt', 'wikipedia', 'netflix', 'naver',
    'microsoft', 'discord', 'reddit', 'spotify', 'linkedin',
    'twitch', 'github', 'amazon', 'bing', 'bilibili',
  ],
  // Latin America: WhatsApp primary, TikTok/Instagram high, MercadoLibre e-commerce
  'latin-america': [
    'google', 'youtube', 'facebook', 'instagram', 'tiktok',
    'chatgpt', 'x', 'wikipedia', 'whatsapp', 'reddit',
    'amazon', 'netflix', 'microsoft', 'linkedin', 'discord',
    'spotify', 'pinterest', 'twitch', 'ebay', 'bing',
  ],
  // Western Europe / Oceania / North America: global mix, no Baidu/Yandex
  'western-world': [
    'google', 'youtube', 'facebook', 'instagram', 'chatgpt',
    'wikipedia', 'amazon', 'reddit', 'x', 'netflix',
    'microsoft', 'linkedin', 'discord', 'spotify', 'twitch',
    'github', 'ebay', 'bing', 'tiktok', 'pinterest',
  ],
};

// -------------------------------------------------------------------
// cfCode → region mapping (ISO 3166-1 alpha-2)
// -------------------------------------------------------------------
const REGION_MAP: Record<string, string> = {
  // Sub-Saharan Africa
  RW:'sub-saharan-africa', KE:'sub-saharan-africa', TZ:'sub-saharan-africa',
  UG:'sub-saharan-africa', ET:'sub-saharan-africa', GH:'sub-saharan-africa',
  SN:'sub-saharan-africa', CI:'sub-saharan-africa', CM:'sub-saharan-africa',
  ZM:'sub-saharan-africa', ZW:'sub-saharan-africa', MZ:'sub-saharan-africa',
  MG:'sub-saharan-africa', MU:'sub-saharan-africa', BJ:'sub-saharan-africa',
  TG:'sub-saharan-africa', GA:'sub-saharan-africa', CG:'sub-saharan-africa',
  CD:'sub-saharan-africa', AO:'sub-saharan-africa', NA:'sub-saharan-africa',
  BW:'sub-saharan-africa', SZ:'sub-saharan-africa', LS:'sub-saharan-africa',
  MW:'sub-saharan-africa', ZA:'sub-saharan-africa', NG:'sub-saharan-africa',

  // Middle East & North Africa
  EG:'middle-east-north-africa', MA:'middle-east-north-africa', DZ:'middle-east-north-africa',
  TN:'middle-east-north-africa', LY:'middle-east-north-africa', SD:'middle-east-north-africa',
  SA:'middle-east-north-africa', AE:'middle-east-north-africa', QA:'middle-east-north-africa',
  KW:'middle-east-north-africa', BH:'middle-east-north-africa', OM:'middle-east-north-africa',
  IQ:'middle-east-north-africa', SY:'middle-east-north-africa', JO:'middle-east-north-africa',
  LB:'middle-east-north-africa', PS:'middle-east-north-africa', YE:'middle-east-north-africa',
  IR:'middle-east-north-africa', IL:'middle-east-north-africa',

  // South & Southeast Asia
  IN:'south-southeast-asia', PK:'south-southeast-asia', BD:'south-southeast-asia',
  LK:'south-southeast-asia', NP:'south-southeast-asia', MM:'south-southeast-asia',
  KH:'south-southeast-asia', LA:'south-southeast-asia', VN:'south-southeast-asia',
  TH:'south-southeast-asia', MY:'south-southeast-asia', ID:'south-southeast-asia',
  PH:'south-southeast-asia', SG:'south-southeast-asia', BN:'south-southeast-asia',
  TL:'south-southeast-asia',

  // East Asia (non-China)
  JP:'east-asia', KR:'east-asia', TW:'east-asia', HK:'east-asia', MO:'east-asia',
  MN:'east-asia',

  // Russia & CIS
  RU:'russia-cis', BY:'russia-cis', KZ:'russia-cis', UA:'russia-cis',
  UZ:'russia-cis', TM:'russia-cis', TJ:'russia-cis', KG:'russia-cis',
  AZ:'russia-cis', AM:'russia-cis', GE:'russia-cis', MD:'russia-cis',

  // Eastern Europe
  PL:'eastern-europe', RO:'eastern-europe', CZ:'eastern-europe', SK:'eastern-europe',
  HU:'eastern-europe', BG:'eastern-europe', HR:'eastern-europe', RS:'eastern-europe',
  SI:'eastern-europe', BA:'eastern-europe', MK:'eastern-europe', AL:'eastern-europe',
  LT:'eastern-europe', LV:'eastern-europe', EE:'eastern-europe',

  // Latin America
  BR:'latin-america', MX:'latin-america', AR:'latin-america', CO:'latin-america',
  CL:'latin-america', PE:'latin-america', VE:'latin-america', EC:'latin-america',
  BO:'latin-america', PY:'latin-america', UY:'latin-america', CR:'latin-america',
  GT:'latin-america', HN:'latin-america', SV:'latin-america', NI:'latin-america',
  PA:'latin-america', DO:'latin-america', CU:'latin-america', HT:'latin-america',
  JM:'latin-america', TT:'latin-america',

  // Western World (default for Western Europe, Oceania, North America, etc.)
  US:'western-world', CA:'western-world', GB:'western-world', DE:'western-world',
  FR:'western-world', ES:'western-world', IT:'western-world', NL:'western-world',
  BE:'western-world', CH:'western-world', AT:'western-world', SE:'western-world',
  NO:'western-world', DK:'western-world', FI:'western-world', PT:'western-world',
  IE:'western-world', GR:'western-world', CY:'western-world', MT:'western-world',
  LU:'western-world', IS:'western-world', AU:'western-world', NZ:'western-world',
};

/** Returns the regional profile site IDs for a given ISO country code. */
export function getRegionalProfile(cfCode: string): string[] {
  const region = REGION_MAP[cfCode.toUpperCase()] ?? 'western-world';
  return REGIONAL_PROFILES[region] ?? REGIONAL_PROFILES['western-world'];
}

/** Returns the region name for a country code (for display/debugging). */
export function getRegionName(cfCode: string): string {
  return REGION_MAP[cfCode.toUpperCase()] ?? 'western-world';
}
