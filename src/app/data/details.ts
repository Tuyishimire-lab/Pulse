import { SiteConfig } from './sites';

export interface SiteDossier {
  description: string;
  funFact: string;
  founded?: string;
  headquarters?: string;
  businessModel?: string;
  primaryTech?: string;
  marketIntelligence?: string;
}

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
  /** Set to 'cloudflare' when geo/device/history have been upgraded with real Radar data */
  radarSource?: string;
  founded: string;
  headquarters: string;
  businessModel: string;
  primaryTech: string;
  marketIntelligence: string;
}

// Seeded random matching sites.ts
function seedRandom(seed: number) {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

const TOP_100_DETAILS: Record<string, SiteDossier> = {
  google: {
    description: "Google is the world's preeminent search engine and digital ecosystem, processing billions of queries daily while serving as the foundational routing gateway for global internet traffic.",
    funFact: "Google handles over 90% of the global search market share, processing more than 8.5 billion complex searches every day.",
    founded: "1998",
    headquarters: "Mountain View, CA",
    businessModel: "Digital Advertising & Enterprise Cloud",
    primaryTech: "Google Borg & Global Anycast Datacenters",
    marketIntelligence: "Serves as the primary referral pipeline for global web destinations, routing tens of thousands of search queries per second across geo-distributed compute clusters."
  },
  youtube: {
    description: "YouTube is the world's largest video streaming platform and social video network, enabling billions of global users to discover, broadcast, and interact with visual content.",
    funFact: "More than 500 hours of new video content are uploaded to YouTube servers every minute from creators around the globe.",
    founded: "2005",
    headquarters: "San Bruno, CA",
    businessModel: "Advertising & YouTube Premium Subscriptions",
    primaryTech: "Google Global Cache & Adaptive QUIC Streaming",
    marketIntelligence: "Represents one of the largest single consumers of global transit bandwidth, utilizing custom video transcoding and local ISP caching nodes worldwide."
  },
  facebook: {
    description: "Facebook is the foundational social networking service operated by Meta, connecting over three billion active users through algorithmic news feeds, community groups, and marketplace tools.",
    funFact: "Facebook is the most widely adopted consumer social network in history, sustaining over 3.05 billion monthly active accounts.",
    founded: "2004",
    headquarters: "Menlo Park, CA",
    businessModel: "Targeted Programmatic Advertising",
    primaryTech: "Meta Open Compute Architecture & Custom Datacenters",
    marketIntelligence: "Maintains immense user retention in developing and established digital economies, functioning as an essential primary identity and communications gateway."
  },
  wikipedia: {
    description: "Wikipedia is a free, multilingual, open-collaboration digital encyclopedia maintained by a worldwide community of volunteer editors under the stewardship of the Wikimedia Foundation.",
    funFact: "Wikipedia hosts more than 62 million articles across 339 distinct language editions, operating entirely ad-free without commercial trackers.",
    founded: "2001",
    headquarters: "San Francisco, CA",
    businessModel: "Non-Profit Donations & Endowment",
    primaryTech: "MediaWiki, Linux & Global Varnish Caching",
    marketIntelligence: "Functions as the definitive reference layer for search engines, knowledge panels, and artificial intelligence grounding datasets worldwide."
  },
  instagram: {
    description: "Instagram is a mobile-first visual media network centered on photography, short-form Reels video, ephemeral Stories, and direct messaging between creators and audiences.",
    funFact: "Instagram reaches over 2 billion active monthly users, with short-form video Reels driving more than 50% of the platform's overall time spent.",
    founded: "2010",
    headquarters: "Menlo Park, CA",
    businessModel: "Visual Feed & Story Advertising",
    primaryTech: "Meta Private Cloud & Edge Content Delivery",
    marketIntelligence: "Drives substantial commercial commerce referral traffic and influencer discovery, exhibiting elevated engagement during evening and weekend mobile hours."
  },
  chatgpt: {
    description: "ChatGPT is OpenAI's flagship generative conversational AI platform, synthesizing real-time natural language answers, software code, creative writing, and multi-step reasoning.",
    funFact: "ChatGPT acquired 100 million active monthly users within 60 days of release, marking the fastest consumer technology adoption ramp in history.",
    founded: "2022",
    headquarters: "San Francisco, CA",
    businessModel: "Consumer Subscriptions & Enterprise API Tiers",
    primaryTech: "Microsoft Azure AI Supercomputing Clusters",
    marketIntelligence: "Consistently exhibits peak user activity during global business and school hours, transforming standard search behaviors into direct interactive problem-solving."
  },
  reddit: {
    description: "Reddit is a massive network of topic-specific communities where hundreds of millions of people discuss passions, evaluate news, and share authentic firsthand perspectives.",
    funFact: "Reddit hosts over 100,000 active subreddits, with users generating over 1.2 billion posts and comments annually.",
    founded: "2005",
    headquarters: "San Francisco, CA",
    businessModel: "Advertising, Data Licensing & Premium Tiers",
    primaryTech: "Fastly CDN & AWS Distributed Infrastructure",
    marketIntelligence: "Captures disproportionate organic search visibility as internet users increasingly seek human-curated opinions by appending 'reddit' to queries."
  },
  x: {
    description: "X (formerly Twitter) is a global real-time information network and microblogging platform where users track breaking world events, share media, and participate in public discussions.",
    funFact: "The platform transmits hundreds of millions of public posts daily, acting as the primary digital wire service for global news organizations.",
    founded: "2006",
    headquarters: "Bastrop, TX",
    businessModel: "X Premium Subscriptions & Digital Ads",
    primaryTech: "Custom Datacenter Clusters & Anycast Edge",
    marketIntelligence: "Experiences extreme traffic surges during major geopolitical developments, sporting events, breaking financial news, and technological releases."
  },
  yahoo: {
    description: "Yahoo is a classic web portal and search platform that consolidates search, news, email, finance, and weather services for hundreds of millions of users.",
    funFact: "Yahoo originally stood for 'Yet Another Hierarchical Officious Oracle' when it was founded in 1994.",
    founded: "1994",
    headquarters: "Sunnyvale, CA",
    businessModel: "Digital Advertising & Yahoo Finance Subscriptions",
    primaryTech: "Distributed Cloud & Enterprise Datacenters",
    marketIntelligence: "Maintains resilient high-volume traffic driven by Yahoo Finance and Yahoo Mail loyalty among adult desktop web demographics."
  },
  amazon: {
    description: "Amazon is the global titan of e-commerce and cloud computing, offering retail goods, digital streaming, and server infrastructure to millions.",
    funFact: "Amazon was originally founded in Jeff Bezos' garage as an online bookstore before expanding to sell almost everything.",
    founded: "1994",
    headquarters: "Seattle, WA",
    businessModel: "E-Commerce Retail, Marketplace & AWS Cloud",
    primaryTech: "Amazon Web Services (AWS) Infrastructure",
    marketIntelligence: "Dominates consumer product discovery, capturing a higher share of direct product search requests than traditional search engines."
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
    funFact: "Hugging Face's name and logo are inspired by the Hugging Face mascot."
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
    funFact: "Figma was the first design tool to support real-time multiplayer editing inside a web browser using WebGL.",
    founded: "2012",
    headquarters: "San Francisco, CA",
    businessModel: "Enterprise SaaS Subscription",
    primaryTech: "WebGL, WebAssembly & AWS Cloud",
    marketIntelligence: "Maintains intense weekday usage among design and engineering teams, driving substantial sustained web session durations."
  },
  threads: {
    description: "Threads is Meta's text-first microblogging and social networking platform integrated with Instagram's identity system and designed for real-time public conversations.",
    funFact: "Threads achieved 100 million registered users in under five days, becoming the fastest consumer application to reach that threshold in internet history.",
    founded: "2023",
    headquarters: "Menlo Park, CA",
    businessModel: "Digital Advertising",
    primaryTech: "Meta Private Cloud & ActivityPub Protocol",
    marketIntelligence: "Bypasses cold-start network friction by leveraging Instagram's pre-existing social graph, generating steady mobile-first engagement."
  },
  kick: {
    description: "Kick is a creator-first livestreaming platform designed for gaming, esports, and interactive broadcasting with high-bitrate video streams.",
    funFact: "Kick disrupted the live streaming industry by offering creators a 95% subscription revenue split, compared to the 50% split on legacy platforms.",
    founded: "2022",
    headquarters: "Melbourne, Australia",
    businessModel: "Creator Subscriptions & Brand Sponsorships",
    primaryTech: "AWS Interactive Video Service & WebRTC",
    marketIntelligence: "Aggressive creator margins have attracted prominent broadcasters, driving high peak-traffic events during live esports tournaments."
  },
  perplexity: {
    description: "Perplexity is an AI-powered conversational search and research engine that synthesizes live web indexes into structured answers with numbered, verifiable citations.",
    funFact: "Founded in 2022 by former OpenAI and DeepMind researchers, Perplexity processes over 250 million research queries each month.",
    founded: "2022",
    headquarters: "San Francisco, CA",
    businessModel: "Freemium & Pro Search API",
    primaryTech: "Cloudflare & Custom Distributed Inference",
    marketIntelligence: "Pioneering the shift from ten blue links to direct answer synthesis, maintaining higher query depth and dwell time per session than traditional search."
  },
  substack: {
    description: "Substack is a digital publishing platform providing writers, journalists, and media creators with direct-to-subscriber newsletters, podcasts, and communities.",
    funFact: "Top independent writers on Substack generate over $1 million annually in subscription revenue, operating free of traditional editorial gates.",
    founded: "2017",
    headquarters: "San Francisco, CA",
    businessModel: "10% Platform Revenue Share",
    primaryTech: "AWS Cloud & Stripe Connect",
    marketIntelligence: "Traffic exhibits sharp morning dispatch spikes aligned with regional newsletter release schedules, with strong subscriber retention."
  },
  bsky: {
    description: "Bluesky is an open social networking platform built on the decentralized Authenticated Transfer (AT) Protocol, offering customizable algorithmic feeds and federated identity.",
    funFact: "Bluesky was initiated in 2019 by Twitter co-founder Jack Dorsey as an open-source protocol research project before spinning out independently.",
    founded: "2021",
    headquarters: "Seattle, WA",
    businessModel: "Custom Domain Sales & Network Services",
    primaryTech: "AT Protocol & Anycast Cloud Infrastructure",
    marketIntelligence: "Experiences rapid bursts of organic network migration during policy and algorithmic shifts across centralized social networks."
  },
  suno: {
    description: "Suno is a generative AI music creation system that synthesizes complete songs including vocal harmonies, instruments, lyrics, and production arrangements from text prompts.",
    funFact: "Suno's neural network generates studio-quality, full-length audio tracks in seconds using deep acoustic diffusion models.",
    founded: "2023",
    headquarters: "Cambridge, MA",
    businessModel: "Monthly Credit Subscriptions",
    primaryTech: "Custom Acoustic Diffusion Models",
    marketIntelligence: "Viral distribution of AI-composed songs drives strong organic referral loops across video platforms and social networks."
  },
  cursor: {
    description: "Cursor is an AI-first integrated development environment built as a performance fork of VS Code, featuring whole-codebase semantic indexing and multi-file code generation.",
    funFact: "Created by Anysphere, Cursor uses speculative decoding and custom fine-tuned frontier models to predict multi-line code modifications in real time.",
    founded: "2023",
    headquarters: "San Francisco, CA",
    businessModel: "Developer SaaS Subscriptions",
    primaryTech: "VS Code Core & Anthropic/OpenAI Inference",
    marketIntelligence: "Rapidly capturing software engineer mindshare through deep repository comprehension, driving high recurring weekday developer sessions."
  },
  supabase: {
    description: "Supabase is an open-source cloud backend platform providing developers with dedicated PostgreSQL databases, authentication, edge functions, and real-time subscriptions.",
    funFact: "Supabase powers millions of active databases globally by pairing PostgreSQL with instant auto-generated REST and GraphQL APIs.",
    founded: "2020",
    headquarters: "San Francisco, CA / Remote",
    businessModel: "Compute Usage & Enterprise Cloud Tiers",
    primaryTech: "PostgreSQL, Elixir, & Deno Edge Runtime",
    marketIntelligence: "Functions as standard cloud infrastructure for Next.js and modern web applications, generating steady global engineering traffic."
  },
  copilot: {
    description: "Microsoft Copilot is an enterprise and consumer generative AI assistant deeply integrated across Windows, Microsoft 365, Bing, and Azure OpenAI infrastructure.",
    funFact: "Microsoft Copilot processes hundreds of millions of multimodal workspace prompts monthly across Fortune 500 enterprises.",
    founded: "2023",
    headquarters: "Redmond, WA",
    businessModel: "Enterprise M365 Add-ons & Consumer Pro Tiers",
    primaryTech: "Azure OpenAI Service & Global Edge Mesh",
    marketIntelligence: "Exhibits heavy weekday enterprise desktop utilization driven by native Windows taskbar and Office 365 productivity workflows."
  },
  grok: {
    description: "Grok is xAI’s flagship frontier reasoning and real-time conversational AI platform powered by the Colossus supercluster and live public discourse streams.",
    funFact: "Grok was trained on xAI’s Memphis Colossus supercomputer cluster featuring over 200,000 NVIDIA Hopper GPUs.",
    founded: "2023",
    headquarters: "Palo Alto, CA",
    businessModel: "SuperGrok Subscriptions & API Access",
    primaryTech: "xAI Colossus GPU Cluster & Rust Inference Engine",
    marketIntelligence: "Surges during breaking global news events due to its real-time synthesis of public social telemetry and reasoning models."
  },
  notebooklm: {
    description: "NotebookLM is Google Labs’ source-grounded AI research and note-taking assistant capable of synthesizing complex documents into interactive audio overviews.",
    funFact: "NotebookLM’s viral Audio Overview feature sparked massive adoption among university researchers, students, and analysts worldwide.",
    founded: "2023",
    headquarters: "Mountain View, CA",
    businessModel: "Google One AI Premium & Workspace Enterprise",
    primaryTech: "Gemini Long-Context TPU v5p Clusters",
    marketIntelligence: "Demonstrates exceptionally high session duration as users upload PDFs, lectures, and technical repositories for grounded synthesis."
  },
  leonardo: {
    description: "Leonardo.Ai is a generative visual production suite for creating concept art, game assets, textures, and cinematic AI video workflows.",
    funFact: "Acquired by Canva in 2024, Leonardo.Ai has generated billions of visual assets for indie game studios and creative teams.",
    founded: "2022",
    headquarters: "Sydney, Australia",
    businessModel: "Freemium Token Subscriptions & Enterprise Studio",
    primaryTech: "Phoenix Foundation Model & AWS GPU Clusters",
    marketIntelligence: "Maintains strong global creator retention across North America, Europe, and Asia-Pacific design communities."
  },
  kling: {
    description: "Kling AI is a next-generation neural video and image synthesis platform developed by Kuaishou, enabling realistic 1080p motion generation.",
    funFact: "Kling AI pioneered 3D spatiotemporal attention mechanisms capable of simulating complex physical motion up to two minutes in length.",
    founded: "2024",
    headquarters: "Beijing, China",
    businessModel: "Credit Subscriptions & Pro Video Tiers",
    primaryTech: "3D Diffusion Transformer & Custom GPU Cloud",
    marketIntelligence: "Rapidly expanding among digital filmmakers, advertising agencies, and social video creators worldwide."
  },
  ollama: {
    description: "Ollama is the standard runtime and model library for running, packaging, and deploying open-weight large language models locally.",
    funFact: "Ollama has become the default local distribution hub for Llama, DeepSeek, Qwen, Gemma, and Mistral models across macOS, Linux, and Windows.",
    founded: "2023",
    headquarters: "Palo Alto, CA",
    businessModel: "Open Source Runtime & Enterprise Cloud Tooling",
    primaryTech: "Go, llama.cpp & GGUF Model Registry",
    marketIntelligence: "Experiences massive traffic spikes immediately following major open-weight model releases from Meta, DeepSeek, and Alibaba."
  },
  v0: {
    description: "v0 is Vercel’s generative UI and full-stack web engineering agent that turns natural language prompts into production React, Next.js, and Tailwind applications.",
    funFact: "v0 combines frontier code models with live browser sandboxes and instant one-click Vercel deployment pipelines.",
    founded: "2023",
    headquarters: "San Francisco, CA",
    businessModel: "Developer Subscriptions & Team Seats",
    primaryTech: "Next.js, Shadcn UI & Vercel Edge Compute",
    marketIntelligence: "Heavily utilized by frontend engineers, product designers, and startup founders prototyping production web interfaces."
  },
  lovable: {
    description: "Lovable is an AI full-stack software engineer that enables builders to create, iterate, and deploy web applications with native Supabase and GitHub integration.",
    funFact: "Lovable became one of Europe’s fastest-growing AI software startups by empowering non-technical and technical creators to ship full-stack apps.",
    founded: "2023",
    headquarters: "Stockholm, Sweden",
    businessModel: "Tiered Builder Subscriptions",
    primaryTech: "React, Vite, Supabase & Cloud Sandboxes",
    marketIntelligence: "Exhibits high repeat daily engagement and long session times as users iteratively build and deploy SaaS products."
  },
  bolt: {
    description: "Bolt.new is StackBlitz’s browser-based AI web development agent running full Node.js environments directly inside the browser via WebContainers.",
    funFact: "Powered by WebContainers, Bolt.new boots full-stack Node.js servers in milliseconds inside the client browser without remote VM latency.",
    founded: "2024",
    headquarters: "San Francisco, CA",
    businessModel: "Token-Based Developer Subscriptions",
    primaryTech: "StackBlitz WebContainers & Frontier Code LLMs",
    marketIntelligence: "Drives strong cross-referral traffic with Netlify, Supabase, and GitHub ecosystems."
  },
  you: {
    description: "You.com is an AI-powered search and research engine founded by former Salesforce chief scientist Richard Socher, combining real-time web citations with multi-model AI agents.",
    funFact: "You.com was one of the first search engines to integrate live web citations directly into conversational LLM responses in 2022.",
    founded: "2020",
    headquarters: "Palo Alto, CA",
    businessModel: "Freemium, YouPro Subscriptions & Enterprise API",
    primaryTech: "Multi-Model AI Routing, React, Python & Cloudflare",
    marketIntelligence: "Attracts research-heavy desktop traffic comparing frontier LLMs alongside live web search results."
  },
  aws: {
    description: "Amazon Web Services (AWS) is the world’s most comprehensive and broadly adopted cloud infrastructure platform, offering over 200 services from global data centers.",
    funFact: "AWS accounts for roughly a third of the global cloud infrastructure market, powering millions of enterprise and startup workloads.",
    founded: "2006",
    headquarters: "Seattle, WA",
    businessModel: "Pay-As-You-Go Cloud Compute & Enterprise Contracts",
    primaryTech: "AWS Nitro Hypervisor, Graviton & Global Fiber Backbone",
    marketIntelligence: "Acts as the foundational compute, storage, and CDN backbone for a vast share of the modern internet."
  },
  wordpress: {
    description: "WordPress.com is Automattic’s managed web publishing, CMS, and commerce hosting platform built on the open-source WordPress ecosystem.",
    funFact: "The broader WordPress software ecosystem powers over 43% of all websites indexed on the public internet.",
    founded: "2005",
    headquarters: "San Francisco, CA",
    businessModel: "Managed Web Hosting, Domains & VIP Enterprise",
    primaryTech: "PHP, MySQL, React & Automattic Global Edge CDN",
    marketIntelligence: "Sustains massive global organic traffic across blogs, editorial publications, and WooCommerce storefronts."
  },
  wix: {
    description: "Wix is a cloud-based web development and business management platform empowering over 250 million registered users to build and scale websites.",
    funFact: "Wix Studio and Wix AI site generators create millions of custom responsive business websites each year without manual coding.",
    founded: "2006",
    headquarters: "Tel Aviv, Israel",
    businessModel: "SaaS Website Subscriptions & Commerce Payments",
    primaryTech: "Node.js, React & Multi-Cloud Edge Routing",
    marketIntelligence: "Strong adoption among SMBs, agencies, and e-commerce merchants across North America and Europe."
  },
  godaddy: {
    description: "GoDaddy is the world’s largest domain name registrar and web hosting provider for entrepreneurs and small businesses.",
    funFact: "GoDaddy manages more than 84 million domain names for over 20 million customers globally.",
    founded: "1997",
    headquarters: "Tempe, AZ",
    businessModel: "Domain Registration, DNS, Hosting & Commerce",
    primaryTech: "Global Anycast DNS & Cloud Hosting Infrastructure",
    marketIntelligence: "Serves as the primary barometer for new small-business formation and domain aftermarket demand."
  },
  squarespace: {
    description: "Squarespace is an all-in-one design-driven website builder, e-commerce platform, and domain registrar for creators and brands.",
    funFact: "Following its acquisition of Google Domains assets, Squarespace expanded its footprint by millions of registered domains.",
    founded: "2003",
    headquarters: "New York, NY",
    businessModel: "SaaS Subscriptions, Domains & Scheduling",
    primaryTech: "Java, React & Global Content Delivery Network",
    marketIntelligence: "Highly favored by creative professionals, restaurants, photographers, and independent service brands."
  },
  namecheap: {
    description: "Namecheap is an ICANN-accredited domain registrar and web infrastructure provider popular with developers, startups, and privacy advocates.",
    funFact: "Namecheap manages over 17 million domains and pioneered free lifetime WHOIS privacy protection for registrants.",
    founded: "2000",
    headquarters: "Phoenix, AZ",
    businessModel: "Domains, SSL, DNS, Email & Managed WordPress",
    primaryTech: "Anycast PremiumDNS & Cloud Hosting Clusters",
    marketIntelligence: "Commands strong loyalty among indie hackers, web3 builders, and software developers registering project domains."
  },
  datadog: {
    description: "Datadog is the observability and security platform for cloud-scale applications, unifying infrastructure metrics, APM traces, logs, and SIEM.",
    funFact: "Datadog ingests tens of trillions of telemetry events daily across over 750 built-in infrastructure integrations.",
    founded: "2010",
    headquarters: "New York, NY",
    businessModel: "Usage-Based Enterprise SaaS Observability",
    primaryTech: "Go, Rust, Husky Columnar Store & Multi-Cloud",
    marketIntelligence: "Traffic spikes during major cloud provider incidents as SRE and DevOps teams monitor live service dashboards."
  },
  grafana: {
    description: "Grafana Labs builds the open and composable operational dashboards, observability stack (LGTM: Loki, Grafana, Tempo, Mimir), and Grafana Cloud.",
    funFact: "Over 20 million users worldwide rely on Grafana dashboards to visualize time-series metrics from Prometheus to industrial IoT.",
    founded: "2014",
    headquarters: "New York, NY",
    businessModel: "Open Core & Grafana Cloud Managed SaaS",
    primaryTech: "Go, TypeScript, Prometheus & Mimir",
    marketIntelligence: "Heavy developer documentation and plugin directory traffic from Kubernetes and cloud-native engineering teams."
  },
  render: {
    description: "Render is a unified cloud application platform that builds and runs web services, Postgres databases, Redis, and background workers from Git.",
    funFact: "Render has become the primary modern cloud successor for millions of developers migrating from legacy PaaS platforms.",
    founded: "2018",
    headquarters: "San Francisco, CA",
    businessModel: "Usage-Based Compute & Team Cloud Tiers",
    primaryTech: "Kubernetes, Envoy & Automated Git Deployments",
    marketIntelligence: "Consistent growth driven by full-stack Python, Node.js, and Docker deployments."
  },
  railway: {
    description: "Railway is an instant infrastructure cloud platform designed for developers to provision databases, microservices, and cron jobs in seconds.",
    funFact: "Railway’s visual canvas lets engineering teams deploy interconnected multi-service architectures with zero YAML configuration.",
    founded: "2020",
    headquarters: "San Francisco, CA",
    businessModel: "Resource-Metered Cloud Subscriptions",
    primaryTech: "Rust, Nixpacks & Bare-Metal Cloud Regions",
    marketIntelligence: "High viral adoption through one-click open-source template deployments."
  },
  vk: {
    description: "VK (VKontakte) is the largest social networking, messaging, music, and video ecosystem across Russia and the CIS region.",
    funFact: "VK serves over 100 million monthly active users with integrated mini-apps, live streaming, and social commerce.",
    founded: "2006",
    headquarters: "Saint Petersburg, Russia",
    businessModel: "Advertising, VK Music Subscriptions & Mini-Apps",
    primaryTech: "KPHP, Custom Distributed Storage & Edge CDN",
    marketIntelligence: "Dominates social and media consumption across Eastern Europe and Central Asia."
  },
  weibo: {
    description: "Sina Weibo is China’s premier microblogging and public discourse platform, connecting nearly 600 million monthly active users with trending news and celebrities.",
    funFact: "Weibo’s real-time Hot Search list is the primary barometer for breaking cultural, entertainment, and social trends across China.",
    founded: "2009",
    headquarters: "Beijing, China",
    businessModel: "Brand Advertising, Promoted Feeds & VIP Memberships",
    primaryTech: "Hybrid Cloud & High-Concurrency Feed Engine",
    marketIntelligence: "Generates massive traffic spikes during major holidays, sports championships, and entertainment broadcasts."
  },
  snapchat: {
    description: "Snapchat is Snap Inc.’s visual messaging, augmented reality (AR) lens, and Spotlight short-form video platform.",
    funFact: "Snapchat reaches over 850 million monthly active users globally, including more than 75% of 13-to-34-year-olds in over 25 countries.",
    founded: "2011",
    headquarters: "Santa Monica, CA",
    businessModel: "AR Lens Sponsorships, Video Ads & Snapchat+",
    primaryTech: "Lens Studio AR Engine & Multi-Cloud Infrastructure",
    marketIntelligence: "Web traffic has grown significantly following the launch of Snapchat for Web and public Spotlight story indexing."
  },
  tumblr: {
    description: "Tumblr is a microblogging and social curation platform known for fandom communities, digital art, and creative multimedia blogs.",
    funFact: "Tumblr hosts more than 550 million distinct blogs and hundreds of billions of reblogged creative posts.",
    founded: "2007",
    headquarters: "New York, NY",
    businessModel: "Advertising, Tumblr Blaze & Supporter Perks",
    primaryTech: "PHP, React & Automattic Cloud Infrastructure",
    marketIntelligence: "Retains a deeply engaged global audience of artists, writers, and pop-culture fandom communities."
  },
  line: {
    description: "LINE is the dominant super-app for instant messaging, digital payments, news, and entertainment across Japan, Taiwan, and Thailand.",
    funFact: "Over 90% of Japan’s smartphone population uses LINE daily for communication, official brand accounts, and municipal services.",
    founded: "2011",
    headquarters: "Tokyo, Japan",
    businessModel: "Business Connect, Stickers, LINE Pay & News Ads",
    primaryTech: "Verda Private Cloud & High-Throughput Messaging",
    marketIntelligence: "Anchors digital commerce and news distribution across East and Southeast Asian markets."
  },
  nextdoor: {
    description: "Nextdoor is the hyperlocal neighborhood network connecting verified residents, local businesses, and public agencies across 330,000+ neighborhoods.",
    funFact: "Nearly 1 in 3 households in the United States uses Nextdoor for local recommendations, safety alerts, and neighborhood classifieds.",
    founded: "2010",
    headquarters: "San Francisco, CA",
    businessModel: "Hyperlocal SMB & Brand Advertising",
    primaryTech: "Python, Go, geospatial indexing & AWS",
    marketIntelligence: "High local search visibility for home service recommendations and community alerts."
  },
  mastodon: {
    description: "Mastodon is a free, open-source decentralized social networking platform powering the interconnected ActivityPub Fediverse.",
    funFact: "Mastodon operates across thousands of independent community-run servers that federate seamlessly without central corporate ownership.",
    founded: "2016",
    headquarters: "Berlin, Germany",
    businessModel: "Non-Profit Crowdfunding & Grants",
    primaryTech: "Ruby on Rails, Sidekiq, PostgreSQL & ActivityPub",
    marketIntelligence: "Strong adoption among open-source developers, academics, European public institutions, and journalists."
  },
  mercadolibre: {
    description: "Mercado Libre is Latin America’s largest e-commerce marketplace and fintech ecosystem, operating across 18 countries including Brazil, Mexico, and Argentina.",
    funFact: "Mercado Libre processes over 45 items sold per second alongside hundreds of millions of Mercado Pago fintech transactions.",
    founded: "1999",
    headquarters: "Montevideo, Uruguay",
    businessModel: "Marketplace Commissions, Logistics & Mercado Pago",
    primaryTech: "Fury Internal PaaS, Go, Java & Multi-Cloud",
    marketIntelligence: "Uncontested digital commerce and digital wallet leader across South and Central America."
  },
  rakuten: {
    description: "Rakuten Ichiba is Japan’s flagship e-commerce marketplace and loyalty ecosystem, spanning retail, fintech, banking, and mobile telecom.",
    funFact: "Rakuten has distributed trillions of Rakuten Points across Japan, tying together over 70 digital and financial services.",
    founded: "1997",
    headquarters: "Tokyo, Japan",
    businessModel: "Merchant Storefronts, Fintech & Loyalty Ecosystem",
    primaryTech: "Rakuten Cloud & Hybrid Edge Datacenters",
    marketIntelligence: "Dominates Japanese online retail alongside Amazon Japan, with massive seasonal Super Sale traffic surges."
  },
  flipkart: {
    description: "Flipkart is India’s leading homegrown e-commerce marketplace, serving over 500 million registered customers across 80+ product categories.",
    funFact: "Flipkart’s annual Big Billion Days festival generates billions of dollars in gross merchandise value across Tier-2 and Tier-3 Indian cities.",
    founded: "2007",
    headquarters: "Bengaluru, India",
    businessModel: "Marketplace Retail, Ekart Logistics & Retail Media",
    primaryTech: "Flipkart Private Cloud & High-Scale Java Microservices",
    marketIntelligence: "Exhibits heavily mobile-first traffic patterns driven by vernacular voice and regional language shopping in India."
  },
  coupang: {
    description: "Coupang is South Korea’s largest e-commerce retailer, renowned for its Rocket Delivery logistics network that delivers orders within hours.",
    funFact: "Over 70% of South Korea’s population lives within 10 minutes of a Coupang logistics center, enabling dawn delivery by 7 AM.",
    founded: "2010",
    headquarters: "Seoul, South Korea",
    businessModel: "Direct Retail, Rocket WOW Memberships & Coupang Eats",
    primaryTech: "AI Fulfillment Routing & AWS Cloud",
    marketIntelligence: "Commands industry-leading purchase frequency and repeat daily visits in the East Asian retail market."
  },
  homedepot: {
    description: "The Home Depot is the world’s largest home improvement retailer, blending over 2,300 physical warehouse stores with a massive digital commerce platform.",
    funFact: "More than half of Home Depot’s online orders are fulfilled directly through its interconnected physical store network.",
    founded: "1978",
    headquarters: "Atlanta, GA",
    businessModel: "Omnichannel Retail & Pro Contractor Supply",
    primaryTech: "Google Cloud Platform & Omnichannel Inventory Mesh",
    marketIntelligence: "Peaks during spring and summer building seasons as homeowners and contractors research inventory and local pricing."
  },
  costco: {
    description: "Costco Wholesale operates an international chain of membership warehouses and a high-volume e-commerce portal for bulk goods, electronics, and travel.",
    funFact: "Costco serves over 130 million cardholders worldwide with a membership renewal rate exceeding 90% in North America.",
    founded: "1983",
    headquarters: "Issaquah, WA",
    businessModel: "Annual Membership Fees & Low-Margin Bulk Retail",
    primaryTech: "Microsoft Azure & Akamai Edge Delivery",
    marketIntelligence: "Generates high average order values across appliances, precious metals, electronics, and Costco Travel."
  },
  doordash: {
    description: "DoorDash is the largest local commerce and on-demand food, grocery, and retail delivery marketplace in North America.",
    funFact: "DoorDash and its Wolt subsidiary operate across more than 30 countries, fulfilling billions of local delivery orders.",
    founded: "2013",
    headquarters: "San Francisco, CA",
    businessModel: "Delivery Commissions, DashPass & Sponsored Listings",
    primaryTech: "Kotlin, gRPC, CockroachDB & Real-Time Dispatch ML",
    marketIntelligence: "Sharp diurnal traffic spikes every day around lunch (12:00) and dinner (18:00–20:00) across local time zones."
  },
  wayfair: {
    description: "Wayfair is a leading online destination for home furnishings, decor, and housewares, cataloging tens of millions of items from thousands of suppliers.",
    funFact: "Wayfair operates its own Castlegate logistics and last-mile delivery network engineered specifically for oversized furniture.",
    founded: "2002",
    headquarters: "Boston, MA",
    businessModel: "Drop-Ship & Fulfilled Home Goods Marketplace",
    primaryTech: "Google Cloud, GraphQL & 3D Room Visualization",
    marketIntelligence: "Strong weekend browsing sessions driven by residential moving cycles and seasonal Way Day promotions."
  },
  instacart: {
    description: "Instacart is North America’s leading grocery technology company, partnering with over 1,500 retail banners across 85,000+ local stores.",
    funFact: "Instacart powers both its own consumer marketplace and the white-label e-commerce storefronts of hundreds of major supermarket chains.",
    founded: "2012",
    headquarters: "San Francisco, CA",
    businessModel: "Instacart+ Subscriptions, Delivery Fees & CPG Ads",
    primaryTech: "Ruby, Python, Postgres & Real-Time Inventory ML",
    marketIntelligence: "Peaks on Sundays and Mondays as households plan weekly grocery replenishment."
  },
  primevideo: {
    description: "Amazon Prime Video is a global streaming television, movie, and live sports platform included with Amazon Prime memberships.",
    funFact: "Prime Video streams exclusive live NFL Thursday Night Football, UEFA Champions League, and NBA broadcasts to tens of millions of concurrent viewers.",
    founded: "2006",
    headquarters: "Seattle, WA",
    businessModel: "Prime Subscriptions, Ad-Supported Tiers & Channels",
    primaryTech: "AWS CloudFront, Elemental Live & Low-Latency HLS",
    marketIntelligence: "Surges during live sports broadcasts and global tentpole series premieres."
  },
  dailymotion: {
    description: "Dailymotion is a global video discovery and player syndication platform owned by Vivendi, serving hundreds of millions of monthly viewers.",
    funFact: "Dailymotion’s embedded video player is syndicated across thousands of major international news publishers and sports portals.",
    founded: "2005",
    headquarters: "Paris, France",
    businessModel: "Programmatic Video Advertising & Publisher Syndication",
    primaryTech: "Hybrid European Cloud & Custom Video CDN",
    marketIntelligence: "Strong international footprint across Europe, Francophone markets, and South Asia."
  },
  myanimelist: {
    description: "MyAnimeList (MAL) is the world’s largest anime and manga cataloging community, database, and review authority.",
    funFact: "Over 18 million active members track, score, and debate tens of thousands of anime episodes and manga chapters on MyAnimeList.",
    founded: "2004",
    headquarters: "Tokyo, Japan",
    businessModel: "Advertising, Licensing & Supporter Memberships",
    primaryTech: "PHP, MySQL & Cloudflare Global Caching",
    marketIntelligence: "Exhibits exceptionally high pages-per-visit as fans update watchlists during seasonal animesimulcasts."
  },
  applemusic: {
    description: "Apple Music is Apple’s global music and audio streaming service offering over 100 million songs in lossless audio and Spatial Audio with Dolby Atmos.",
    funFact: "Apple Music broadcasts live 24/7 global radio stations from studios in Los Angeles, New York, London, Paris, Berlin, and Tokyo.",
    founded: "2015",
    headquarters: "Cupertino, CA",
    businessModel: "Individual, Family & Apple One Subscriptions",
    primaryTech: "Apple Edge CDN, ALAC Lossless & MusicKit Web",
    marketIntelligence: "Web player and catalog deep links drive strong discovery traffic alongside native iOS and macOS apps."
  },
  rottentomatoes: {
    description: "Rotten Tomatoes is the entertainment industry’s leading review-aggregation authority for film and television, famous for the Tomatometer score.",
    funFact: "A Certified Fresh rating on the Tomatometer directly influences theatrical box office turnout and streaming viewership.",
    founded: "1998",
    headquarters: "Beverly Hills, CA",
    businessModel: "Entertainment Display Advertising & Fandango Ticketing",
    primaryTech: "AWS, Next.js & Fandango Media Commerce Stack",
    marketIntelligence: "Spikes sharply every Thursday and Friday as weekend moviegoers check critic and audience scores."
  },
  lichess: {
    description: "Lichess is a free, open-source, ad-free online chess server powered by volunteers and community donations.",
    funFact: "Lichess hosts over 5 million games of chess every single day on remarkably lean open-source Scala and Rust servers.",
    founded: "2010",
    headquarters: "Paris, France",
    businessModel: "100% Free & Patron Donor Funded Non-Profit",
    primaryTech: "Scala, Rust, MongoDB, WebSockets & Stockfish WASM",
    marketIntelligence: "Boasts extraordinary session durations and WebSocket concurrency with zero commercial trackers."
  },
  itchio: {
    description: "itch.io is an open marketplace and game jam platform for independent digital creators with a focus on indie video games, assets, and zines.",
    funFact: "itch.io hosts nearly 1 million indie games and powers thousands of global game development jams including GMTK Game Jam.",
    founded: "2013",
    headquarters: "San Francisco, CA",
    businessModel: "Creator-Defined Revenue Share Marketplace",
    primaryTech: "MoonScript, Lua, OpenResty & HTML5 WebGL Embeds",
    marketIntelligence: "Serves as the primary launchpad for viral experimental and browser-playable indie games."
  },
  foxnews: {
    description: "Fox News Digital is one of the most visited news and political commentary destinations in the United States, operated by Fox Corporation.",
    funFact: "FoxNews.com consistently ranks among the top three U.S. digital news properties by total multiplatform minutes spent.",
    founded: "1996",
    headquarters: "New York, NY",
    businessModel: "Digital Display & Video Advertising, Fox Nation",
    primaryTech: "Akamai Edge CDN & Cloud Publishing Stack",
    marketIntelligence: "High direct homepage loyalty and long return-visit frequency among U.S. audiences."
  },
  cnbc: {
    description: "CNBC is NBCUniversal’s global leader in business news, real-time financial market coverage, and economic analysis.",
    funFact: "CNBC reaches hundreds of millions of monthly readers and investors tracking live Wall Street, Federal Reserve, and earnings news.",
    founded: "1989",
    headquarters: "Englewood Cliffs, NJ",
    businessModel: "Financial Advertising, CNBC Pro & Investing Club",
    primaryTech: "Real-Time Market Ticker Feeds & Akamai CDN",
    marketIntelligence: "Traffic surges sharply between 09:00 and 16:30 EST around U.S. market open, CPI prints, and tech earnings."
  },
  washingtonpost: {
    description: "The Washington Post is an American daily newspaper and digital news organization renowned for national political reporting and investigative journalism.",
    funFact: "The Washington Post built the Arc XP publishing platform, which also powers major newsrooms around the world.",
    founded: "1877",
    headquarters: "Washington, D.C.",
    businessModel: "Digital Subscriptions, Print & Arc XP Licensing",
    primaryTech: "Arc XP, AWS & Next.js",
    marketIntelligence: "Captures intense national and international readership during election cycles and policy debates."
  },
  wsj: {
    description: "The Wall Street Journal is Dow Jones’s flagship international business, financial, and economic daily publication.",
    funFact: "WSJ sustains over 4 million paying subscribers, making it one of the largest paid digital business publications globally.",
    founded: "1889",
    headquarters: "New York, NY",
    businessModel: "Paid Digital Subscriptions & Institutional Licensing",
    primaryTech: "AWS, React & Dow Jones Newswires",
    marketIntelligence: "Attracts affluent institutional and executive readership during global trading hours."
  },
  theverge: {
    description: "The Verge is Vox Media’s flagship technology, science, hardware review, and digital culture publication.",
    funFact: "The Verge’s liveblog story stream format drives massive real-time engagement during Apple, Google, and CES hardware keynotes.",
    founded: "2011",
    headquarters: "New York, NY",
    businessModel: "Digital Subscriptions, Advertising & Affiliate Commerce",
    primaryTech: "Chorus Publishing Platform, Next.js & Fastly CDN",
    marketIntelligence: "High search authority for consumer electronics reviews, AI policy, and technology journalism."
  },
  arstechnica: {
    description: "Ars Technica is a premier technology, science, space, and IT policy publication serving deeply technical readers for over 25 years.",
    funFact: "Founded in 1998, Ars Technica is famous for its multi-page architectural deep dives into CPUs, operating systems, and rocket propulsion.",
    founded: "1998",
    headquarters: "New York, NY",
    businessModel: "Display Advertising & Ars Pro Subscriptions",
    primaryTech: "WordPress VIP, Fastly CDN & Condé Nast Cloud",
    marketIntelligence: "Exceptionally loyal readership among systems engineers, scientists, and IT decision-makers."
  },
  chase: {
    description: "Chase is the U.S. consumer and commercial banking portal of JPMorgan Chase & Co., serving over 80 million American households.",
    funFact: "JPMorgan Chase is the largest bank in the United States with over $4 trillion in total assets under management.",
    founded: "2000",
    headquarters: "New York, NY",
    businessModel: "Consumer Banking, Credit Cards, Mortgages & Wealth",
    primaryTech: "JPMorgan Private Cloud & Multi-Region Banking Core",
    marketIntelligence: "Consistent high-intent log-in traffic peaking on bi-weekly payroll Fridays and the 1st of each month."
  },
  fidelity: {
    description: "Fidelity Investments is one of the world’s largest asset managers, brokerage platforms, and 401(k) retirement plan administrators.",
    funFact: "Fidelity administers more than $14 trillion in customer assets across tens of millions of retail brokerage and retirement accounts.",
    founded: "1946",
    headquarters: "Boston, MA",
    businessModel: "Asset Management, Brokerage & Retirement Services",
    primaryTech: "Hybrid Cloud, AWS & Low-Latency Order Routing",
    marketIntelligence: "Heavy desktop session volume during U.S. equity trading hours and Q1 tax season."
  },
  schwab: {
    description: "Charles Schwab is a leading American multinational financial services firm offering retail brokerage, banking, and wealth advisory services.",
    funFact: "Following its integration of TD Ameritrade and thinkorswim, Schwab serves over 35 million active brokerage accounts.",
    founded: "1971",
    headquarters: "Westlake, TX",
    businessModel: "Wealth Management, Net Interest Revenue & Trading",
    primaryTech: "thinkorswim Engine & Enterprise Financial Cloud",
    marketIntelligence: "Strong engagement from active retail traders and long-term retirement investors."
  },
  coingecko: {
    description: "CoinGecko is the world’s largest independent cryptocurrency data aggregator, tracking over 15,000 digital assets across 1,000+ exchanges.",
    funFact: "CoinGecko’s API powers price feeds for thousands of DeFi wallets, portfolio trackers, and institutional research desks.",
    founded: "2014",
    headquarters: "Singapore",
    businessModel: "Crypto Data API Tiers, Advertising & GeckoTerminal",
    primaryTech: "Ruby on Rails, Go, ClickHouse & Cloudflare Edge",
    marketIntelligence: "24/7 global traffic that surges during Bitcoin volatility and on-chain token launches."
  },
  klarna: {
    description: "Klarna is a global AI-powered payments network and shopping assistant serving 85 million active consumers across 575,000+ merchants.",
    funFact: "Klarna processes over 2.5 million flexible payment and shopping transactions every single day across Europe and North America.",
    founded: "2005",
    headquarters: "Stockholm, Sweden",
    businessModel: "Merchant Payment Processing & Shopping Referral",
    primaryTech: "AWS, TypeScript & AI Customer Service Agents",
    marketIntelligence: "High checkout referral traffic from partner fashion and electronics retailers."
  },
  kraken: {
    description: "Kraken is one of the longest-operating and most liquid digital asset exchanges in the world, offering spot, margin, staking, and institutional custody.",
    funFact: "Founded in 2011, Kraken pioneered cryptographic Proof of Reserves audits to verify 1:1 backing of client crypto balances.",
    founded: "2011",
    headquarters: "Cheyenne, WY",
    businessModel: "Maker/Taker Trading Fees, Staking & Institutional Prime",
    primaryTech: "Rust Matching Engine, WebSockets & Cloudflare Spectrum",
    marketIntelligence: "Strong market share across European (EUR) and North American (USD) crypto trading pairs."
  },
  brave: {
    description: "Brave Search is an independent, privacy-preserving search engine built on its own proprietary web index rather than big-tech syndication.",
    funFact: "Brave Search serves over 10 billion annualized queries from its independent index and powers search grounding for numerous AI apps.",
    founded: "2021",
    headquarters: "San Francisco, CA",
    businessModel: "Privacy-First Search Ads, Brave Search API & Premium",
    primaryTech: "Independent Web Crawler Index & Answer with AI",
    marketIntelligence: "Rapidly growing default search engine for privacy-conscious users and AI search API customers."
  },
  seznam: {
    description: "Seznam.cz is the flagship web portal, independent search engine, map platform, and news destination in the Czech Republic.",
    funFact: "Seznam is one of the very few regional search engines in Europe to build its own search crawler, maps, and browser ecosystem.",
    founded: "1996",
    headquarters: "Prague, Czech Republic",
    businessModel: "Search & Portal Advertising, Seznam Zprávy & Mapy.cz",
    primaryTech: "Own European Datacenters & Custom Czech NLP Index",
    marketIntelligence: "Visited daily by the vast majority of the Czech internet population."
  },
  ecosia: {
    description: "Ecosia is a Certified B-Corp social business search engine that dedicates 100% of its profits to global reforestation and climate action.",
    funFact: "Ecosia users have funded the planting of more than 200 million native trees across 35+ countries worldwide.",
    founded: "2009",
    headquarters: "Berlin, Germany",
    businessModel: "Eco-Conscious Search Advertising (Steward-Owned)",
    primaryTech: "Solar-Powered Cloud & European Search Index",
    marketIntelligence: "Especially popular across Germany, France, the UK, and European university networks."
  },
  kagi: {
    description: "Kagi is a paid, zero-ad, zero-telemetry search engine designed for power users who want customizable domain rankings and high-signal web results.",
    funFact: "Kagi lets users manually boost, lower, or block specific domains from their personal search results and filter out SEO content farms.",
    founded: "2018",
    headquarters: "Palo Alto, CA",
    businessModel: "100% User-Paid Search Subscriptions (Zero Ads)",
    primaryTech: "Teclis & TinyGem Specialized Indexes, Orion Browser",
    marketIntelligence: "High retention and daily query volume among software engineers and researchers."
  },
  archive: {
    description: "The Internet Archive is a non-profit digital library preserving humanity’s cultural artifacts and over 860 billion historical web pages via the Wayback Machine.",
    funFact: "The Internet Archive stores over 100 petabytes of unique historical websites, books, audio recordings, software, and public domain films.",
    founded: "1996",
    headquarters: "San Francisco, CA",
    businessModel: "Non-Profit Philanthropy, Grants & Library Digitization",
    primaryTech: "Petabox Custom Storage Clusters & Wayback Machine",
    marketIntelligence: "Serves as the memory of the internet for journalists, legal researchers, historians, and archivists."
  },
  goodreads: {
    description: "Goodreads is the world’s largest social cataloging and book review community, helping over 150 million members discover and track books.",
    funFact: "Goodreads members have added more than 4 billion books to their digital shelves and submitted hundreds of millions of reviews.",
    founded: "2006",
    headquarters: "San Francisco, CA",
    businessModel: "Book Publisher Advertising & Kindle Ecosystem",
    primaryTech: "AWS, Ruby & Kindle Graph Integration",
    marketIntelligence: "Dominates organic search results for book titles, author bibliographies, and annual reading challenges."
  },
  arxiv: {
    description: "arXiv is the open-access scientific preprint repository maintained by Cornell University, hosting over 2.4 million papers in AI, physics, and mathematics.",
    funFact: "Virtually every foundational breakthrough in modern machine learning—from the Transformer paper to DeepSeek—was published first on arXiv.",
    founded: "1991",
    headquarters: "Ithaca, NY",
    businessModel: "Cornell University, Simons Foundation & Member Institutions",
    primaryTech: "Python, LaTeX Compilation Pipeline & Fastly/GCP",
    marketIntelligence: "Spikes every weekday evening UTC when the daily batch of new computer science and AI preprints is released."
  },
  wolframalpha: {
    description: "WolframAlpha is a computational knowledge engine that answers factual and mathematical queries directly by computing symbolic answers from curated data.",
    funFact: "WolframAlpha’s symbolic Wolfram Language engine computes step-by-step calculus, chemistry, physics, and astronomical calculations in real time.",
    founded: "2009",
    headquarters: "Champaign, IL",
    businessModel: "WolframAlpha Pro Subscriptions & Enterprise APIs",
    primaryTech: "Wolfram Language, Mathematica Kernel & HPC Clusters",
    marketIntelligence: "Strong seasonal academic traffic during fall and spring university semesters."
  },
};

function getCategoryArchetype(category: string, siteName: string): SiteDossier {
  switch (category) {
    case 'ai':
      return {
        description: `${siteName} provides artificial intelligence solutions and machine learning interfaces designed for conversational reasoning, automated workflows, and computational synthesis.`,
        funFact: `${siteName} operates high-concurrency neural network inference systems with low-latency global delivery.`,
        founded: '2023',
        headquarters: 'San Francisco, CA',
        businessModel: 'Freemium / API Compute',
        primaryTech: 'Accelerated GPU Clusters & Edge CDN',
        marketIntelligence: `${siteName} exhibits strong session retention driven by recurring developer workflows and computational synthesis.`
      };
    case 'dev':
      return {
        description: `${siteName} provides developer infrastructure, productivity tooling, and cloud workflows enabling software engineers to build, deploy, and scale modern applications.`,
        funFact: `${siteName} sustains high developer engagement during peak global business hours across North America, Europe, and Asia.`,
        founded: '2020',
        headquarters: 'Remote / United States',
        businessModel: 'Developer SaaS / Usage-Based',
        primaryTech: 'Distributed Cloud Infrastructure & Edge Routing',
        marketIntelligence: `${siteName} captures high weekday traffic volume with elevated desktop usage share typical of software engineering tools.`
      };
    case 'ecommerce':
      return {
        description: `${siteName} is a commercial online retail and commerce platform serving global consumers with catalog browsing, transactional checkout, and merchant services.`,
        funFact: `${siteName} processes tens of thousands of secure transactional sessions daily across multi-region shopping gateways.`,
        founded: '2015',
        headquarters: 'Global Operations',
        businessModel: 'Marketplace / Transaction Fee',
        primaryTech: 'Secure Payment Gateways & Global CDN',
        marketIntelligence: `${siteName} demonstrates seasonal traffic surges aligned with global retail cycles, promotional events, and consumer buying periods.`
      };
    case 'finance':
      return {
        description: `${siteName} provides financial data, transaction processing, market analytics, or wealth management services for retail and institutional users worldwide.`,
        funFact: `${siteName} maintains low-latency secure transport protocols conforming to institutional financial compliance standards.`,
        founded: '2018',
        headquarters: 'Financial District',
        businessModel: 'Financial Services / Spread / Subscription',
        primaryTech: 'Encrypted Low-Latency Banking APIs',
        marketIntelligence: `${siteName} experiences heightened traffic during open market trading hours and volatile macroeconomic news releases.`
      };
    case 'news':
      return {
        description: `${siteName} delivers journalism, investigative reporting, breaking news coverage, and editorial commentary across international and domestic topics.`,
        funFact: `${siteName} distributes breaking editorial stories across syndication feeds and real-time social distribution pipelines.`,
        founded: '2000',
        headquarters: 'Media Center',
        businessModel: 'Digital Advertising & Paid Subscriptions',
        primaryTech: 'High-Throughput Content Delivery Networks',
        marketIntelligence: `${siteName} experiences immediate burst traffic during major geopolitical events, elections, and breaking global developments.`
      };
    case 'social':
      return {
        description: `${siteName} is a global social communication network connecting users through multimedia sharing, messaging, creator feeds, and community groups.`,
        funFact: `${siteName} handles hundreds of millions of user interactions, notifications, and media distribution events every hour.`,
        founded: '2016',
        headquarters: 'Technology Corridor',
        businessModel: 'Targeted Advertising / Creator Economy',
        primaryTech: 'Global Anycast CDN & Distributed Real-Time Feeds',
        marketIntelligence: `${siteName} maintains continuous daily active user volume with elevated evening and weekend engagement across mobile devices.`
      };
    default:
      return {
        description: `${siteName} delivers digital web services, multimedia content, or specialized online tools to a worldwide audience of internet users.`,
        funFact: `${siteName} ranks among the prominent internet domains tracked for global web traffic volume and network velocity.`,
        founded: '2018',
        headquarters: 'Global Infrastructure',
        businessModel: 'Web Services / Subscriptions / Ads',
        primaryTech: 'Cloud Hosting & Anycast Edge',
        marketIntelligence: `${siteName} demonstrates consistent baseline web traffic supported by direct domain navigation and organic search visibility.`
      };
  }
}

export function getSiteDetails(site: SiteConfig): SiteDetails {
  const fallback = getCategoryArchetype(site.category, site.name);
  const staticDetails = TOP_100_DETAILS[site.id];

  const description = staticDetails?.description || fallback.description;
  const funFact = staticDetails?.funFact || fallback.funFact;
  const founded = staticDetails?.founded || fallback.founded || '2018';
  const headquarters = staticDetails?.headquarters || fallback.headquarters || 'Global Infrastructure';
  const businessModel = staticDetails?.businessModel || fallback.businessModel || 'Digital Services';
  const primaryTech = staticDetails?.primaryTech || fallback.primaryTech || 'Cloud CDN & Edge Routing';
  const marketIntelligence = staticDetails?.marketIntelligence || staticDetails?.funFact || fallback.marketIntelligence || funFact;

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
    search: ["Translate", "Maps", "Images", "Scholar", "Drive"],
    social: ["Stories", "Feed", "Groups", "Photos", "Messenger"],
    ai: ["API", "Prompts", "GPT-4", "Custom GPTs", "Pricing"],
    reference: ["Definitions", "History", "Wiki", "Facts", "Citations"],
    ecommerce: ["Prime", "Deals", "Tracking", "Support", "Shipping"],
    entertainment: ["Stream", "Trailer", "Music", "TV", "Releases"],
    news: ["Live Feed", "Today", "Opinion", "Videos", "Podcasts"],
    finance: ["Pricing", "Stock Price", "Payments", "Calculator", "Security"],
    dev: ["Docs", "API", "Tutorials", "Libraries", "GitHub"]
  };

  const keywords = fallbackKeywordsMap[site.category] || ["Website", "Review", "Support", "API", "Pricing"];

  return {
    description,
    bounceRate,
    visitDuration,
    desktopShare,
    mobileShare,
    geographies,
    trafficHistory,
    funFact,
    keywords,
    founded,
    headquarters,
    businessModel,
    primaryTech,
    marketIntelligence
  };
}
