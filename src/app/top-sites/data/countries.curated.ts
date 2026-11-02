// Hand-curated, fact-checked country copy for /top-sites/[country].
//
// Overrides the AI-generated `insight` / `localNote` in countries.generated.ts.
// The generator (scripts/generate-countries.ts) may overwrite that file, but
// entries here always win at merge time in countries.ts.
//
// Editorial rules:
//   - Only well-documented facts (named operators, apps, events). No invented percentages.
//   - User counts / penetration are NOT written here; they are prepended from the data fields
//     so numbers live in exactly one place.
//   - Keep each field to 1–2 sentences and avoid repeating the same phrasing across countries.

export interface CuratedCountryText {
  insight: string;
  localNote: string;
}

export const CURATED_COUNTRY_TEXT: Record<string, CuratedCountryText> = {
  afghanistan: {
    insight: 'Access is overwhelmingly mobile, and connectivity and online freedoms have been heavily constrained since 2021. Global platforms such as Facebook, YouTube and WhatsApp account for most activity.',
    localNote: 'Web content in Dari and Pashto is limited, so global platforms dominate usage far more than local sites.',
  },
  albania: {
    insight: 'Most users connect through mobile networks, with Facebook, Instagram and TikTok leading social usage.',
    localNote: 'A large diaspora in Italy and Greece keeps messaging apps such as WhatsApp and Viber central to everyday communication.',
  },
  algeria: {
    insight: 'Facebook is the dominant social network, and both Arabic- and French-language content attract large audiences.',
    localNote: 'Authorities have repeatedly restricted internet access nationwide during the annual baccalaureate exams.',
  },
  angola: {
    insight: 'Mobile data is the main route online, with Unitel the largest operator. Portuguese-language content from Brazil and Portugal is widely consumed.',
    localNote: 'Brazilian creators and media draw especially large Angolan audiences on YouTube and Instagram.',
  },
  armenia: {
    insight: 'Armenia has one of the region\'s most active tech sectors, and Russian-language services such as Yandex and VK retain an audience alongside Google and Facebook.',
    localNote: 'A sizeable software and IT outsourcing industry makes developer platforms such as GitHub relatively prominent.',
  },
  austria: {
    insight: 'German-language versions of global services dominate, alongside domestic news sites such as ORF.at and derStandard.at.',
    localNote: 'There is no dedicated Austrian Amazon storefront, so Austrian shoppers primarily use Amazon.de.',
  },
  azerbaijan: {
    insight: 'Instagram, WhatsApp and YouTube are among the most used platforms, and Russian- and Turkish-language content is consumed alongside Azerbaijani.',
    localNote: 'Close linguistic ties with Turkish make Turkish TV series and creators especially popular.',
  },
  bahrain: {
    insight: 'Connectivity is near-universal and smartphone ownership is very high, with Instagram, Snapchat, X and WhatsApp heavily used.',
    localNote: 'Bahrain hosts the first AWS cloud region in the Middle East, opened in 2019.',
  },
  bangladesh: {
    insight: 'The market is mobile-first, and Facebook is by far the leading social platform, doubling as a key channel for news and small-business sales.',
    localNote: 'Mobile financial services such as bKash and Nagad are used by tens of millions of people.',
  },
  belarus: {
    insight: 'Russian-language services such as Yandex, VK and Odnoklassniki remain popular alongside Google and YouTube.',
    localNote: 'Telegram channels are a major source of news and information.',
  },
  belgium: {
    insight: 'Usage splits along language lines: Flemish users lean toward Dutch-language media and Walloon users toward French-language sites, alongside outlets such as HLN and RTBF.',
    localNote: 'Bol.com, founded in the Netherlands, is one of the most popular online retailers in Flanders.',
  },
  bolivia: {
    insight: 'Mobile data is the main access route, and Facebook, WhatsApp and TikTok are the most widely used platforms.',
    localNote: 'WhatsApp is widely used by small businesses for sales and customer service.',
  },
  'bosnia-and-herzegovina': {
    insight: 'Bosnian, Croatian and Serbian are mutually intelligible, so news and classifieds sites from Croatia and Serbia draw significant traffic.',
    localNote: 'Viber is widely used alongside WhatsApp, reflecting its popularity across the Balkans.',
  },
  botswana: {
    insight: 'Botswana is one of southern Africa\'s better-connected countries, with access mainly through Mascom, Orange and BTC.',
    localNote: 'Mobile money services such as Orange Money are commonly used for payments and transfers.',
  },
  bulgaria: {
    insight: 'Domestic portals such as abv.bg (email) and local news sites remain popular alongside Google, Facebook and YouTube.',
    localNote: 'Facebook is a major channel for news distribution.',
  },
  cameroon: {
    insight: 'Cameroon is a bilingual French- and English-speaking market, with mobile access provided mainly by MTN and Orange.',
    localNote: 'MTN Mobile Money and Orange Money are the main mobile payment services.',
  },
  chile: {
    insight: 'Chile is one of Latin America\'s most connected countries, with extensive fiber coverage. Mercado Libre and Falabella are leading e-commerce destinations.',
    localNote: 'Rapid fiber rollout has placed Chile among the world leaders in fixed-broadband speeds.',
  },
  china: {
    insight: 'Most major Western platforms, including Google, YouTube, Facebook, Instagram and X, are blocked, so domestic services such as Baidu, WeChat, Weibo, Douyin, Bilibili and Taobao dominate.',
    localNote: 'Super-apps like WeChat combine messaging, payments and mini-programs. Global traffic measurement under-represents many domestic apps, so treat rankings here as indicative.',
  },
  colombia: {
    insight: 'Facebook, WhatsApp, Instagram and TikTok lead social usage, and Mercado Libre is a major e-commerce destination.',
    localNote: 'Rappi, the delivery super-app now operating across Latin America, was founded in Bogotá.',
  },
  'dr-congo': {
    insight: 'Penetration remains low relative to the large population. Access is mainly mobile through Vodacom, Airtel, Orange and Africell, and French-language content dominates.',
    localNote: 'Vodacom\'s M-Pesa and Airtel Money are common for transfers and payments.',
  },
  'costa-rica': {
    insight: 'Costa Rica is one of Central America\'s most connected countries, and WhatsApp is the dominant messaging app.',
    localNote: 'SINPE Móvil, the central bank\'s instant payment system, is widely used for transfers by phone number.',
  },
  'cote-divoire': {
    insight: 'Côte d\'Ivoire is a francophone West African hub, with MTN, Orange and Moov as the main mobile operators.',
    localNote: 'Wave and Orange Money compete heavily in mobile payments.',
  },
  croatia: {
    insight: 'Domestic news portals such as Index.hr and 24sata.hr are among the most visited local sites.',
    localNote: 'Tourism drives strong seasonal traffic to booking platforms such as Booking.com and Airbnb.',
  },
  'czech-republic': {
    insight: 'Czechia is one of the few European markets with a strong domestic search rival to Google: Seznam.cz, which also runs a popular email and news portal.',
    localNote: 'Alza.cz is a leading domestic online retailer.',
  },
  denmark: {
    insight: 'Connectivity is near-universal, and public services are heavily digital, accessed through the national MitID login.',
    localNote: 'MobilePay (now part of Vipps MobilePay) is the dominant mobile payment app.',
  },
  'dominican-republic': {
    insight: 'WhatsApp and Instagram are among the most used platforms, and a large diaspora in the United States drives cross-border traffic.',
    localNote: 'Dominican music and creators, from bachata to dembow, are prominent on YouTube and TikTok.',
  },
  ecuador: {
    insight: 'Facebook, WhatsApp and TikTok lead social usage, and Mercado Libre is a key online marketplace.',
    localNote: 'Ecuador uses the US dollar, which makes shopping from US retailers comparatively straightforward.',
  },
  egypt: {
    insight: 'Egypt has the largest online population in the Arab world, and Facebook is the dominant social network.',
    localNote: 'Egyptian Arabic content, from films to online creators, is widely consumed across the Arab world.',
  },
  ethiopia: {
    insight: 'Penetration is low but rising since Safaricom Ethiopia launched in 2022 alongside state operator Ethio Telecom.',
    localNote: 'Telebirr, Ethio Telecom\'s mobile money service, has grown rapidly. Regional internet shutdowns have occurred during periods of unrest.',
  },
  finland: {
    insight: 'Access is near-universal, and widely available unlimited mobile data plans make Finns among the heaviest mobile-data users per subscription in the world.',
    localNote: 'Domestic services such as public broadcaster Yle and classifieds site Tori.fi are among the most visited local sites.',
  },
  georgia: {
    insight: 'Facebook is the dominant social platform and a major channel for news, while Russian-language services retain some audience.',
    localNote: 'Georgian uses its own script and local-language web content is limited, so many users rely on English or Russian versions of global sites.',
  },
  ghana: {
    insight: 'MTN is the largest mobile operator, and Facebook, WhatsApp and TikTok lead social usage.',
    localNote: 'MTN MoMo is the most widely used mobile money service.',
  },
  greece: {
    insight: 'Local news portals and Skroutz, a price-comparison site and marketplace, are among the most visited domestic sites.',
    localNote: 'Viber is widely used alongside WhatsApp and Messenger.',
  },
  guatemala: {
    insight: 'Prepaid mobile is the main route online, and WhatsApp and Facebook dominate everyday usage.',
    localNote: 'Remittances from the United States make money-transfer services an important part of online activity.',
  },
  honduras: {
    insight: 'Mobile data from Tigo and Claro is the main access route, and Facebook, WhatsApp and TikTok lead social usage.',
    localNote: 'Strong ties with the US diaspora make remittance and money-transfer services significant.',
  },
  hungary: {
    insight: 'Domestic news sites such as Index.hu, Telex and 24.hu are among the most visited local sites.',
    localNote: 'Hungarian is unrelated to neighbouring languages, which gives local-language sites a relatively strong position.',
  },
  iran: {
    insight: 'Many global platforms, including YouTube, X and (since 2022) Instagram, are officially blocked, and VPN use is widespread.',
    localNote: 'Domestic alternatives such as Aparat (video), Digikala (e-commerce) and Divar (classifieds) are heavily used.',
  },
  iraq: {
    insight: 'Access is mainly mobile through Zain, Asiacell and Korek, with Facebook, Instagram, Telegram and TikTok widely used.',
    localNote: 'Authorities have repeatedly imposed internet shutdowns during national school exams.',
  },
  ireland: {
    insight: 'Dublin hosts the European headquarters of Google, Meta, Apple, Microsoft and TikTok.',
    localNote: 'Irish users rely heavily on UK sites alongside local outlets such as RTÉ and The Irish Times.',
  },
  israel: {
    insight: 'Hebrew-language portals such as Ynet and Walla remain among the most visited sites.',
    localNote: 'The payment app Bit is widely used for person-to-person transfers.',
  },
  jordan: {
    insight: 'WhatsApp, Facebook and Instagram dominate social usage, and Amman has an active regional startup scene.',
    localNote: 'Maktoob, one of the first major Arabic web portals, was founded in Jordan and acquired by Yahoo in 2009.',
  },
  kazakhstan: {
    insight: 'Content is consumed in both Russian and Kazakh, and Yandex and VK retain audiences alongside Google and Instagram.',
    localNote: 'Kaspi.kz, a super-app combining banking, payments and a marketplace, is one of the country\'s most used services.',
  },
  kenya: {
    insight: 'Kenya became a global pioneer in mobile money after Safaricom launched M-Pesa in 2007.',
    localNote: 'Safaricom is the dominant mobile operator, and Nairobi\'s tech ecosystem is often called "Silicon Savannah".',
  },
  kuwait: {
    insight: 'Smartphone connectivity is near-universal, and Instagram, Snapchat and X are heavily used.',
    localNote: 'The food-delivery app Talabat was founded in Kuwait in 2004.',
  },
  lebanon: {
    insight: 'WhatsApp is central to everyday communication. The economic crisis that began in 2019 has affected both connectivity and power supply.',
    localNote: 'Arabic, French and English content are all widely consumed.',
  },
  libya: {
    insight: 'Facebook is the main platform for news, discussion and informal commerce.',
    localNote: 'Political division and power outages have periodically disrupted connectivity.',
  },
  lithuania: {
    insight: 'Lithuania has strong fiber infrastructure and has become a major EU licensing hub for fintech firms.',
    localNote: 'Revolut obtained its European banking licence from the Bank of Lithuania.',
  },
  malaysia: {
    insight: 'Shopee and Lazada lead e-commerce, and WhatsApp is the main messaging app.',
    localNote: 'Grab, which began in Malaysia as MyTeksi in 2012, is widely used for rides, food delivery and payments.',
  },
  mali: {
    insight: 'Access is mainly mobile through Orange Mali and Moov Africa Malitel.',
    localNote: 'Orange Money is the most widely used mobile money service.',
  },
  morocco: {
    insight: 'Facebook, WhatsApp, YouTube and Instagram are widely used, and both French- and Arabic-language content are prominent.',
    localNote: 'Maroc Telecom, Orange and inwi are the three mobile operators, and Avito.ma is a leading classifieds site.',
  },
  mozambique: {
    insight: 'Penetration is still low, with Vodacom, Movitel and Tmcel as the mobile operators.',
    localNote: 'M-Pesa and Movitel\'s e-Mola are the main mobile money services.',
  },
  myanmar: {
    insight: 'Facebook was historically so dominant that for many users it was effectively synonymous with the internet.',
    localNote: 'Since 2021, authorities have blocked Facebook and other platforms and imposed regional shutdowns, driving widespread VPN use.',
  },
  nepal: {
    insight: 'The market is mobile-first, with Facebook, YouTube and messaging apps accounting for much of daily usage.',
    localNote: 'eSewa and Khalti are the leading digital wallets.',
  },
  'new-zealand': {
    insight: 'Trade Me, a homegrown online marketplace, is one of the country\'s most visited sites.',
    localNote: 'New Zealanders use many Australian retailers and media alongside local outlets such as Stuff and the NZ Herald.',
  },
  nicaragua: {
    insight: 'Access is mainly mobile through Claro and Tigo, and Facebook and WhatsApp dominate usage.',
    localNote: 'Remittances from Costa Rica and the United States make money-transfer services an important category.',
  },
  norway: {
    insight: 'Connectivity is near-universal, and domestic sites such as Finn.no (classifieds) and VG.no (news) are among the most visited.',
    localNote: 'Vipps is the dominant mobile payment app, and BankID is used for secure login across banks and public services.',
  },
  oman: {
    insight: 'Smartphone connectivity is high, with WhatsApp, Instagram and Snapchat widely used.',
    localNote: 'A large South Asian expatriate population drives significant traffic to Indian and Pakistani news and streaming sites.',
  },
  pakistan: {
    insight: 'The market is mobile-first, with YouTube, Facebook, WhatsApp and TikTok among the most used platforms.',
    localNote: 'Authorities have periodically blocked platforms such as YouTube and X. JazzCash and Easypaisa lead mobile payments.',
  },
  palestine: {
    insight: 'Facebook and WhatsApp dominate usage. Connectivity depends on Israeli-controlled infrastructure, and Gaza has experienced prolonged outages since 2023.',
    localNote: 'Jawwal and Ooredoo Palestine are the local mobile operators.',
  },
  panama: {
    insight: 'Panama is a regional connectivity hub served by several undersea cables, and WhatsApp is the dominant messaging app.',
    localNote: 'The US dollar circulates as legal tender alongside the balboa, easing cross-border e-commerce with the United States.',
  },
  paraguay: {
    insight: 'Facebook, WhatsApp and TikTok lead social usage, with Tigo and Personal as the main mobile operators.',
    localNote: 'Guaraní and Spanish are both official languages, though online content is overwhelmingly in Spanish.',
  },
  peru: {
    insight: 'Facebook, WhatsApp, YouTube and TikTok lead usage, while Mercado Libre and Falabella are major e-commerce destinations.',
    localNote: 'Yape, a mobile payment app launched by BCP, is used by millions of Peruvians for transfers by phone number.',
  },
  portugal: {
    insight: 'Domestic outlets such as SAPO, Público and Observador are among the most visited local sites, and OLX is a popular classifieds platform.',
    localNote: 'MB Way is the dominant mobile payment service.',
  },
  'puerto-rico': {
    insight: 'As a US territory, Puerto Rico largely mirrors US usage patterns (Google, YouTube, Facebook, Amazon), with Spanish as the primary language.',
    localNote: 'Hurricane Maria in 2017 caused prolonged outages and spurred investment in network resilience.',
  },
  qatar: {
    insight: 'Connectivity is near-universal, with Ooredoo and Vodafone Qatar as the mobile operators.',
    localNote: 'Al Jazeera, headquartered in Doha, is one of the most visited Arabic-language news sites globally.',
  },
  romania: {
    insight: 'Romania is known for fast, affordable fixed broadband, and domestic sites such as eMAG (e-commerce) and OLX (classifieds) are heavily used.',
    localNote: 'eMAG is the country\'s leading online retailer.',
  },
  russia: {
    insight: 'Domestic services such as Yandex, VK, Ozon and Wildberries dominate. Instagram and Facebook have been blocked since 2022, and YouTube has been heavily throttled.',
    localNote: 'VPN use rose sharply after the 2022 restrictions, and Telegram remains a major news source.',
  },
  rwanda: {
    insight: 'A government-led digitisation push has moved many public services online through the Irembo portal. MTN and Airtel are the mobile operators.',
    localNote: 'MTN MoMo is the dominant mobile money service.',
  },
  'saudi-arabia': {
    insight: 'Saudi Arabia is one of the world\'s most active markets for Snapchat and X, with near-universal smartphone connectivity.',
    localNote: 'Noon and Amazon.sa lead e-commerce. Amazon.sa replaced Souq.com in 2020.',
  },
  senegal: {
    insight: 'Orange (Sonatel), Free and Expresso are the mobile operators, with French-language content dominant.',
    localNote: 'Wave, which launched in Senegal in 2018, competes heavily with Orange Money in mobile payments.',
  },
  serbia: {
    insight: 'Domestic news portals such as Blic and Kurir and the classifieds site KupujemProdajem are among the most visited local sites.',
    localNote: 'Viber is widely used for messaging alongside WhatsApp.',
  },
  slovakia: {
    insight: 'Domestic outlets such as SME.sk and Aktuality.sk are popular, and Alza.sk and Heureka.sk serve online shoppers.',
    localNote: 'Slovak and Czech are largely mutually intelligible, so Czech-language sites also draw significant Slovak traffic.',
  },
  slovenia: {
    insight: 'Domestic outlets such as 24ur.com and public broadcaster RTV SLO are among the most visited local sites.',
    localNote: 'Bolha.com is a popular classifieds platform.',
  },
  somalia: {
    insight: 'Access is mainly mobile, with Hormuud and Telesom among the largest operators.',
    localNote: 'Limited formal banking has made mobile money, such as Hormuud\'s EVC Plus, central to everyday payments.',
  },
  'sri-lanka': {
    insight: 'Facebook, YouTube and WhatsApp lead usage, with Dialog and SLT-Mobitel as the main operators.',
    localNote: 'Sinhala- and Tamil-language content on YouTube has grown quickly.',
  },
  sudan: {
    insight: 'The conflict that began in April 2023 has caused widespread and prolonged internet outages.',
    localNote: 'Bankak, the Bank of Khartoum\'s mobile app, is widely used for transfers.',
  },
  switzerland: {
    insight: 'With four national languages, Swiss users split across German, French and Italian versions of sites, alongside outlets such as 20min.ch, SRF and Blick.',
    localNote: 'TWINT is the dominant mobile payment app, and Digitec Galaxus is a leading online retailer.',
  },
  syria: {
    insight: 'Years of conflict have damaged infrastructure, and connectivity is often slow and unreliable.',
    localNote: 'International sanctions have long restricted access to many global services, including app stores and payment platforms.',
  },
  taiwan: {
    insight: 'Taiwan has very high connectivity. LINE is the dominant messaging app, and Shopee and PChome lead e-commerce.',
    localNote: 'PTT, a long-running text-based bulletin board, remains an influential online community.',
  },
  tanzania: {
    insight: 'Access is mainly mobile through operators including Vodacom, Airtel and Halotel, and Swahili content is widespread.',
    localNote: 'M-Pesa and other mobile money services handle a large share of everyday payments.',
  },
  thailand: {
    insight: 'LINE is the dominant messaging app, and Shopee and Lazada lead e-commerce.',
    localNote: 'PromptPay, the national instant-payment system, is widely used for QR-code payments.',
  },
  tunisia: {
    insight: 'Facebook is the dominant social platform, and both Arabic and French content are widely consumed.',
    localNote: 'Facebook played a notable role in organising and documenting the 2010–2011 revolution.',
  },
  uganda: {
    insight: 'MTN and Airtel are the main operators. Facebook has been blocked since the January 2021 election, so many users rely on VPNs.',
    localNote: 'A tax on social media use was in force from 2018 to 2021, and MTN MoMo and Airtel Money are widely used.',
  },
  ukraine: {
    insight: 'Russian services such as VK, Yandex and Odnoklassniki have been banned since 2017. Telegram is a major news source, and the Diia app delivers e-government services.',
    localNote: 'Rozetka and Prom.ua lead e-commerce, and Monobank is a popular digital bank.',
  },
  'united-arab-emirates': {
    insight: 'Connectivity is near-universal, but voice and video calls over apps such as WhatsApp and FaceTime are restricted to licensed services.',
    localNote: 'Noon and Amazon.ae lead e-commerce. Amazon.ae replaced Souq.com in 2019.',
  },
  uruguay: {
    insight: 'Through Plan Ceibal, Uruguay gave a laptop to every public-school child starting in 2007.',
    localNote: 'State operator Antel has given Uruguay one of the highest fiber-to-the-home coverage rates in Latin America.',
  },
  uzbekistan: {
    insight: 'Telegram is extremely popular, often serving as the main app for both messaging and news.',
    localNote: 'Payme and Click are leading mobile payment apps.',
  },
  venezuela: {
    insight: 'The economic crisis has affected network quality, and WhatsApp and Instagram are among the most used platforms.',
    localNote: 'Power outages and slow broadband are common, and access to X was blocked in August 2024.',
  },
  yemen: {
    insight: 'Yemen has some of the lowest internet penetration in the Middle East, and the conflict since 2014 has split control of telecom infrastructure.',
    localNote: 'Facebook and WhatsApp are the most used platforms.',
  },
  zambia: {
    insight: 'Access is mainly mobile through MTN, Airtel and Zamtel.',
    localNote: 'Mobile money services such as MTN MoMo and Airtel Money are widely used.',
  },
  zimbabwe: {
    insight: 'Econet is the dominant mobile operator, and its EcoCash service is widely used for payments.',
    localNote: 'Data costs have historically been high compared with regional peers, which has limited heavier usage.',
  },
};

