// Real country metadata for /top-sites/[country] SEO pages
// Internet user stats sourced from DataReportal / Statista 2024-2026 reports

export interface CountryData {
  slug: string;
  name: string;
  cfCode: string;   // Cloudflare Radar location code
  flag?: string;     // optional emoji flag
  internetUsers: string;
  internetPenetration: string;
  /** A genuine 2-sentence insight using publicly available internet stats */
  insight: string;
  /** Notable country-specific behaviour not reflected in global rankings */
  localNote: string;
  /** Site IDs to pin at the top (country-specific ranking overrides) */
  pinnedSiteIds?: string[];
}

export const COUNTRIES: CountryData[] = [
  {
    slug: 'united-states',
    name: 'United States',
    cfCode: 'US',
        internetUsers: '311 million',
    internetPenetration: '92%',
    insight:
      'The United States has one of the world\'s most advanced internet ecosystems, with 311 million users generating roughly 20% of all global web traffic. Americans spend an average of 7 hours online per day, making Google, YouTube, and Amazon the dominant platforms by a large margin.',
    localNote:
      'Reddit and LinkedIn rank significantly higher in the US than globally, driven by the country\'s strong developer and professional communities.',
    pinnedSiteIds: ['google', 'youtube', 'facebook', 'instagram', 'chatgpt', 'reddit', 'wikipedia', 'x', 'amazon', 'linkedin'],
  },
  {
    slug: 'india',
    name: 'India',
    cfCode: 'IN',
        internetUsers: '900 million',
    internetPenetration: '63%',
    insight:
      'India is the world\'s second-largest internet market with over 900 million users, driven by the explosion of affordable mobile data. YouTube is the single most-watched platform in India, with over 500 million monthly users, while WhatsApp is used by 500 million people for daily communication.',
    localNote:
      'Mobile devices account for over 78% of all internet traffic in India. Google and YouTube consistently outperform Facebook due to video consumption habits.',
    pinnedSiteIds: ['google', 'youtube', 'facebook', 'instagram', 'chatgpt', 'wikipedia', 'x', 'amazon', 'reddit', 'linkedin'],
  },
  {
    slug: 'brazil',
    name: 'Brazil',
    cfCode: 'BR',
        internetUsers: '165 million',
    internetPenetration: '77%',
    insight:
      'Brazil is Latin America\'s largest internet market with 165 million connected users who average 9 hours online per day, one of the highest averages in the world. Social media dominates, with Instagram and TikTok seeing particularly high engagement relative to the global average.',
    localNote:
      'Brazilians are among the world\'s heaviest social media users. TikTok and Instagram rank substantially higher in Brazil than in global rankings.',
    pinnedSiteIds: ['google', 'youtube', 'facebook', 'instagram', 'chatgpt', 'tiktok', 'x', 'wikipedia', 'reddit', 'amazon'],
  },
  {
    slug: 'united-kingdom',
    name: 'United Kingdom',
    cfCode: 'GB',
        internetUsers: '67 million',
    internetPenetration: '97%',
    insight:
      'The United Kingdom has a 97% internet penetration rate, one of the highest in the world, with 67 million active users. The BBC website is among the top 5 most visited UK-origin sites, while streaming platforms like Netflix and Twitch see above-average usage compared to the global benchmark.',
    localNote:
      'The UK has strong digital media consumption habits. BBC News drives significant traffic to news and media sites not reflected in the global top 20.',
    pinnedSiteIds: ['google', 'youtube', 'facebook', 'instagram', 'chatgpt', 'wikipedia', 'amazon', 'reddit', 'x', 'netflix'],
  },
  {
    slug: 'germany',
    name: 'Germany',
    cfCode: 'DE',
        internetUsers: '75 million',
    internetPenetration: '90%',
    insight:
      'Germany is Europe\'s largest internet market with 75 million users and a strong emphasis on data privacy. DuckDuckGo\'s market share in Germany is roughly 3× higher than the global average, reflecting German users\' preference for privacy-respecting alternatives to Google.',
    localNote:
      'Privacy is a cultural priority in Germany. DuckDuckGo, ProtonMail, and VPN services are disproportionately popular compared to global benchmarks.',
    pinnedSiteIds: ['google', 'youtube', 'wikipedia', 'facebook', 'instagram', 'chatgpt', 'amazon', 'reddit', 'x', 'duckduckgo'],
  },
  {
    slug: 'france',
    name: 'France',
    cfCode: 'FR',
        internetUsers: '57 million',
    internetPenetration: '86%',
    insight:
      'France has 57 million internet users and a highly engaged social media population. TikTok\'s French user base grew by 40% between 2023 and 2026, while YouTube remains the dominant video platform with over 50 million monthly French viewers.',
    localNote:
      'French internet users spend significantly more time on YouTube and TikTok than the European average. Pinterest is also disproportionately popular in France.',
    pinnedSiteIds: ['google', 'youtube', 'facebook', 'instagram', 'chatgpt', 'tiktok', 'wikipedia', 'x', 'amazon', 'netflix'],
  },
  {
    slug: 'japan',
    name: 'Japan',
    cfCode: 'JP',
        internetUsers: '100 million',
    internetPenetration: '85%',
    insight:
      'Japan has 100 million internet users with one of the world\'s highest average connection speeds. Yahoo Japan, a separate entity from Yahoo.com, is consistently among the top 3 most visited sites in Japan, a unique quirk not reflected in global rankings.',
    localNote:
      'Yahoo Japan operates independently and is a top-3 website in Japan. LINE (messaging) and Niconico (video) are culturally dominant platforms.',
    pinnedSiteIds: ['google', 'youtube', 'yahoo', 'wikipedia', 'amazon', 'instagram', 'x', 'facebook', 'chatgpt', 'netflix'],
  },
  {
    slug: 'canada',
    name: 'Canada',
    cfCode: 'CA',
        internetUsers: '36 million',
    internetPenetration: '94%',
    insight:
      'Canada ranks among the world\'s most connected nations with a 94% internet penetration rate and 36 million active users. Reddit sees above-average traffic from Canadian users, who are among the platform\'s most active demographics globally.',
    localNote:
      'Canadians are heavy Reddit users relative to population, ranking in the top 3 countries by Reddit traffic. Twitch is also above the global average.',
    pinnedSiteIds: ['google', 'youtube', 'facebook', 'instagram', 'chatgpt', 'wikipedia', 'amazon', 'reddit', 'x', 'netflix'],
  },
  {
    slug: 'australia',
    name: 'Australia',
    cfCode: 'AU',
        internetUsers: '24 million',
    internetPenetration: '91%',
    insight:
      'Australia has 24 million internet users with a 91% penetration rate and excellent fixed broadband infrastructure. Australians are among the highest per-capita users of streaming services, with Netflix penetration among the highest in the Asia-Pacific region.',
    localNote:
      'Streaming (Netflix, YouTube, Twitch) and Reddit are disproportionately popular in Australia relative to the country\'s population size.',
    pinnedSiteIds: ['google', 'youtube', 'facebook', 'instagram', 'chatgpt', 'wikipedia', 'amazon', 'reddit', 'x', 'netflix'],
  },
  {
    slug: 'mexico',
    name: 'Mexico',
    cfCode: 'MX',
        internetUsers: '96 million',
    internetPenetration: '76%',
    insight:
      'Mexico has 96 million internet users, making it Latin America\'s second-largest market after Brazil. Facebook and YouTube account for the majority of social media time, while WhatsApp is the primary messaging platform for over 88 million Mexican users.',
    localNote:
      'Mexico has a very young internet population, over 60% of users are under 35, driving strong growth in TikTok and Instagram traffic.',
    pinnedSiteIds: ['google', 'youtube', 'facebook', 'instagram', 'chatgpt', 'tiktok', 'x', 'wikipedia', 'amazon', 'reddit'],
  },
  {
    slug: 'south-korea',
    name: 'South Korea',
    cfCode: 'KR',
        internetUsers: '50 million',
    internetPenetration: '97%',
    insight:
      'South Korea boasts a 97% internet penetration rate and the world\'s fastest average broadband speed at over 200 Mbps. Gaming and streaming are dominant use cases, with platforms like YouTube, Netflix, and gaming sites consistently in the top 10.',
    localNote:
      'Naver (a Korean search engine) and Kakao dominate locally but are not in the global top 100. Among global sites, YouTube and Netflix are exceptionally popular.',
    pinnedSiteIds: ['google', 'youtube', 'instagram', 'facebook', 'netflix', 'x', 'wikipedia', 'twitch', 'chatgpt', 'reddit'],
  },
  {
    slug: 'indonesia',
    name: 'Indonesia',
    cfCode: 'ID',
        internetUsers: '212 million',
    internetPenetration: '77%',
    insight:
      'Indonesia is Southeast Asia\'s largest internet market with 212 million users, and one of the world\'s fastest-growing digital economies. TikTok was founded with Indonesia as a primary growth market, and it remains one of the top 3 apps in the country.',
    localNote:
      'TikTok, Instagram, and Facebook are exceptionally dominant in Indonesia, reflecting the country\'s mobile-first internet culture and young population.',
    pinnedSiteIds: ['google', 'youtube', 'facebook', 'instagram', 'chatgpt', 'tiktok', 'wikipedia', 'x', 'amazon', 'reddit'],
  },
  {
    slug: 'nigeria',
    name: 'Nigeria',
    cfCode: 'NG',
        internetUsers: '122 million',
    internetPenetration: '55%',
    insight:
      'Nigeria is Africa\'s largest internet market with 122 million users growing rapidly on the back of mobile connectivity. Facebook and Instagram are the dominant social platforms, while YouTube sees strong growth driven by Nigerian-produced content and entertainment.',
    localNote:
      'Nigeria has one of the world\'s fastest-growing internet user bases. Facebook, Instagram, and WhatsApp are the most-used platforms, all mobile-first.',
    pinnedSiteIds: ['google', 'youtube', 'facebook', 'instagram', 'chatgpt', 'x', 'wikipedia', 'tiktok', 'reddit', 'amazon'],
  },
  {
    slug: 'argentina',
    name: 'Argentina',
    cfCode: 'AR',
        internetUsers: '43 million',
    internetPenetration: '92%',
    insight:
      'Argentina has 43 million internet users with a 92% penetration rate, the highest in South America alongside Chile. Argentinians are highly active on social media, spending an average of 3.5 hours per day on social platforms, which is among the highest in Latin America.',
    localNote:
      'Argentina has unusually high engagement with Twitter/X for its population size, driven by political discourse. YouTube and Instagram are also above regional averages.',
    pinnedSiteIds: ['google', 'youtube', 'facebook', 'instagram', 'chatgpt', 'x', 'wikipedia', 'tiktok', 'reddit', 'amazon'],
  },

  // ── 10 New International Expansion Markets ─────────────────────────────
  {
    slug: 'spain',
    name: 'Spain',
    cfCode: 'ES',
        internetUsers: '45 million',
    internetPenetration: '94%',
    insight:
      'Spain has 45 million active internet users with a 94% penetration rate. WhatsApp and Instagram lead digital messaging and social engagement across all age groups, while Amazon ES is the country\'s dominant e-commerce destination.',
    localNote:
      'Spanish internet users demonstrate extremely high mobile social adoption. Twitch enjoys higher per-capita viewership in Spain than anywhere else in Western Europe thanks to top Spanish creators.',
    pinnedSiteIds: ['google', 'youtube', 'facebook', 'instagram', 'chatgpt', 'wikipedia', 'amazon', 'x', 'twitch', 'tiktok'],
  },
  {
    slug: 'italy',
    name: 'Italy',
    cfCode: 'IT',
        internetUsers: '51 million',
    internetPenetration: '86%',
    insight:
      'Italy has 51 million connected users with high digital news and social media consumption. Amazon and eBay lead online retail, while news platforms drive substantial daily traffic.',
    localNote:
      'Italian users rely heavily on WhatsApp and Facebook for news distribution. E-commerce adoption has grown over 25% YoY post-2024.',
    pinnedSiteIds: ['google', 'youtube', 'facebook', 'instagram', 'chatgpt', 'wikipedia', 'amazon', 'x', 'ebay', 'tiktok'],
  },
  {
    slug: 'netherlands',
    name: 'Netherlands',
    cfCode: 'NL',
        internetUsers: '16 million',
    internetPenetration: '96%',
    insight:
      'The Netherlands is one of Europe\'s most digitally mature economies with a 96% penetration rate and ultra-fast fiber infrastructure. Tech adoption is exceptionally fast, with AI assistants gaining rapid traction in work and education.',
    localNote:
      'Dutch users exhibit high tech literacy. Developer platforms like GitHub and Stack Overflow receive significantly above-average per-capita visits in the Netherlands.',
    pinnedSiteIds: ['google', 'youtube', 'wikipedia', 'facebook', 'instagram', 'chatgpt', 'linkedin', 'github', 'amazon', 'reddit'],
  },
  {
    slug: 'sweden',
    name: 'Sweden',
    cfCode: 'SE',
        internetUsers: '9.8 million',
    internetPenetration: '97%',
    insight:
      'Sweden features a 97% internet penetration rate and leads Europe in digital payment adoption and SaaS tool usage. Spotify, founded in Stockholm, remains a national point of pride and key traffic driver.',
    localNote:
      'Swedish users are early adopters of modern fintech and developer tools. Spotify, Klarna, and GitHub rank higher in Sweden than global averages.',
    pinnedSiteIds: ['google', 'youtube', 'spotify', 'wikipedia', 'facebook', 'instagram', 'chatgpt', 'linkedin', 'github', 'reddit'],
  },
  {
    slug: 'poland',
    name: 'Poland',
    cfCode: 'PL',
        internetUsers: '37 million',
    internetPenetration: '88%',
    insight:
      'Poland represents Central Europe\'s largest digital economy with 37 million connected users. E-commerce and news portals drive huge daily engagement alongside video streaming.',
    localNote:
      'Poland has a vibrant developer ecosystem. Tech platforms like GitHub and local e-commerce services record heavy engagement.',
    pinnedSiteIds: ['google', 'youtube', 'facebook', 'instagram', 'chatgpt', 'wikipedia', 'allegro', 'x', 'github', 'reddit'],
  },
  {
    slug: 'singapore',
    name: 'Singapore',
    cfCode: 'SG',
        internetUsers: '5.4 million',
    internetPenetration: '96%',
    insight:
      'Singapore is Asia\'s premier financial and tech hub, boasting near-universal gigabit broadband connectivity. Business tools, AI platforms, and global finance portals drive exceptional traffic volume.',
    localNote:
      'Singaporeans are power users of professional networks, AI tools, and fintech platforms. LinkedIn, ChatGPT, and TradingView rank among the top visited sites.',
    pinnedSiteIds: ['google', 'youtube', 'facebook', 'instagram', 'chatgpt', 'linkedin', 'wikipedia', 'amazon', 'tradingview', 'github'],
  },
  {
    slug: 'south-africa',
    name: 'South Africa',
    cfCode: 'ZA',
        internetUsers: '43 million',
    internetPenetration: '72%',
    insight:
      'South Africa leads the African continent in digital banking and mobile internet adoption with 43 million active users. Facebook, YouTube, and TikTok dominate online entertainment.',
    localNote:
      'Mobile internet accounts for over 82% of web traffic in South Africa. Social platforms and news outlets account for the majority of daily sessions.',
    pinnedSiteIds: ['google', 'youtube', 'facebook', 'instagram', 'chatgpt', 'tiktok', 'wikipedia', 'x', 'news24', 'linkedin'],
  },
  {
    slug: 'turkey',
    name: 'Turkey',
    cfCode: 'TR',
        internetUsers: '74 million',
    internetPenetration: '87%',
    insight:
      'Turkey has 74 million internet users characterized by extremely high social media engagement and mobile activity. E-commerce and news portals record millions of daily visits.',
    localNote:
      'Instagram and X (Twitter) see exceptionally high daily active user engagement in Turkey relative to global averages.',
    pinnedSiteIds: ['google', 'youtube', 'instagram', 'facebook', 'chatgpt', 'x', 'wikipedia', 'trendyol', 'tiktok', 'eksi'],
  },
  {
    slug: 'philippines',
    name: 'Philippines',
    cfCode: 'PH',
        internetUsers: '85 million',
    internetPenetration: '73%',
    insight:
      'The Philippines is known as the social media capital of the world, with 85 million users spending an average of over 3.8 hours daily on social platforms.',
    localNote:
      'Facebook and Messenger serve as the primary internet interface for millions of Filipinos. YouTube and TikTok dominate mobile video watch time.',
    pinnedSiteIds: ['google', 'youtube', 'facebook', 'instagram', 'chatgpt', 'tiktok', 'wikipedia', 'x', 'shopee', 'lazada'],
  },
  {
    slug: 'vietnam',
    name: 'Vietnam',
    cfCode: 'VN',
        internetUsers: '78 million',
    internetPenetration: '79%',
    insight:
      'Vietnam has 78 million internet users experiencing rapid digital economy expansion driven by mobile e-commerce and social video.',
    localNote:
      'Facebook, Zalo, and TikTok lead daily internet activity in Vietnam, while e-commerce platforms like Shopee see massive transaction traffic.',
    pinnedSiteIds: ['google', 'youtube', 'facebook', 'tiktok', 'instagram', 'chatgpt', 'wikipedia', 'shopee', 'x', 'zalo'],
  },
];

export function getCountryBySlug(slug: string): CountryData | undefined {
  return COUNTRIES.find((c) => c.slug === slug);
}

export const COUNTRY_SLUGS = COUNTRIES.map((c) => c.slug);
