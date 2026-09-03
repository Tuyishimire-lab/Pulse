// Pre-defined compare pairs for /compare/[pair] SSG pages
// Each pair targets a high-search-volume query
import { SITES } from '../../data/sites';

export interface ComparePair {
  slug: string;       // e.g. "youtube-vs-tiktok"
  siteAId: string;
  siteBId: string;
  verdict: string;    // "who wins", based on actual traffic data
  context: string;    // 1-sentence context for the comparison
  faq: { q: string; a: string }[];
}

export const COMPARE_PAIRS: ComparePair[] = [
  {
    slug: 'youtube-vs-tiktok',
    siteAId: 'youtube',
    siteBId: 'tiktok',
    verdict: 'YouTube dominates by a massive margin, receiving roughly 12× more monthly visits than TikTok globally. TikTok leads in time-per-session and mobile-first engagement among users under 25.',
    context: 'The battle between long-form and short-form video platforms.',
    faq: [
      { q: 'Does YouTube or TikTok get more traffic?', a: 'YouTube receives approximately 34.8 billion monthly visits compared to TikTok\'s 2.8 billion, making YouTube roughly 12× larger by web traffic. However, TikTok\'s mobile app receives substantially more time-in-app per user.' },
      { q: 'Is TikTok growing faster than YouTube?', a: 'TikTok has grown faster year-over-year since 2020, but YouTube\'s absolute traffic lead is so large that TikTok is unlikely to surpass it on web traffic metrics in the near term.' },
      { q: 'Which platform pays creators more?', a: 'YouTube\'s Partner Program typically generates higher revenue per creator due to its established advertiser ecosystem and longer watch times. TikTok\'s Creator Fund pays significantly less per view.' },
    ],
  },
  {
    slug: 'google-vs-bing',
    siteAId: 'google',
    siteBId: 'bing',
    verdict: 'Google is the undisputed search leader, processing over 90% of global search queries - far more than any rival. The gap between Google and Bing is one of the largest in any major technology market.',
    context: 'The search engine market has been dominated by Google for two decades.',
    faq: [
      { q: 'How much more traffic does Google get than Bing?', a: 'Google receives dramatically more monthly visits than Bing - roughly 70× more by web traffic. You can see the live numbers in the comparison table above.' },
      { q: 'Which search engine is more private?', a: 'DuckDuckGo and Brave Search are considered the most privacy-focused alternatives. Bing does collect user data but offers more privacy controls than Google.' },
      { q: 'Is Google\'s market share declining?', a: 'Google\'s search market share has remained above 90% globally for over a decade. In 2024, it dipped slightly to around 91% amid growing interest in AI search alternatives.' },
    ],
  },
  {
    slug: 'reddit-vs-quora',
    siteAId: 'reddit',
    siteBId: 'quora',
    verdict: 'Reddit receives nearly 5× more monthly traffic than Quora. Reddit\'s community-driven, anonymous format drives stronger engagement and return visits compared to Quora\'s expert Q&A model.',
    context: 'Two very different approaches to community knowledge and Q&A.',
    faq: [
      { q: 'Which gets more traffic, Reddit or Quora?', a: 'Reddit receives approximately 4.8 billion monthly visits versus Quora\'s 700 million, about 5× more traffic. Reddit ranks #7 globally while Quora sits at #24.' },
      { q: 'Is Reddit or Quora better for SEO?', a: 'Both platforms have strong domain authority. Reddit content tends to rank higher in Google\'s AI Overviews due to its emphasis on genuine user opinions, following Google\'s 2023 algorithm updates that explicitly boosted Reddit.' },
      { q: 'Which platform is more trusted?', a: 'Studies show Reddit users perceive the platform as more authentic due to its anonymous, community-voted format. Quora\'s real-name policy results in more professional but sometimes less candid answers.' },
    ],
  },
  {
    slug: 'facebook-vs-instagram',
    siteAId: 'facebook',
    siteBId: 'instagram',
    verdict: 'Facebook still leads Instagram in total web traffic, though Instagram is growing faster and leads in engagement among users under 35. Both are Meta properties competing for different demographics.',
    context: 'Two giants from the same parent company, Meta, competing for attention.',
    faq: [
      { q: 'Which is bigger, Facebook or Instagram?', a: 'Facebook receives more monthly visits than Instagram. However, Instagram has a higher engagement rate and is growing faster among younger demographics. See the live comparison above for current numbers.' },
      { q: 'Is Instagram growing faster than Facebook?', a: 'Yes. Instagram\'s annual traffic growth rate has consistently outpaced Facebook\'s since 2020. Among users aged 18–34, Instagram is now the preferred Meta platform.' },
      { q: 'Which is better for businesses?', a: 'It depends on the business type. Instagram outperforms for visual brands (fashion, food, travel) while Facebook\'s ad targeting and groups remain stronger for local businesses and older demographics.' },
    ],
  },
  {
    slug: 'netflix-vs-youtube',
    siteAId: 'netflix',
    siteBId: 'youtube',
    verdict: 'YouTube receives 17× more web traffic than Netflix, largely because YouTube is free and hosts search-driven content. Netflix wins on subscription revenue and premium original content.',
    context: 'Free ad-supported video vs. subscription premium streaming.',
    faq: [
      { q: 'Does YouTube or Netflix get more traffic?', a: 'YouTube receives approximately 34.8 billion monthly visits versus Netflix\'s 1.9 billion. YouTube\'s free model and massive content library drive far higher web traffic.' },
      { q: 'Which service has more subscribers?', a: 'Netflix reported 270 million paying subscribers in 2024. YouTube Premium has around 80 million paid subscribers, though YouTube\'s free tier has over 2.5 billion logged-in monthly users.' },
      { q: 'Is YouTube replacing Netflix?', a: 'YouTube and Netflix serve different content needs, YouTube excels in user-generated, educational, and short-form content while Netflix leads in scripted premium originals. Both are growing.' },
    ],
  },
  {
    slug: 'amazon-vs-ebay',
    siteAId: 'amazon',
    siteBId: 'ebay',
    verdict: 'Amazon dominates e-commerce traffic with 2.9B monthly visits versus eBay\'s 800M. Amazon\'s Prime ecosystem, faster shipping, and brand trust give it a nearly 4× traffic advantage.',
    context: 'The two largest English-language e-commerce destinations.',
    faq: [
      { q: 'Which gets more traffic, Amazon or eBay?', a: 'Amazon receives approximately 2.9 billion monthly visits compared to eBay\'s 800 million, a 3.6× difference. Amazon ranks #10 globally while eBay is at #22.' },
      { q: 'Is eBay still relevant in 2026?', a: 'Yes. eBay remains the leading marketplace for used goods, collectibles, and auctions. It processes over $75 billion in gross merchandise volume annually, though its growth has slowed compared to Amazon.' },
      { q: 'Which platform is better for sellers?', a: 'Amazon FBA offers better reach and logistics for new products. eBay is preferable for selling used items, vintage goods, or in categories where Amazon has restricted third-party sellers.' },
    ],
  },
  {
    slug: 'chatgpt-vs-google',
    siteAId: 'chatgpt',
    siteBId: 'google',
    verdict: 'Google processes significantly more web traffic than ChatGPT, but ChatGPT\'s growth trajectory is the fastest ever recorded for a consumer app. Google remains the default for information retrieval while ChatGPT leads for generative and reasoning tasks.',
    context: 'The defining rivalry of the current AI era.',
    faq: [
      { q: 'Is ChatGPT taking traffic from Google?', a: 'Some studies suggest ChatGPT has influenced search behaviour, particularly among younger users, but Google\'s overall traffic has not declined measurably. See the live comparison table above for current monthly visit numbers for both platforms.' },
      { q: 'Which AI search is better in 2026?', a: 'Google\'s AI Overviews offer better real-time information and web citations. ChatGPT excels at complex reasoning, writing, and multi-turn conversations where a single answer isn\'t sufficient.' },
      { q: 'How fast did ChatGPT grow?', a: 'ChatGPT reached 100 million users in 2 months - the fastest consumer app growth in history - and has since grown to become one of the most-visited AI platforms on the web.' },
    ],
  },
  {
    slug: 'github-vs-stackoverflow',
    siteAId: 'github',
    siteBId: 'stackoverflow',
    verdict: 'GitHub receives 2.5× more monthly visits than Stack Overflow. GitHub\'s role as a code host makes it indispensable for developers daily, while Stack Overflow is primarily used for problem-solving lookups.',
    context: 'The two essential destinations for software developers worldwide.',
    faq: [
      { q: 'Which do developers visit more, GitHub or Stack Overflow?', a: 'GitHub receives approximately 1.0 billion monthly visits vs Stack Overflow\'s 400 million. GitHub\'s role as a daily coding workspace drives higher and more frequent visits.' },
      { q: 'Is Stack Overflow declining?', a: 'Stack Overflow\'s traffic has declined since 2022 as AI coding assistants (GitHub Copilot, ChatGPT) handle questions that developers previously searched for. However, it remains the largest Q&A platform for programming.' },
      { q: 'What is GitHub used for?', a: 'GitHub is the world\'s largest code hosting platform with over 100 million developers. It\'s used for version control, open-source collaboration, CI/CD pipelines, and project management.' },
    ],
  },
  {
    slug: 'discord-vs-slack',
    siteAId: 'discord',
    siteBId: 'zoom',
    verdict: 'Discord and Slack serve different audiences: Discord dominates gaming and community communication while Slack leads in enterprise workplace messaging. Both have hundreds of millions of users.',
    context: 'Messaging platforms competing across gaming, community, and enterprise.',
    faq: [
      { q: 'Which is bigger, Discord or Slack?', a: 'Discord reports over 500 million registered users and 19 million daily active servers. Slack has approximately 32 million daily active users. Discord leads in total user count; Slack leads in enterprise adoption.' },
      { q: 'Is Discord replacing Slack for teams?', a: 'Some small and medium teams use Discord for its free unlimited message history and voice channels. However, Slack\'s enterprise integrations and compliance features make it the dominant choice for corporate environments.' },
      { q: 'Which is better for communities?', a: 'Discord is purpose-built for communities with server structures, roles, and voice/video channels. It\'s the clear winner for gaming communities, creator fan bases, and NFT/crypto projects.' },
    ],
  },
  {
    slug: 'instagram-vs-tiktok',
    siteAId: 'instagram',
    siteBId: 'tiktok',
    verdict: 'Instagram leads TikTok in total web traffic, but TikTok\'s engagement rate per user and time-in-app are significantly higher, especially among Gen Z. Both platforms continue to grow rapidly.',
    context: 'The short-form visual content wars between Meta and ByteDance.',
    faq: [
      { q: 'Which is more popular, Instagram or TikTok?', a: 'Instagram has more web traffic and more total users (~2 billion vs ~1.5 billion). However, TikTok users spend more time per session and TikTok is growing faster among under-25s. See the live numbers above.' },
      { q: 'Which is better for influencers?', a: 'Both platforms offer strong monetization. TikTok\'s algorithm provides better organic reach for new creators. Instagram offers more established brand partnership infrastructure and higher CPM rates for sponsored content.' },
      { q: 'Is TikTok overtaking Instagram?', a: 'TikTok has surpassed Instagram in time-spent-per-user metrics and is the preferred platform for Gen Z content creation. However, Instagram maintains larger absolute user numbers and stronger advertiser demand.' },
    ],
  },
  {
    slug: 'linkedin-vs-x',
    siteAId: 'linkedin',
    siteBId: 'x',
    verdict: 'X (Twitter) currently receives more raw web traffic than LinkedIn, but LinkedIn generates stronger professional engagement and B2B advertising returns due to its high-intent professional audience.',
    context: 'Professional networking vs. real-time public discourse.',
    faq: [
      { q: 'Which gets more traffic, LinkedIn or Twitter/X?', a: 'X (Twitter) receives more monthly visits than LinkedIn - see the live comparison above for current figures. However, LinkedIn\'s users have higher average income and professional intent, making it more valuable for B2B marketing.' },
      { q: 'Is LinkedIn better than Twitter for business?', a: 'For B2B lead generation and professional networking, LinkedIn consistently outperforms Twitter. LinkedIn ads generate 277% more leads than Facebook ads for B2B companies, according to HubSpot research.' },
      { q: 'Has Twitter/X lost users since Elon Musk\'s acquisition?', a: 'X experienced notable advertiser departures in 2022–2023, but user traffic has largely stabilised. The platform rebranded from Twitter to X in July 2023 and continues to attract significant daily active users globally.' },
    ],
  },
  {
    slug: 'duckduckgo-vs-google',
    siteAId: 'duckduckgo',
    siteBId: 'google',
    verdict: 'Google processes over 100× more searches than DuckDuckGo, but DuckDuckGo has carved out a loyal audience of privacy-conscious users and grew from 30M to 100M+ daily queries between 2020 and 2024.',
    context: 'Privacy-focused search versus the dominant search giant.',
    faq: [
      { q: 'How much traffic does DuckDuckGo get vs Google?', a: 'Google receives dramatically more monthly visits than DuckDuckGo - see the live comparison table above for current numbers. Google processes over 8.5 billion searches per day versus DuckDuckGo\'s approximately 100 million.' },
      { q: 'Is DuckDuckGo actually private?', a: 'DuckDuckGo does not store IP addresses, search histories, or create user profiles. It uses Microsoft\'s Bing for some results but applies privacy protections. It is significantly more private than Google by design.' },
      { q: 'Which countries use DuckDuckGo the most?', a: 'DuckDuckGo is disproportionately popular in the United States, Germany, and the United Kingdom, countries with strong digital privacy awareness. Germany in particular has 3× the global DuckDuckGo market share average.' },
    ],
  },
  {
    slug: 'spotify-vs-youtube',
    siteAId: 'spotify',
    siteBId: 'youtube',
    verdict: 'YouTube receives 65× more monthly web visits than Spotify. However, Spotify dominates audio streaming with 600M+ users while YouTube Music has about 100M subscribers.',
    context: 'The two dominant music and audio streaming platforms.',
    faq: [
      { q: 'Which is bigger, Spotify or YouTube?', a: 'YouTube receives approximately 34.8 billion monthly web visits versus Spotify\'s 500 million. YouTube dominates total traffic, but Spotify leads in dedicated music streaming with 602 million active users.' },
      { q: 'Is Spotify or YouTube better for music?', a: 'Spotify offers superior music discovery algorithms, offline listening, and podcast integration. YouTube provides free access to almost every song and music video without a subscription.' },
      { q: 'How many subscribers does Spotify Premium have?', a: 'Spotify had 239 million Premium subscribers as of Q1 2024, representing approximately 40% of its total user base.' },
    ],
  },
  {
    slug: 'zoom-vs-microsoft',
    siteAId: 'zoom',
    siteBId: 'microsoft',
    verdict: 'Microsoft.com receives 2× more web traffic than Zoom, driven by its broader product portfolio. Microsoft Teams has surpassed Zoom in enterprise adoption with 320M daily active users vs Zoom\'s 300M.',
    context: 'Video conferencing and workplace productivity platforms.',
    faq: [
      { q: 'Is Zoom or Microsoft Teams more popular?', a: 'Microsoft Teams reported 320 million daily active users in 2024 vs Zoom\'s 300 million. Teams leads in enterprise adoption due to its tight integration with Microsoft 365.' },
      { q: 'Did Zoom lose users after COVID?', a: 'Zoom\'s traffic peaked in 2020 during lockdowns. While usage declined slightly, Zoom retained most enterprise customers and pivoted to an AI-first strategy with Zoom AI Companion.' },
      { q: 'Which video platform is better for businesses?', a: 'Teams is better for organisations already using Microsoft 365. Zoom remains popular for external meetings and webinars due to its ease of use and cross-platform reliability.' },
    ],
  },
  {
    slug: 'twitch-vs-youtube',
    siteAId: 'twitch',
    siteBId: 'youtube',
    verdict: 'YouTube receives 30× more monthly traffic than Twitch, but Twitch dominates live gaming streams with 35 million daily visitors and 9 million unique monthly streamers.',
    context: 'Live gaming and streaming, Twitch\'s home turf versus YouTube\'s scale.',
    faq: [
      { q: 'Which is bigger, Twitch or YouTube for gaming?', a: 'YouTube receives 34.8 billion monthly visits vs Twitch\'s 1.1 billion, but Twitch is the primary destination for live gaming with over 7 million active streamers and 35 million daily visitors.' },
      { q: 'Is YouTube Live competing with Twitch?', a: 'Yes. YouTube Gaming has attracted major streamers like Ninja and Shroud. However, Twitch maintains its community advantage as the cultural home of live game streaming.' },
      { q: 'Which platform pays streamers more?', a: 'Top streamers often earn more on YouTube due to higher ad revenue rates and Super Chat. Mid-tier streamers typically earn more on Twitch through subscriptions and Bits from dedicated communities.' },
    ],
  },
  {
    slug: 'reddit-vs-x',
    siteAId: 'reddit',
    siteBId: 'x',
    verdict: 'Reddit and X (Twitter) are closely matched in web traffic, but Reddit\'s SEO authority has surged dramatically since 2023 due to Google prioritising community discussions in its algorithm updates.',
    context: 'Social discussion platforms competing for opinion-forming internet conversations.',
    faq: [
      { q: 'Which gets more traffic, Reddit or Twitter/X?', a: 'Reddit and X are closely matched in monthly traffic - see the live comparison above for current figures. Reddit\'s traffic has grown faster since Google\'s 2023 algorithm update boosted discussion forums.' },
      { q: 'Why is Reddit ranking higher in Google searches?', a: 'Google\'s "helpful content" updates in 2023–2024 specifically rewarded authentic community discussions over SEO-optimised articles. Reddit\'s genuine user opinions made it a beneficiary of these changes.' },
      { q: 'Is Reddit more influential than Twitter?', a: 'Reddit drives more internet culture, memes, and product research behaviour due to its subreddit structure. Twitter/X is more influential for breaking news, political discourse, and real-time events.' },
    ],
  },
  {
    slug: 'openai-vs-google',
    siteAId: 'openai',
    siteBId: 'google',
    verdict: 'Google\'s monthly traffic dwarfs OpenAI\'s, but the ChatGPT product remains the fastest-growing consumer internet product ever. The real battle is for the future of how people find information online.',
    context: 'The defining AI rivalry, large language models vs. traditional search.',
    faq: [
      { q: 'Is OpenAI/ChatGPT taking over from Google?', a: 'Not yet. Google receives far more monthly traffic than ChatGPT. However, ChatGPT\'s 100M user milestone in 2 months and continued growth signal a meaningful shift in how some users approach information discovery.' },
      { q: 'Which AI model is better, OpenAI or Google?', a: 'OpenAI\'s GPT-4o and Google\'s Gemini Ultra are closely matched on benchmarks. OpenAI leads in third-party integrations and developer ecosystem; Google leads in search integration and real-time web access.' },
      { q: 'Will AI replace Google Search?', a: 'Most analysts believe AI will transform rather than replace search. Google itself has integrated AI Overviews into search, combining LLM capabilities with its index. Pure search query volumes remain stable as of 2026.' },
    ],
  },
  {
    slug: 'wikipedia-vs-quora',
    siteAId: 'wikipedia',
    siteBId: 'quora',
    verdict: 'Wikipedia receives significantly more traffic than Quora. Wikipedia\'s volunteer-edited, citation-backed model gives it more trust and SEO authority than Quora\'s expert Q&A format.',
    context: 'Reference and knowledge platforms serving different information needs.',
    faq: [
      { q: 'Which gets more traffic, Wikipedia or Quora?', a: 'Wikipedia receives far more monthly visits than Quora - see the live comparison above for current figures. Wikipedia ranks in the global top 10 while Quora is significantly lower.' },
      { q: 'Is Wikipedia more accurate than Quora?', a: 'Wikipedia has a strict citation and notability policy enforced by thousands of volunteer editors. Quora relies on individual expertise which varies significantly. For factual reference, Wikipedia is generally more reliable.' },
      { q: 'Does Quora make money?', a: 'Quora generates revenue through advertising and its subscription product "Quora+". The company also operates Poe, an AI chatbot aggregator. Quora\'s revenue model is significantly smaller than Wikipedia\'s donation-based sustainability.' },
    ],
  },
  {
    slug: 'canva-vs-figma',
    siteAId: 'canva',
    siteBId: 'github', // proxy since Figma isn't in SITES
    verdict: 'Canva receives more web traffic than Figma with 600M monthly visits, driven by its broader consumer and SMB audience. Figma dominates professional UI/UX design with superior collaboration tools.',
    context: 'Design tools competing from consumer to professional markets.',
    faq: [
      { q: 'Which is more popular, Canva or Figma?', a: 'Canva has over 170 million monthly active users and 600 million monthly web visits. Figma has approximately 4 million professional users but commands higher enterprise spend and is the standard for product design teams.' },
      { q: 'Should I use Canva or Figma?', a: 'Use Canva for social media graphics, presentations, and marketing materials, it\'s beginner-friendly and fast. Use Figma for product design, UI prototyping, and collaborative design workflows with engineering teams.' },
      { q: 'Did Adobe acquire Figma?', a: 'Adobe\'s proposed $20B acquisition of Figma was blocked by EU and UK regulators in 2023 on antitrust grounds. Figma remains independent and has continued expanding its platform.' },
    ],
  },
  {
    slug: 'pinterest-vs-instagram',
    siteAId: 'pinterest',
    siteBId: 'instagram',
    verdict: 'Instagram receives nearly 10× more traffic than Pinterest (10.4B vs 800M monthly visits). However, Pinterest users have significantly higher purchase intent, making it more valuable for e-commerce brands per visit.',
    context: 'Visual discovery and inspiration platforms with very different user intents.',
    faq: [
      { q: 'Which gets more traffic, Pinterest or Instagram?', a: 'Instagram receives approximately 10.4 billion monthly visits compared to Pinterest\'s 800 million, roughly 9× more. Pinterest ranks #23 globally while Instagram ranks #5.' },
      { q: 'Which is better for e-commerce brands?', a: 'Pinterest users are 3× more likely to click through to an e-commerce site than Instagram users. Pinterest shoppers have a higher average order value, making it particularly effective for home decor, fashion, and DIY brands.' },
      { q: 'Is Pinterest still growing?', a: 'Yes. Pinterest reached 518 million monthly active users in 2024, an all-time high, driven by AI-powered personalisation and a younger Gen Z user base discovering the platform.' },
    ],
  },
  // ── Batch 2: 20 more editorial pairs ──────────────────────────────────────
  {
    slug: 'netflix-vs-disney',
    siteAId: 'netflix',
    siteBId: 'disneyplus',
    verdict: 'Netflix leads in web traffic with roughly 3× more monthly visits than Disney+. Netflix has a larger global library while Disney+ dominates family content and franchise IP from Marvel, Star Wars, and Pixar.',
    context: 'The two biggest names in subscription video-on-demand, competing for screen time worldwide.',
    faq: [
      { q: 'Which has more traffic, Netflix or Disney+?', a: 'Netflix receives approximately 2.8 billion monthly web visits compared to Disney+\'s 1.1 billion, giving Netflix a roughly 3× traffic advantage. Netflix also has a larger global subscriber base at 260 million vs Disney+\'s 150 million.' },
      { q: 'Is Disney+ growing faster than Netflix?', a: 'Disney+ grew faster initially due to its large franchise library, but growth has slowed. Netflix has re-accelerated growth through its ad-supported tier and password-sharing crackdown, adding over 20 million subscribers in 2023.' },
      { q: 'Which is cheaper, Netflix or Disney+?', a: 'Disney+ is generally cheaper at its base tier. However, Netflix\'s ad-supported plan is competitively priced. Disney+ also bundles with Hulu and ESPN+ for added value.' },
    ],
  },
  {
    slug: 'twitter-vs-threads',
    siteAId: 'x',
    siteBId: 'threads',
    verdict: 'X (formerly Twitter) retains a massive web traffic lead at over 4.2B monthly visits compared to Threads\' 380M. However, Threads benefits from seamless Instagram ecosystem distribution and is closing the gap in active mobile engagement.',
    context: 'The real-time text conversation battle between X and Meta\'s Threads.',
    faq: [
      { q: 'Is Threads bigger than Twitter/X?', a: 'No. X receives approximately 4.2 billion monthly web visits versus Threads at 380 million. However, Threads has experienced rapid mobile adoption driven by cross-promotion from Instagram.' },
      { q: 'Why did people move from Twitter to Threads?', a: 'Many users migrated after Elon Musk\'s acquisition of Twitter, citing policy changes, API pricing changes, and moderation updates. Threads offered a familiar Instagram-linked text alternative.' },
      { q: 'Does Threads have ads?', a: 'Meta began rolling out monetization and advertising pilots on Threads in 2024 to tap into digital marketing budgets alongside X.' },
    ],
  },
  {
    slug: 'perplexity-vs-chatgpt',
    siteAId: 'perplexity',
    siteBId: 'chatgpt',
    verdict: 'ChatGPT is the undisputed market leader with over 5.5B monthly visits, but Perplexity has emerged as the premier real-time conversational search engine, growing rapidly to over 135M monthly visits.',
    context: 'The battle between conversational AI assistant and real-time answer engine.',
    faq: [
      { q: 'What is the main difference between Perplexity and ChatGPT?', a: 'Perplexity is designed primarily as a search and citation engine, grounding every answer in live web sources. ChatGPT is a general-purpose conversational and reasoning model with broad creative and coding capabilities.' },
      { q: 'Which is better for research?', a: 'Perplexity is widely considered superior for academic and fast factual research because it automatically fetches, aggregates, and attributes numbered citations from real-time web pages.' },
      { q: 'How much traffic does Perplexity get compared to ChatGPT?', a: 'ChatGPT receives approximately 5.5 billion monthly visits compared to Perplexity\'s 135 million, giving ChatGPT a 40× volume advantage as of 2026.' },
    ],
  },
  {
    slug: 'kick-vs-twitch',
    siteAId: 'kick',
    siteBId: 'twitch',
    verdict: 'Twitch remains the dominant livestreaming powerhouse with over 1.15B monthly visits, but Kick has captured significant creator market share through its aggressive 95/5 creator revenue split.',
    context: 'The creator-led streaming platform war between Twitch and challenger Kick.',
    faq: [
      { q: 'Why do streamers switch from Twitch to Kick?', a: 'Kick offers a 95/5 subscription revenue split favoring creators, compared to Twitch\'s traditional 50/50 or 70/30 partner split. Kick also allows more flexible non-exclusive streaming contracts.' },
      { q: 'How does Kick\'s traffic compare to Twitch?', a: 'Twitch receives roughly 1.15 billion monthly visits versus Kick\'s 165 million. While Twitch holds a 7× traffic lead, Kick is one of the fastest-growing entertainment destinations on the web.' },
      { q: 'Is Kick owned by Stake?', a: 'Kick was founded by Stake.com founders Ed Craven and Bijan Tehrani, though it operates as an independent streaming entertainment network.' },
    ],
  },
  {
    slug: 'cursor-vs-github',
    siteAId: 'cursor',
    siteBId: 'github',
    verdict: 'GitHub is the world\'s central code repository with 1.0B monthly visits, while Cursor is the breakout AI-native code editor rapidly reshaping developer workflows with 48M monthly visits.',
    context: 'The coding hub of the internet meets the AI-first IDE transformation.',
    faq: [
      { q: 'Is Cursor replacing GitHub?', a: 'No. GitHub is a code hosting, version control, and collaboration platform, while Cursor is an AI-powered code editor built on top of VS Code. Developers use Cursor to write code and GitHub to host it.' },
      { q: 'Does Cursor compete with GitHub Copilot?', a: 'Yes. Cursor features deep codebase indexing and agentic generation that directly competes with GitHub Copilot Workspace and GitHub Copilot Chat.' },
      { q: 'Can I use GitHub with Cursor?', a: 'Seamlessly. Cursor supports all Git repositories, GitHub extensions, and GitHub authentication out of the box.' },
    ],
  },
  // NOTE: google-vs-chatgpt removed - covered by chatgpt-vs-google (line 88).
  //       Reverse-order requests are 308-redirected to the canonical slug by proxy.ts.
  {
    slug: 'shopify-vs-amazon',
    siteAId: 'shopify',
    siteBId: 'amazon',
    verdict: 'Amazon\'s marketplace traffic at 2.9B monthly visits dwarfs Shopify\'s 112M. However, Shopify powers over 1.7 million independent stores globally and is the backbone of direct-to-consumer e-commerce.',
    context: 'Marketplace giant vs. the platform powering independent online retail.',
    faq: [
      { q: 'Should I sell on Amazon or Shopify?', a: 'Amazon gives instant access to 300M+ active buyers but takes 15-40% in fees and you don\'t own the customer relationship. Shopify lets you build your own brand and customer list, but you are responsible for driving your own traffic.' },
      { q: 'Which is bigger, Amazon or Shopify?', a: 'Amazon receives approximately 2.9 billion monthly web visits versus Shopify\'s 112 million. Amazon is also a marketplace while Shopify is a platform: Shopify stores collectively generate over $235B in GMV annually.' },
      { q: 'Can I use both Amazon and Shopify?', a: 'Yes, many brands use both. Shopify offers a native Amazon sales channel integration that syncs inventory and orders. Many brands use Amazon for discovery and Shopify for their owned-channel direct sales.' },
    ],
  },
  {
    slug: 'reddit-vs-stackoverflow',
    siteAId: 'reddit',
    siteBId: 'stackoverflow',
    verdict: 'Reddit receives approximately 5× more traffic than Stack Overflow (4.8B vs 700M monthly visits). But Stack Overflow is the dominant platform for technical Q&A, with Reddit serving a broader community discussion role.',
    context: 'Community knowledge platforms with very different audience intents.',
    faq: [
      { q: 'Which gets more traffic, Reddit or Stack Overflow?', a: 'Reddit receives approximately 4.8 billion monthly visits versus Stack Overflow\'s 700 million. Reddit covers all topics while Stack Overflow is focused specifically on programming and technical questions.' },
      { q: 'Is Stack Overflow still relevant with AI coding tools?', a: 'Stack Overflow traffic has declined as developers increasingly use GitHub Copilot and ChatGPT for code answers. However, Stack Overflow remains the most trusted source for validated, community-reviewed technical answers.' },
      { q: 'Which is better for learning programming?', a: 'Stack Overflow is better for specific technical answers with high accuracy. Reddit communities like r/learnprogramming and r/webdev are better for career advice, project feedback, and community support.' },
    ],
  },
  {
    slug: 'apple-vs-microsoft',
    siteAId: 'apple',
    siteBId: 'linkedin',
    verdict: 'Apple.com receives roughly 400M monthly visits vs Microsoft\'s ecosystem. Apple leads in consumer hardware brand traffic while Microsoft dominates enterprise software and cloud with Azure and Office 365.',
    context: 'Two of the world\'s largest tech companies competing across hardware, software, and services.',
    faq: [
      { q: 'Which is bigger, Apple or Microsoft?', a: 'Apple briefly became the first $3 trillion company by market cap in 2023. Microsoft has also crossed $3 trillion. Both regularly trade places as the world\'s most valuable company. Microsoft leads in enterprise software; Apple leads in consumer hardware.' },
      { q: 'Is Apple or Microsoft better for developers?', a: 'Microsoft has made significant developer-friendly investments including acquiring GitHub, VS Code, and integrating AI via Copilot. Apple\'s developer ecosystem is essential for iOS and macOS development. Most professional developers use both.' },
      { q: 'Which company has better cloud services?', a: 'Microsoft Azure is the #2 cloud provider globally behind AWS. Apple\'s iCloud is consumer-focused and not a direct competitor to enterprise cloud. For enterprise cloud computing, Microsoft is the clear winner.' },
    ],
  },
  {
    slug: 'gmail-vs-outlook',
    siteAId: 'google',
    siteBId: 'microsoft',
    verdict: 'Gmail dominates consumer email with over 1.8B active users. Microsoft Outlook leads in enterprise email via Microsoft 365. Both serve fundamentally different primary markets.',
    context: 'The two dominant email platforms competing for consumer and enterprise inbox share.',
    faq: [
      { q: 'Which is more popular, Gmail or Outlook?', a: 'Gmail has approximately 1.8 billion active users making it the world\'s largest email service. Outlook has around 400 million consumer users plus hundreds of millions of enterprise users via Microsoft 365.' },
      { q: 'Is Gmail or Outlook better for business?', a: 'Microsoft 365 with Outlook integrates tightly with Teams, SharePoint, and Azure Active Directory, making it the preferred choice for most large enterprises. Google Workspace with Gmail is popular with startups and tech companies.' },
      { q: 'Which email service is more secure?', a: 'Both offer strong security including 2FA, encryption in transit, and spam filtering. Google recently added client-side encryption for Workspace users. Microsoft offers advanced threat protection via Defender for Office 365.' },
    ],
  },
  {
    slug: 'twitch-vs-kick',
    siteAId: 'twitch',
    siteBId: 'youtube',
    verdict: 'Twitch retains its position as the dominant live streaming platform with over 2B monthly visits. Kick has attracted high-profile streamers with its 95/5 revenue split but remains far smaller in audience.',
    context: 'Live game streaming platforms competing for creator exclusivity and viewer time.',
    faq: [
      { q: 'Is Kick bigger than Twitch?', a: 'No. Twitch receives approximately 2 billion monthly visits while Kick is still a fraction of that size. However, Kick has gained attention by signing major streamers like xQc and Amouranth away from Twitch.' },
      { q: 'Why are streamers moving to Kick?', a: 'Kick offers a 95/5 revenue split compared to Twitch\'s standard 50/50, meaning streamers keep 95% of subscription revenue. Kick also has fewer content restrictions, attracting creators who felt limited on Twitch.' },
      { q: 'Which platform is better for watching live streams?', a: 'Twitch has the largest library of live content, established categories, clip culture, and community features. Kick\'s interface is similar to Twitch but its content catalogue is currently much smaller.' },
    ],
  },
  {
    slug: 'paypal-vs-stripe',
    siteAId: 'paypal',
    siteBId: 'stripe',
    verdict: 'PayPal leads in consumer brand recognition and checkout trust with 240M monthly visits. Stripe leads among developers and businesses for its superior API design and is the backbone of many internet companies.',
    context: 'The two dominant online payment platforms from very different angles.',
    faq: [
      { q: 'Which is better, PayPal or Stripe?', a: 'PayPal is better for consumer checkout and peer-to-peer payments thanks to its trusted brand with 430M accounts. Stripe is better for developers and businesses building payment infrastructure due to its flexible API and extensive documentation.' },
      { q: 'Which processes more payments, PayPal or Stripe?', a: 'PayPal processed approximately $1.53 trillion in payment volume in 2023. Stripe processed an estimated $817 billion. PayPal leads in total volume but Stripe is growing faster in the business-to-business segment.' },
      { q: 'Can I use both PayPal and Stripe?', a: 'Yes. Many e-commerce platforms offer both as checkout options. Stripe powers the backend while PayPal is offered as an additional consumer-facing option since many buyers prefer to pay via their PayPal balance.' },
    ],
  },
  {
    slug: 'wordpress-vs-wix',
    siteAId: 'wikipedia',
    siteBId: 'shopify',
    verdict: 'WordPress powers 43% of all websites globally. Wix is growing fast with a simpler drag-and-drop builder. WordPress offers far more power and flexibility while Wix offers speed to launch for non-technical users.',
    context: 'The dominant website builder platforms serving very different user profiles.',
    faq: [
      { q: 'Which is better, WordPress or Wix?', a: 'WordPress is better for complex sites, large blogs, e-commerce with WooCommerce, and developers who want full control. Wix is better for beginners, small businesses, and anyone who wants to launch a professional site without coding.' },
      { q: 'Is WordPress still worth learning in 2026?', a: 'Yes. WordPress powers 43% of the web and has a massive job market. The Gutenberg block editor has also made it more accessible for non-developers. Learning WordPress remains a highly marketable skill.' },
      { q: 'Can I migrate from Wix to WordPress?', a: 'Yes, migration tools exist but the process requires manual effort. You can export content from Wix and import it into WordPress using plugins. Design elements do not transfer and must be rebuilt in your WordPress theme.' },
    ],
  },
  {
    slug: 'binance-vs-coinbase',
    siteAId: 'binance',
    siteBId: 'coinbase',
    verdict: 'Binance leads in global trading volume and monthly web traffic at 165M visits vs Coinbase\'s 170M. Coinbase leads in regulatory trust and US market share while Binance dominates internationally.',
    context: 'The two largest crypto exchanges by volume, competing for a global user base.',
    faq: [
      { q: 'Which is bigger, Binance or Coinbase?', a: 'Binance processes significantly more daily trading volume globally. Coinbase is the largest regulated crypto exchange in the US and has more institutional trust due to its public listing on NASDAQ and clearer regulatory compliance record.' },
      { q: 'Is Binance safe to use?', a: 'Binance has faced regulatory scrutiny in multiple countries. Its founder Changpeng Zhao pleaded guilty to AML violations in the US in 2023. Coinbase is generally considered safer for US users due to its CFTC and SEC regulated status.' },
      { q: 'Which has lower fees, Binance or Coinbase?', a: 'Binance has significantly lower trading fees, starting at 0.1% and reducing further with BNB token usage. Coinbase\'s standard fees are higher but Coinbase Pro (now Advanced Trade) offers competitive maker/taker fees for active traders.' },
    ],
  },
  // NOTE: tiktok-vs-instagram removed - covered by instagram-vs-tiktok (line 124).
  //       Reverse-order requests are 308-redirected to the canonical slug by proxy.ts.
  {
    slug: 'microsoft-vs-google',
    siteAId: 'bing',
    siteBId: 'google',
    verdict: 'Google processes over 90% of global search queries and receives 92.5B monthly visits. Microsoft\'s Bing, despite integrating GPT-4, holds only 3-4% search market share. Google\'s lead is one of the most dominant in any consumer technology market.',
    context: 'The defining search engine rivalry, intensified by the AI race between Bing Copilot and Google AI Overviews.',
    faq: [
      { q: 'Is Bing catching up to Google?', a: 'Bing\'s market share has nudged upward slightly after integrating GPT-4 in 2023, reaching approximately 3.5% globally. However, Google responded with AI Overviews and remains overwhelmingly dominant at over 91% market share.' },
      { q: 'Which AI search is better, Bing Copilot or Google AI?', a: 'Both use leading AI models: Bing uses GPT-4 while Google uses Gemini. Google AI Overviews have broader web coverage. Bing Copilot tends to provide more detailed cited responses for complex queries.' },
      { q: 'Why do people use Bing over Google?', a: 'Bing users often cite Microsoft Rewards (points redeemable for gift cards), Bing\'s image search quality, and its deeper Windows and Edge integration. Bing is also the default search on Microsoft 365 devices.' },
    ],
  },
  {
    slug: 'notion-vs-confluence',
    siteAId: 'medium',
    siteBId: 'github',
    verdict: 'Notion has surpassed Confluence in user growth and web traffic, particularly among startups and individual creators. Confluence remains dominant in enterprise environments deeply integrated with Jira and the Atlassian suite.',
    context: 'Modern productivity wikis competing for team knowledge management.',
    faq: [
      { q: 'Which is better, Notion or Confluence?', a: 'Notion is better for startups, small teams, and individuals due to its flexibility, better UX, and all-in-one workspace approach. Confluence is better for large enterprises already using Jira and other Atlassian tools, with stronger permission management.' },
      { q: 'Is Notion replacing Confluence?', a: 'In many startups and mid-size companies, yes. Notion has grown from 1M to over 35M users since 2018. However, Confluence remains deeply embedded in enterprise IT workflows and is unlikely to be displaced in those environments.' },
      { q: 'How much does Notion cost vs Confluence?', a: 'Notion is free for individuals and starts at $8/user/month for teams. Confluence is free for up to 10 users and starts at $5.75/user/month for small teams, but enterprise pricing is significantly higher when bundled with other Atlassian products.' },
    ],
  },
  {
    slug: 'amazon-vs-walmart',
    siteAId: 'amazon',
    siteBId: 'walmart',
    verdict: 'Amazon dominates online retail with 2.9B monthly visits vs Walmart.com\'s 225M. However, Walmart\'s physical store network of 4,600+ US locations and its omnichannel strategy give it unique advantages in grocery and same-day delivery.',
    context: 'The battle for US retail supremacy between the world\'s largest e-commerce company and largest brick-and-mortar retailer.',
    faq: [
      { q: 'Is Walmart bigger than Amazon?', a: 'By total revenue, Walmart ($648B) is larger than Amazon ($575B). But Amazon is far larger in pure e-commerce: Amazon holds approximately 37% of US e-commerce market share vs Walmart\'s 6%. Amazon\'s profit is largely driven by AWS.' },
      { q: 'Which is better for online shopping, Amazon or Walmart?', a: 'Amazon has a larger product selection and faster Prime shipping. Walmart.com often has lower prices on everyday items and offers free same-day delivery on groceries from local stores. The best choice depends on product category and location.' },
      { q: 'Is Walmart Plus worth it vs Amazon Prime?', a: 'Amazon Prime ($139/year) offers broader benefits including Prime Video, Prime Music, and 2-day shipping on millions of items. Walmart Plus ($98/year) focuses on grocery delivery, fuel discounts, and Paramount+ streaming. For grocery-focused shoppers near a Walmart, Walmart Plus can be better value.' },
    ],
  },
  // NOTE: youtube-vs-spotify removed - covered by spotify-vs-youtube (line 160).
  //       Reverse-order requests are 308-redirected to the canonical slug by proxy.ts.
  {
    slug: 'google-docs-vs-microsoft-word',
    siteAId: 'google',
    siteBId: 'microsoft',
    verdict: 'Google Docs has become the default for real-time collaboration in startups and education. Microsoft Word remains dominant in enterprise and legal environments that rely on advanced formatting, tracked changes, and deep Office 365 integration.',
    context: 'Word processing tools competing for productivity in the cloud-first workplace.',
    faq: [
      { q: 'Is Google Docs replacing Microsoft Word?', a: 'In many consumer and education contexts, yes. Google Workspace has over 3 billion users. However, Microsoft Word remains the standard in legal, financial, and enterprise environments that depend on complex document formatting.' },
      { q: 'Which is better for collaboration, Google Docs or Word?', a: 'Google Docs is widely considered superior for real-time collaboration due to its always-synced cloud approach and simpler sharing. Microsoft Word now offers real-time co-authoring in Microsoft 365, significantly closing the gap.' },
      { q: 'Can Google Docs open Word files?', a: 'Yes. Google Docs can open, edit, and export .docx files with high fidelity. Some advanced Word formatting features may not render perfectly. For documents that will be sent back to Word users, the compatibility is generally reliable.' },
    ],
  },
  {
    slug: 'linkedin-vs-glassdoor',
    siteAId: 'linkedin',
    siteBId: 'indeed',
    verdict: 'LinkedIn receives 1.8B monthly visits and is the dominant professional networking and job discovery platform. Glassdoor focuses on company reviews and salary transparency, making them complementary tools for job seekers.',
    context: 'Professional career platforms competing for job seeker and recruiter attention.',
    faq: [
      { q: 'Which is better for job searching, LinkedIn or Glassdoor?', a: 'LinkedIn is better for active networking, direct recruiter outreach, and applying to jobs via connections. Glassdoor is better for researching company culture, salaries, and interview processes before you apply. Most serious job seekers use both.' },
      { q: 'Do employers prefer LinkedIn or Glassdoor?', a: 'Employers heavily prefer LinkedIn for sourcing and recruiting candidates. Glassdoor is more of a passive brand-management tool for employers, where they respond to reviews and post jobs but do not proactively recruit the way they do on LinkedIn.' },
      { q: 'Is LinkedIn Premium worth it?', a: 'LinkedIn Premium ($40-80/month depending on tier) is most valuable for active job seekers who want InMail credits to contact recruiters, and for salespeople using Sales Navigator. For passive networking, the free tier is sufficient for most users.' },
    ],
  },
  {
    slug: 'npm-vs-github',
    siteAId: 'npm',
    siteBId: 'github',
    verdict: 'GitHub dominates developer hosting with 100M developers and 420M monthly visits. NPM is the world\'s largest software registry with 2.5M packages and is deeply embedded in the JavaScript ecosystem. They serve complementary roles.',
    context: 'The two most critical platforms in the open-source JavaScript and web development ecosystem.',
    faq: [
      { q: 'What is the difference between NPM and GitHub?', a: 'GitHub is a platform for hosting, versioning, and collaborating on code via Git. NPM is a package registry and package manager for JavaScript. Most open-source JavaScript packages live on both: code on GitHub, distributed package on NPM.' },
      { q: 'Who owns NPM?', a: 'NPM was acquired by GitHub in 2020, which is itself owned by Microsoft. Despite common ownership, NPM and GitHub operate as separate services with different use cases.' },
      { q: 'Is there an alternative to NPM?', a: 'Yes. Yarn and pnpm are popular NPM alternatives with different performance and workspace characteristics. Deno uses URL-based imports rather than NPM packages. However, NPM\'s 2.5M package registry remains the standard reference.' },
    ],
  },
  {
    slug: 'whatsapp-vs-telegram',
    siteAId: 'whatsapp',
    siteBId: 'telegram',
    verdict: 'WhatsApp leads with 2B+ monthly active users and 300M monthly web visits vs Telegram\'s 210M. WhatsApp dominates in consumer messaging in Europe, India, and Latin America. Telegram is favoured for large communities, channels, and privacy-focused users.',
    context: 'The two most widely used instant messaging platforms outside of China.',
    faq: [
      { q: 'Which is more popular, WhatsApp or Telegram?', a: 'WhatsApp has approximately 2.7 billion monthly active users versus Telegram\'s 900 million. WhatsApp dominates consumer messaging in most markets outside the US and China. Telegram is more popular in Eastern Europe, the Middle East, and among privacy-conscious users.' },
      { q: 'Is Telegram safer than WhatsApp?', a: 'WhatsApp uses end-to-end encryption by default for all personal messages. Telegram\'s regular chats are server-side encrypted, not end-to-end. Only Telegram\'s "Secret Chats" use end-to-end encryption. For private conversations, WhatsApp\'s default encryption is actually stronger.' },
      { q: 'Which is better for communities and channels?', a: 'Telegram is significantly better for large communities, supporting up to 200,000 members in groups and unlimited subscribers in channels. WhatsApp Communities is a newer feature with smaller group limits. Telegram channels are widely used for broadcasting content at scale.' },
    ],
  },
];

export function getPairBySlug(slug: string): ComparePair | undefined {
  return COMPARE_PAIRS.find((p) => p.slug === slug);
}

export const PAIR_SLUGS = COMPARE_PAIRS.map((p) => p.slug);

/**
 * Returns all hand-crafted comparison slugs PLUS top-20 global combinations
 * PLUS top same-category competitors across all categories.
 * Used identically in generateStaticParams and sitemap.ts.
 */
/**
 * Returns the canonical slug for a pair: the one where the lexicographically
 * smaller site ID comes first. This is the source of truth for redirects and
 * the sitemap - only the canonical ordering is ever indexed.
 */
export function canonicalPairSlug(idA: string, idB: string): string {
  return idA <= idB ? `${idA}-vs-${idB}` : `${idB}-vs-${idA}`;
}

export function getAllCompareSlugs(): string[] {
  // Seed with hand-crafted slugs exactly as authored (they have editorial content)
  const handCraftedSlugs = new Set(PAIR_SLUGS);
  const allSlugs: string[] = [...PAIR_SLUGS];

  // Track all pairs we've emitted (in either order) to avoid duplicates
  const emittedPairs = new Set<string>();
  for (const slug of PAIR_SLUGS) {
    const m = slug.match(/^(.+)-vs-(.+)$/);
    if (m) emittedPairs.add(canonicalPairSlug(m[1], m[2]));
  }

  const addPair = (idA: string, idB: string) => {
    if (idA === idB) return;
    const canonical = canonicalPairSlug(idA, idB);
    // Skip if we already have this pair (in either order) or a hand-crafted slug covers it
    if (emittedPairs.has(canonical)) return;
    const reverseSlug = idA <= idB ? `${idB}-vs-${idA}` : `${idA}-vs-${idB}`;
    if (handCraftedSlugs.has(canonical) || handCraftedSlugs.has(reverseSlug)) return;
    emittedPairs.add(canonical);
    allSlugs.push(canonical);
  };

  // 1. Top 20 Global × Top 20 Global
  const top20 = SITES.slice(0, 20);
  for (const siteA of top20) {
    for (const siteB of top20) {
      addPair(siteA.id, siteB.id);
    }
  }

  // 2. Category rivals (e.g., AI vs AI, Dev vs Dev, E-Commerce vs E-Commerce)
  const categoryMap = new Map<string, typeof SITES>();
  for (const site of SITES) {
    const list = categoryMap.get(site.category) || [];
    list.push(site);
    categoryMap.set(site.category, list);
  }

  for (const [, catSites] of categoryMap.entries()) {
    const topCat = catSites.slice(0, 8); // Top 8 per category
    for (let i = 0; i < topCat.length; i++) {
      for (let j = i + 1; j < topCat.length; j++) {
        addPair(topCat[i].id, topCat[j].id);
      }
    }
  }

  return allSlugs;
}

/** Parse a compare slug into two site IDs, e.g. "youtube-vs-tiktok" */
export function parsePairSlug(slug: string): { siteAId: string; siteBId: string } | null {
  const match = slug.match(/^(.+)-vs-(.+)$/);
  if (!match) return null;
  return { siteAId: match[1], siteBId: match[2] };
}

