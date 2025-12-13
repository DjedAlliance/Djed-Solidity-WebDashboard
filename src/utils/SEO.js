/**
 * SEO utility functions to update meta tags dynamically
 * This helps improve search engine rankings for the "djed" keyword
 */

const BASE_URL = "https://milkomeda-c1.djed.one";

/**
 * Route-specific SEO configurations
 */
const routeSEOConfig = {
  "/": {
    title: "Djed - Formally Verified Stablecoin Protocol | Milkomeda Djed",
    description: "Djed is a formally verified crypto-backed autonomous stablecoin protocol on Milkomeda. Trade, mint, and burn Djed stablecoins (MOD) and reservecoins (MOR) with the most secure and mathematically proven stablecoin system. Djed has been researched since 2020 and deployed across multiple blockchains.",
    keywords: "djed, djed stablecoin, djed protocol, milkomeda djed, MOD stablecoin, MOR reservecoin, formally verified stablecoin, crypto-backed stablecoin, autonomous stablecoin, djed.one, djed alliance, stablecoin protocol, cardano stablecoin, milkomeda stablecoin, DeFi stablecoin"
  },
  "/sc": {
    title: "Djed Stablecoin (MOD) - Mint & Burn | Milkomeda Djed",
    description: "Mint and burn Djed stablecoins (MOD) on Milkomeda. Djed is a formally verified crypto-backed autonomous stablecoin protocol. Trade MOD stablecoins with the most secure stablecoin system.",
    keywords: "djed, djed stablecoin, MOD, MOD stablecoin, milkomeda djed, mint djed, burn djed, stablecoin protocol, djed.one, formally verified stablecoin"
  },
  "/rc": {
    title: "Djed Reservecoin (MOR) - Trade Reservecoins | Milkomeda Djed",
    description: "Trade Djed Reservecoins (MOR) on Milkomeda. Reservecoins are part of the Djed stablecoin protocol, a formally verified crypto-backed autonomous stablecoin system.",
    keywords: "djed, djed reservecoin, MOR, MOR reservecoin, milkomeda djed, trade reservecoin, stablecoin protocol, djed.one, formally verified stablecoin"
  },
  "/my-balance": {
    title: "My Djed Balance - View Holdings | Milkomeda Djed",
    description: "View your Djed stablecoin and reservecoin balances on Milkomeda. Check your MOD and MOR holdings in the Djed protocol.",
    keywords: "djed, djed balance, MOD balance, MOR balance, milkomeda djed, djed holdings, stablecoin balance, djed.one"
  },
  "/terms-of-use": {
    title: "Terms of Use - Djed Protocol | Milkomeda Djed",
    description: "Terms of Use for the Djed stablecoin protocol on Milkomeda. Read the terms and conditions for using Djed.",
    keywords: "djed, djed terms, milkomeda djed, terms of use, djed.one"
  }
};

/**
 * Update SEO meta tags for the current route
 * @param {string} pathname - Current route pathname
 */
export function updateSEO(pathname) {
  const config = routeSEOConfig[pathname] || routeSEOConfig["/"];
  const fullUrl = `${BASE_URL}${pathname === '/' ? '' : pathname}`;

  // Update title
  document.title = config.title;

  // Update meta description
  let metaDescription = document.querySelector('meta[name="description"]');
  if (!metaDescription) {
    metaDescription = document.createElement('meta');
    metaDescription.setAttribute('name', 'description');
    document.head.appendChild(metaDescription);
  }
  metaDescription.setAttribute('content', config.description);

  // Update meta keywords
  let metaKeywords = document.querySelector('meta[name="keywords"]');
  if (!metaKeywords) {
    metaKeywords = document.createElement('meta');
    metaKeywords.setAttribute('name', 'keywords');
    document.head.appendChild(metaKeywords);
  }
  metaKeywords.setAttribute('content', config.keywords);

  // Update canonical URL
  let canonical = document.querySelector('link[rel="canonical"]');
  if (!canonical) {
    canonical = document.createElement('link');
    canonical.setAttribute('rel', 'canonical');
    document.head.appendChild(canonical);
  }
  canonical.setAttribute('href', fullUrl);

  // Update Open Graph tags
  updateOGTag('og:title', config.title);
  updateOGTag('og:description', config.description);
  updateOGTag('og:url', fullUrl);

  // Update Twitter tags
  updateTwitterTag('twitter:title', config.title);
  updateTwitterTag('twitter:description', config.description);
  updateTwitterTag('twitter:url', fullUrl);
}

/**
 * Update Open Graph meta tag
 * @param {string} property - OG property name
 * @param {string} content - Content value
 */
function updateOGTag(property, content) {
  let tag = document.querySelector(`meta[property="${property}"]`);
  if (!tag) {
    tag = document.createElement('meta');
    tag.setAttribute('property', property);
    document.head.appendChild(tag);
  }
  tag.setAttribute('content', content);
}

/**
 * Update Twitter meta tag
 * @param {string} name - Twitter meta name
 * @param {string} content - Content value
 */
function updateTwitterTag(name, content) {
  let tag = document.querySelector(`meta[name="${name}"]`);
  if (!tag) {
    tag = document.createElement('meta');
    tag.setAttribute('name', name);
    document.head.appendChild(tag);
  }
  tag.setAttribute('content', content);
}


