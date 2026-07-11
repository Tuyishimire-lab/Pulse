import { SiteConfig } from './sites';

export interface SiteDetails {
  description: string;
  bounceRate: string;
  visitDuration: string;
  desktopShare: number;
  mobileShare: number;
  geographies: { country: string; percentage: number }[];
  trafficHistory: number[];
  funFact: string;
  keywords: string[];
}

// Seeded random matching sites.ts
function seedRandom(seed: number) {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

const TOP_100_DETAILS: Record<string, { description: string; funFact: string }> = {
  google: {
    description: "Google is the world's leading search engine, answering billions of questions daily and acting as the primary gateway to the web.",
    funFact: "Google handles over 90% of the global search engine market share, processing more than 8.5 billion searches per day."
  },
  youtube: {
    description: "YouTube is the largest online video sharing platform and social network, serving as a hub for entertainment, education, and user content.",
    funFact: "The very first YouTube video was uploaded on April 23, 2005, by co-founder Jawed Karim, titled 'Me at the zoo'."
  },
  facebook: {
    description: "Facebook is a pioneer of modern social media networks, connecting billions of friends, families, and businesses worldwide through interactive feeds.",
    funFact: "Facebook is the most widely used social media platform in the world, with over 3.05 billion active monthly users."
  },
  wikipedia: {
    description: "Wikipedia is a free, multilingual, open-collaboration online encyclopedia created and maintained by a community of volunteer editors.",
    funFact: "Wikipedia contains more than 62 million articles across 339 language editions, all written and managed by volunteers."
  },
  instagram: {
    description: "Instagram is a highly visual social media platform optimized for sharing photos, videos, stories, and reels, popular among creators.",
    funFact: "The most liked photo on Instagram is a photo of a simple brown egg, which received over 60 million likes to beat Kylie Jenner's record."
  },
  chatgpt: {
    description: "ChatGPT is a state-of-the-art conversational AI developed by OpenAI, capable of understanding and generating human-like text across multiple fields.",
    funFact: "ChatGPT reached 100 million active monthly users in just two months after its launch, making it the fastest-growing consumer app in history."
  },
  reddit: {
    description: "Reddit is a massive social news aggregation, web content rating, and discussion website structured into thousands of interest-based subreddits.",
    funFact: "Reddit's mascot is an alien named 'Snoo', designed by co-founder Alexis Ohanian to represent a time-traveler from the future."
  },
  x: {
    description: "X (formerly Twitter) is a real-time microblogging and social networking platform where users post short updates and participate in public discussions.",
    funFact: "The iconic blue bird logo was retired in July 2023 when the platform rebranded to X under Elon Musk's ownership."
  },
  yahoo: {
    description: "Yahoo is a classic web portal and search platform that consolidates search, news, email, finance, and weather services for hundreds of millions of users.",
    funFact: "Yahoo originally stood for 'Yet Another Hierarchical Officious Oracle' when it was founded in 1994."
  },
  amazon: {
    description: "Amazon is the global titan of e-commerce and cloud computing, offering retail goods, digital streaming, and server infrastructure to millions.",
    funFact: "Amazon was originally founded in Jeff Bezos' garage as an online bookstore before expanding to sell almost everything."
  },
  yandex: {
    description: "Yandex is a multinational technology corporation providing search, internet services, e-commerce, maps, translation, and autonomous systems.",
    funFact: "Yandex has a market share of over 60% in Russian search query volume, surpassing Google in local markets."
  },
  baidu: {
    description: "Baidu is the dominant Chinese search engine and AI technology company, offering web search, mapping, encyclopedia search, and cloud hosting.",
    funFact: "Baidu's name was inspired by a Chinese poem from the Song Dynasty, meaning 'hundreds of times' or 'search in the crowd'."
  },
  tiktok: {
    description: "TikTok is a short-form video hosting service that popularized scroll-friendly vertical video clips, algorithmic feeds, and viral audio trends.",
    funFact: "The average TikTok user spends over 95 minutes per day on the app, higher than any other social platform."
  },
  netflix: {
    description: "Netflix is a premium video streaming service offering subscription-based access to a library of films, TV shows, and original productions.",
    funFact: "Netflix started in 1997 as a DVD-by-mail rental service before transitioning to online streaming in 2007."
  },
  microsoft: {
    description: "Microsoft is a global technology giant providing the Windows operating system, Microsoft 365 services, Xbox gaming, and enterprise cloud solutions.",
    funFact: "Microsoft was founded in 1975 by childhood friends Bill Gates and Paul Allen, initially writing interpreter code for the Altair 8800."
  },
  office: {
    description: "Office.com is the web home of Microsoft 365, giving users instant access to cloud-based versions of Word, Excel, PowerPoint, and Outlook.",
    funFact: "The first version of Microsoft Office was released in 1989 for the Apple Macintosh, prior to its Windows release."
  },
  linkedin: {
    description: "LinkedIn is the world's largest professional networking platform, helping users build resumes, search for jobs, and connect with business professionals.",
    funFact: "LinkedIn was launched in May 2003, making it older than Facebook, YouTube, Twitter, and Instagram."
  },
  weather: {
    description: "Weather.com is the official digital portal of The Weather Channel, providing local weather forecasts, radar maps, and severe weather warnings.",
    funFact: "Weather.com uses thousands of data points and weather stations to generate over 25 billion forecasts daily."
  },
  twitch: {
    description: "Twitch is the leading live streaming platform for gamers, esports competitions, creative content streams, and music broadcasts.",
    funFact: "The most viewed single event on Twitch had over 3.4 million concurrent viewers during a Spanish influencer's boxing match."
  },
  github: {
    description: "GitHub is the largest developer platform and hosting service for Git version control, collaboration, open-source code sharing, and CI/CD.",
    funFact: "GitHub's mascot is the 'Octocat', a character that is part octopus and part cat, created by illustrator Simon Oxley."
  },
  zoom: {
    description: "Zoom is a cloud-based video conferencing platform used globally for online meetings, webinars, virtual classrooms, and remote communication.",
    funFact: "Zoom was founded by Eric Yuan, a former Webex engineer who decided to build his own platform after Webex struggled on mobile networks."
  },
  ebay: {
    description: "eBay is a global online auction and retail platform where people buy and sell a wide variety of goods, collectibles, and apparel.",
    funFact: "The first item ever sold on eBay was a broken laser pointer for $14.83. The founder contacted the buyer, who confirmed he collected broken laser pointers."
  },
  pinterest: {
    description: "Pinterest is an image sharing and social media service designed to enable saving and discovery of information on the internet using pinboards.",
    funFact: "Over 450 million active users visit Pinterest monthly to find inspiration for recipes, home design, and fashion."
  },
  quora: {
    description: "Quora is a social question-and-answer website where questions are asked, answered, and edited by its community of users.",
    funFact: "Quora was co-founded by two former Facebook employees, Charlie Cheever and Adam D'Angelo, in 2009."
  },
  canva: {
    description: "Canva is a user-friendly graphic design platform used to create social media graphics, presentations, posters, documents, and other visual content.",
    funFact: "Canva was founded in Sydney, Australia, in 2013 and has grown to over 150 million monthly active users."
  },
  duckduckgo: {
    description: "DuckDuckGo is a privacy-focused search engine that does not track your search history, store IP addresses, or target you with personalized ads.",
    funFact: "DuckDuckGo gets its search results from over 400 sources, including Bing, Yahoo, Yandex, and its own web crawler."
  },
  imgur: {
    description: "Imgur is an online image hosting and sharing community, popular for viral memes, GIFs, and interesting stories shared from around the web.",
    funFact: "Imgur was created in 2009 by a college student as a gift to the Reddit community, which needed a simple image host."
  },
  spotify: {
    description: "Spotify is the world's leading audio streaming service, offering millions of songs, podcasts, and audiobooks from record labels and media companies.",
    funFact: "Spotify's recommendation algorithm generates a customized 'Discover Weekly' playlist for every user every Monday morning."
  },
  roblox: {
    description: "Roblox is an online game platform and game creation system that allows users to program games and play games created by other users.",
    funFact: "Over half of all kids under 16 in the United States play Roblox, which runs on its own virtual currency called 'Robux'."
  },
  stackoverflow: {
    description: "Stack Overflow is the largest online community and question-and-answer website for professional and enthusiast programmers to share coding knowledge.",
    funFact: "The most famous and frequently viewed question on Stack Overflow is 'How do I undo the most recent local commits in Git?'."
  },
  apple: {
    description: "Apple is a global technology giant that designs and sells consumer electronics, operating system software (macOS, iOS), and digital services.",
    funFact: "Apple was founded by Steve Jobs, Steve Wozniak, and Ronald Wayne in April 1976."
  },
  fandom: {
    description: "Fandom is an entertainment site hosting fan-run wikis about games, movies, television, and pop culture.",
    funFact: "Fandom was originally founded by Wikipedia co-founder Jimmy Wales under the name Wikia."
  },
  mailru: {
    description: "Mail.ru is one of the largest Russian web portals, providing webmail, search, games, and social networks.",
    funFact: "Mail.ru operates VK (Vkontakte), the largest social network in Russia."
  },
  naver: {
    description: "Naver is the premier South Korean search engine and web portal, offering news, email, mapping, and shopping services.",
    funFact: "Naver is often referred to as the 'Google of South Korea' due to its dominant 60%+ search engine market share there."
  },
  bilibili: {
    description: "Bilibili is a major Chinese video sharing site centered around animation, gaming, and pop culture, featuring real-time scrolling comments.",
    funFact: "Bilibili's unique 'danmu' (bullet comments) feature lets users overlay comments directly on top of video streams."
  },
  imdb: {
    description: "IMDb (Internet Movie Database) is the largest online database of information related to films, television series, home videos, and video games.",
    funFact: "IMDb started in 1990 as a fan-created list of actors on a Usenet group, before being acquired by Amazon in 1998."
  },
  aliexpress: {
    description: "AliExpress is an online retail service based in China owned by the Alibaba Group, connecting international buyers directly with manufacturers.",
    funFact: "AliExpress is the most popular e-commerce app in Russia and parts of Eastern Europe."
  },
  booking: {
    description: "Booking.com is one of the world's leading digital travel companies, offering hotels, flights, and travel reservations in over 40 languages.",
    funFact: "Booking.com lists more than 28 million accommodation options, including unique villas and cabins."
  },
  globo: {
    description: "Globo is the online portal of Grupo Globo, the largest media conglomerate in Latin America, hosting news, sports, and entertainment.",
    funFact: "Globo's parent company is the second-largest commercial TV network in the world, just behind CBS."
  },
  whatsapp: {
    description: "WhatsApp is a cross-platform messaging and voice-over-IP service that enables users to send text messages, make voice/video calls, and share media.",
    funFact: "WhatsApp was acquired by Facebook in 2014 for $19 Billion, which remains one of the largest tech acquisitions in history."
  },
  adobe: {
    description: "Adobe is a software giant specializing in multimedia and creativity software, famous for tools like Photoshop, Illustrator, Acrobat, and Premiere.",
    funFact: "Adobe was founded in 1982 in John Warnock's garage, and named after Adobe Creek, which ran behind his house."
  },
  steam: {
    description: "Steam is the leading video game digital distribution platform and community, developed by Valve Corporation.",
    funFact: "Steam accounts for over 75% of the global PC gaming market share, hosting over 100,000 games."
  },
  bbc: {
    description: "BBC (British Broadcasting Corporation) is the world's oldest national broadcaster, delivering news, radio, and television programs globally.",
    funFact: "The BBC was established under a Royal Charter and is funded by an annual television license fee paid by UK households."
  },
  cnn: {
    description: "CNN (Cable News Network) is a major American multinational news channel providing 24-hour news coverage, digital articles, and global broadcasts.",
    funFact: "Founded in 1980 by Ted Turner, CNN was the first television channel to provide 24-hour all-news coverage."
  },
  nytimes: {
    description: "The New York Times is a prominent American daily newspaper, globally recognized for its high-integrity journalism, opinion columns, and word games.",
    funFact: "The New York Times has won a record 137 Pulitzer Prizes, more than any other news organization."
  },
  paypal: {
    description: "PayPal is a pioneer of digital wallets and online payment systems, facilitating secure money transfers and billing checkout services globally.",
    funFact: "PayPal's early employees (referred to as the 'PayPal Mafia') went on to found Tesla, LinkedIn, YouTube, Yelp, and Palantir."
  },
  target: {
    description: "Target is a major American retail corporation, operating large department stores offering fashion, grocery, home decor, and electronics.",
    funFact: "Target's red bullseye logo is recognized by over 96% of American consumers."
  },
  walmart: {
    description: "Walmart is a multinational retail corporation operating a chain of hypermarkets, discount department stores, and grocery outlets.",
    funFact: "Walmart is the world's largest company by revenue, generating over $600 Billion annually, and the largest private employer globally."
  },
  etsy: {
    description: "Etsy is an e-commerce platform focused on handmade or vintage items and craft supplies, connecting independent sellers with global buyers.",
    funFact: "To be sold on Etsy, items must be handmade, vintage (at least 20 years old), or craft supplies."
  },
  discord: {
    description: "Discord is a social communication platform designed for creating communities, offering voice calls, video chats, and text channels.",
    funFact: "Discord was originally created by game developers as a communication tool to coordinate online gameplay."
  },
  telegram: {
    description: "Telegram is a cloud-based, privacy-focused instant messaging service offering encrypted chats, massive channels, and bot integrations.",
    funFact: "Telegram was founded by Russian brothers Nikolai and Pavel Durov, who also created VK."
  },
  dailymail: {
    description: "The Daily Mail is a major British tabloid newspaper and digital news portal, known for sensational headlines and entertainment reporting.",
    funFact: "Daily Mail's website, MailOnline, is one of the most visited English-language newspaper websites in the world."
  },
  espn: {
    description: "ESPN is a major sports news and television network, broadcasting live sporting events, highlights, commentary, and analysis.",
    funFact: "ESPN stands for Entertainment and Sports Programming Network and was launched in 1979."
  },
  medium: {
    description: "Medium is an open publishing platform where writers, journalists, and industry leaders publish articles, essays, and stories on various subjects.",
    funFact: "Medium was founded in 2012 by Evan Williams, who previously co-founded Blogger and Twitter."
  },
  salesforce: {
    description: "Salesforce is the world's leading cloud-based CRM (Customer Relationship Management) platform, providing sales, service, and marketing automation.",
    funFact: "Salesforce's famous headquarters in San Francisco, Salesforce Tower, is the tallest building in the city."
  },
  vimeo: {
    description: "Vimeo is a video sharing platform providing professional video creation, hosting, and marketing tools for filmmakers and visual artists.",
    funFact: "Vimeo was the first video sharing site to support high-definition (HD) video uploads in 2007."
  },
  dropbox: {
    description: "Dropbox is a popular file hosting service providing cloud storage, file synchronization, personal cloud folders, and client file sharing.",
    funFact: "Dropbox was conceived after founder Drew Houston repeatedly forgot his USB flash drive while studying at MIT."
  },
  slack: {
    description: "Slack is a cloud-based team communication hub designed to replace email with channels, threads, and app integrations for business workspaces.",
    funFact: "Slack stands for 'Searchable Log of All Conversation and Knowledge'."
  },
  coinbase: {
    description: "Coinbase is the largest cryptocurrency exchange platform in the United States, facilitating secure buying, selling, and custody of assets.",
    funFact: "Coinbase became the first major cryptocurrency exchange to go public on the Nasdaq stock exchange in April 2021."
  },
  binance: {
    description: "Binance is the world's largest cryptocurrency exchange by trading volume, hosting hundreds of token listings, futures, and staking options.",
    funFact: "Binance was founded in 2017 by Changpeng Zhao, growing to become the largest crypto exchange in under 180 days."
  },
  investing: {
    description: "Investing.com is a global financial portal providing live stock quotes, charts, financial news, analysis, and economic indicators.",
    funFact: "Investing.com publishes financial calendars and alerts in over 30 languages, catering to global traders."
  },
  bloomberg: {
    description: "Bloomberg is a premier financial news and media corporation, delivering market data, analysis, and business news to corporate terminals globally.",
    funFact: "The company was founded in 1981 by Michael Bloomberg, who went on to serve as the Mayor of New York City."
  },
  tradingview: {
    description: "TradingView is a highly interactive charting platform and social network for traders, featuring advanced stock, forex, and crypto charts.",
    funFact: "TradingView allows users to write their own indicators using a custom programming language called 'Pine Script'."
  },
  claude: {
    description: "Claude.ai is a state-of-the-art AI assistant created by Anthropic, designed to be helpful, harmless, and honest with large context capability.",
    funFact: "Claude was built with 'Constitutional AI', a training method that aligns the model using a defined set of principles."
  },
  gemini: {
    description: "Gemini is Google's advanced multimodal AI assistant, capable of reasoning across text, code, audio, images, and video.",
    funFact: "Gemini is integrated natively into Google Workspace apps like Docs, Gmail, and the Android operating system."
  },
  huggingface: {
    description: "Hugging Face is a developer platform and hub for open-source machine learning models, datasets, and AI demo applications.",
    funFact: "Hugging Face's name and logo are inspired by the hugging face emoji (🤗)."
  },
  midjourney: {
    description: "Midjourney is a generative artificial intelligence program that generates highly detailed, artistic images from natural language text prompts.",
    funFact: "Midjourney operates entirely through chat commands inside the Discord platform rather than a standalone website interface."
  },
  wikihow: {
    description: "wikiHow is an online database of detailed how-to guides and instruction manuals, covering thousands of daily life topics.",
    funFact: "wikiHow articles are illustrated with custom step-by-step vector drawings to guide users visually."
  },
  merriamwebster: {
    description: "Merriam-Webster is America's most trusted dictionary, providing definitions, spellings, pronunciations, and word games.",
    funFact: "Merriam-Webster was founded in 1831 and acquired the rights to Noah Webster's famous 1828 dictionary after his death."
  },
  accuweather: {
    description: "AccuWeather is a global media company providing commercial weather forecasting services, local weather forecasts, and weather alerts.",
    funFact: "AccuWeather trademarked the term 'RealFeel' to describe how the weather actually feels to a human body."
  },
  speedtest: {
    description: "Speedtest by Ookla is the premier web service providing free analysis of internet connection performance metrics (latency and bandwidth).",
    funFact: "Speedtest has been used to run more than 50 billion internet connection tests worldwide since its launch."
  },
  shopify: {
    description: "Shopify is a global e-commerce corporation offering a platform for merchants to build online storefronts, manage inventory, and process checkouts.",
    funFact: "Shopify was originally built in 2004 by founders who wanted to open an online snowboard equipment store."
  },
  bestbuy: {
    description: "Best Buy is a major American multinational consumer electronics retailer, operating brick-and-mortar stores and online catalogs.",
    funFact: "Best Buy was originally founded in 1966 as an audio specialty store called 'Sound of Music'."
  },
  ikea: {
    description: "IKEA is a Swedish multinational conglomerate that designs and sells ready-to-assemble furniture, kitchen appliances, and home accessories.",
    funFact: "The name IKEA is an acronym for Ingvar Kamprad (founder), Elmtaryd (his farm), and Agunnaryd (his hometown)."
  },
  nike: {
    description: "Nike is a global athletic footwear, apparel, and equipment corporation, famous for its 'Just Do It' slogan and athlete sponsorships.",
    funFact: "Nike's famous 'Swoosh' logo was designed by a college graphic design student in 1971 for just $35."
  },
  craigslist: {
    description: "Craigslist is an American classified advertisements website with sections devoted to jobs, housing, items for sale, and forums.",
    funFact: "Craigslist started in 1995 as a local email distribution list about events in the San Francisco Bay Area."
  },
  patreon: {
    description: "Patreon is a membership platform that provides business tools for content creators to run subscription-based content services.",
    funFact: "Patreon was co-founded by YouTube musician Jack Conte, who wanted a better way for fans to support his music videos."
  },
  soundcloud: {
    description: "SoundCloud is a European audio distribution platform and music sharing website that enables users to upload, promote, and share audio.",
    funFact: "SoundCloud popularized the visual wave-form comment interface, allowing users to write comments at specific timestamps."
  },
  hulu: {
    description: "Hulu is an American subscription video-on-demand service owned by The Walt Disney Company, streaming current TV episodes and original films.",
    funFact: "Hulu's name comes from a Mandarin word that can mean 'holder of precious things' or 'interactive play'."
  },
  disneyplus: {
    description: "Disney+ is a subscription video streaming service featuring a library of content from Disney, Pixar, Marvel, Star Wars, and National Geographic.",
    funFact: "Disney+ gained over 10 million subscribers within the first 24 hours of its launch in November 2019."
  },
  max: {
    description: "Max (formerly HBO Max) is a premium streaming service offering blockbuster movies, original series, and live sports from Warner Bros. Discovery.",
    funFact: "Max combines the content libraries of HBO, Warner Bros., DC Comics, and Discovery Channel under a single app."
  },
  deviantart: {
    description: "DeviantArt is the largest online social network for artists and art enthusiasts, providing a platform to exhibit, promote, and share artwork.",
    funFact: "Launched in August 2000, DeviantArt was initially built as a site to share customized skins for media players like Winamp."
  },
  ign: {
    description: "IGN (Imagine Games Network) is a leading media outlet focusing on video games, movies, television, and entertainment reviews.",
    funFact: "IGN is famous for its game review rating system, culminating in the highly coveted 'Masterpiece (10/10)' score."
  },
  theguardian: {
    description: "The Guardian is an influential British daily newspaper, globally respected for its independent journalism, environmental reporting, and free website.",
    funFact: "The Guardian is owned by a trust (The Scott Trust) designed to secure the financial and editorial independence of the paper forever."
  },
  reuters: {
    description: "Reuters is a major global news agency headquartered in London, providing news articles, photographs, and video broadcasts to corporate feeds.",
    funFact: "Founded in 1851 by Paul Reuter, the agency originally used homing pigeons to fly stock market prices between Brussels and Aachen."
  },
  forbes: {
    description: "Forbes is a prominent American business magazine and digital publisher, known for its lists on wealth, finance, and technology.",
    funFact: "Forbes' most famous annual publication is the 'World's Billionaires List', tracking global wealth figures."
  },
  techcrunch: {
    description: "TechCrunch is a leading technology newspaper focusing on startup profiles, venture capital funding news, and gadget reviews.",
    funFact: "TechCrunch hosts 'TechCrunch Disrupt', an annual conference where early-stage startups compete in a 'Startup Battlefield'."
  },
  wired: {
    description: "Wired is a monthly magazine and website focusing on how emerging technologies affect culture, the economy, and global politics.",
    funFact: "Wired famously popularized the terms 'Crowdsourcing' and 'Long Tail' in the early 2000s."
  },
  robinhood: {
    description: "Robinhood is a financial services application offering commission-free trading of stocks, ETFs, options, and cryptocurrencies.",
    funFact: "Robinhood popularized the gamification of mobile trading, including confetti animations on completing transactions."
  },
  stripe: {
    description: "Stripe is a major financial technology company providing credit card processing APIs and merchant billing services for web developers.",
    funFact: "Stripe was founded by Irish brothers Patrick and John Collison, who built the first prototype while in college in Boston."
  },
  vercel: {
    description: "Vercel is a developer-focused cloud platform specialized for hosting frontend frameworks, serverless APIs, and Next.js applications.",
    funFact: "Vercel is the creator and maintainer of Next.js, the React framework power-house used to build this website."
  },
  netlify: {
    description: "Netlify is a cloud computing company that offers hosting and serverless backend services for static websites and Jamstack applications.",
    funFact: "Netlify coined the term 'Jamstack' (JavaScript, APIs, and Markup) to describe modern decoupling of frontend and backend."
  },
  npm: {
    description: "NPM (Node Package Manager) is the default package manager for JavaScript and hosts the world's largest registry of open-source libraries.",
    funFact: "The NPM registry houses more than 2 million open-source packages, serving billions of downloads daily."
  },
  gitlab: {
    description: "GitLab is an open-source DevOps platform providing Git repository hosting, wiki guides, CI/CD pipelines, and issue tracking.",
    funFact: "GitLab operates as a fully remote company with employees in over 60 countries, and no physical office headquarters."
  },
  docker: {
    description: "Docker is a developer suite designed to build, run, and share containerized applications, enabling software to run consistently anywhere.",
    funFact: "Docker containers wrap software in complete filesystems containing everything it needs to run, from code to system tools."
  },
  stackexchange: {
    description: "Stack Exchange is a network of question-and-answer websites on diverse topics in varied fields, each covering a specific topic.",
    funFact: "The Stack Exchange network includes sites like MathOverflow, Ask Ubuntu, Super User, and Seasoned Advice."
  },
  wunderground: {
    description: "Weather Underground is a commercial weather service providing real-time weather forecasts, radar maps, and localized weather station reports.",
    funFact: "Weather Underground compiles data from more than 250,000 personal weather stations run by weather enthusiasts."
  },
  airbnb: {
    description: "Airbnb is an online marketplace connecting people who want to rent out their homes with travelers looking for accommodations.",
    funFact: "Airbnb was originally founded in 2008 when the founders inflated three air mattresses in their living room to rent out for cash."
  },
  uber: {
    description: "Uber is a multinational transportation network company offering ride-hailing services, food delivery, and freight transportation.",
    funFact: "Uber was originally founded under the name 'UberCab' in San Francisco after the founders struggled to get a taxi on a snowy night."
  },
  figma: {
    description: "Figma is a cloud-based collaborative design tool used for vector graphics, UI/UX prototyping, and design system sharing in real-time.",
    funFact: "Figma was the first design tool to support real-time multiplayer editing inside a web browser using WebGL."
  }
};

export function getSiteDetails(site: SiteConfig): SiteDetails {
  // Extract real-world description and fact
  const staticDetails = TOP_100_DETAILS[site.id];
  const description = staticDetails?.description || `${site.name} is a leading digital platform providing high-quality global content.`;
  const funFact = staticDetails?.funFact || "This site is recognized as one of the top 100 most visited destinations on the global internet.";

  // Generate deterministic analytics metrics based on rank
  const bounceRand = seedRandom(site.rank + 10);
  const bounceRate = `${(32.4 + bounceRand * 25.8).toFixed(1)}%`;

  const durationRand = seedRandom(site.rank + 11);
  const minutes = Math.floor(1 + durationRand * 11); // 1 to 12 mins
  const seconds = Math.floor(seedRandom(site.rank + 12) * 60);
  const visitDuration = `${minutes}m ${String(seconds).padStart(2, '0')}s`;

  // Desktop/Mobile Split
  const desktopRand = seedRandom(site.rank + 13);
  let desktopShare = Math.floor(35 + desktopRand * 40); // 35% to 75%
  
  // Categorical bias for device shares (e.g. dev tool is desktop biased, social is mobile biased)
  if (site.category === 'dev') {
    desktopShare = Math.min(95, desktopShare + 15);
  } else if (site.category === 'social' || site.category === 'entertainment') {
    desktopShare = Math.max(15, desktopShare - 20);
  }
  const mobileShare = 100 - desktopShare;

  // Geographic Top Sources (Select 4 countries deterministically)
  const COUNTRIES = [
    { name: "United States", code: "US" },
    { name: "India", code: "IN" },
    { name: "United Kingdom", code: "GB" },
    { name: "Germany", code: "DE" },
    { name: "Brazil", code: "BR" },
    { name: "Japan", code: "JP" },
    { name: "Canada", code: "CA" },
    { name: "France", code: "FR" },
    { name: "Australia", code: "AU" },
    { name: "Mexico", code: "MX" }
  ];

  const geographies: { country: string; percentage: number }[] = [];
  const selectedCountryIndices: number[] = [];
  
  // Choose 4 unique country indices
  let searchOffset = 0;
  while (selectedCountryIndices.length < 4) {
    const cRand = seedRandom(site.rank + 14 + searchOffset);
    const cIndex = Math.floor(cRand * COUNTRIES.length);
    if (!selectedCountryIndices.includes(cIndex)) {
      selectedCountryIndices.push(cIndex);
    }
    searchOffset++;
  }

  // Generate percentages totaling 100% (or leaving some minor remainder for "others")
  const sharesRand = seedRandom(site.rank + 15);
  let remaining = Math.floor(75 + sharesRand * 15); // Total top 4 country share (75% to 90%)
  
  selectedCountryIndices.forEach((cIndex, idx) => {
    const country = COUNTRIES[cIndex].name;
    let share = 0;
    
    if (idx === 3) {
      share = remaining;
    } else {
      const cShareRand = seedRandom(site.rank + 16 + idx);
      share = Math.max(5, Math.floor(cShareRand * (remaining / (2 - idx * 0.4))));
      remaining -= share;
    }
    
    geographies.push({ country, percentage: share });
  });

  // Sort geography by percentage descending
  geographies.sort((a, b) => b.percentage - a.percentage);

  // Traffic Trend History (24 hourly nodes)
  // Combine a base sine wave (representing global circadian rhythms) + random noise
  const trafficHistory: number[] = [];
  for (let h = 0; h < 24; h++) {
    // Wave peaks around 15:00 UTC (index 15) and dips at 04:00 UTC (index 4)
    const baseCircadian = Math.sin((h - 9) / 24 * 2 * Math.PI) * 28;
    const noise = (seedRandom(site.rank + h + 20) - 0.5) * 14;
    
    // Scale baseline index between 10% and 100% capacity
    const hourlyIndex = Math.max(10, Math.min(100, Math.round(62 + baseCircadian + noise)));
    trafficHistory.push(hourlyIndex);
  }

  // Static fallback keywords based on site category
  const fallbackKeywordsMap: Record<string, string[]> = {
    search: ['search engine', 'lookup online', 'find info', 'query search', 'web browser'],
    social: ['social networks', 'connect friends', 'sharing status', 'online community', 'chat tools'],
    ai: ['conversational ai', 'smart chatbot', 'intelligent assistant', 'ask questions', 'deep learning'],
    reference: ['online wiki', 'definitions lookup', 'general facts', 'open guide', 'information repository'],
    ecommerce: ['online store', 'shopping deals', 'buy retail', 'product reviews', 'order shipment'],
    entertainment: ['stream video', 'gaming online', 'music streams', 'fun play', 'watching clips'],
    news: ['latest headlines', 'world reports', 'current affairs', 'breaking updates', 'media articles'],
    finance: ['crypto trading', 'stock quotes', 'investment insights', 'money exchange', 'market values'],
    dev: ['git repository', 'code collaboration', 'developer api', 'software project', 'compiler tools']
  };

  const keywords = fallbackKeywordsMap[site.category] || ['website portal', 'web lookup', 'homepage link'];

  return {
    description,
    bounceRate,
    visitDuration,
    desktopShare,
    mobileShare,
    geographies,
    trafficHistory,
    funFact,
    keywords
  };
}
