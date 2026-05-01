const SITE_URL = "https://www.hybridfunding.co";

export const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "Hybrid Funding",
  url: SITE_URL,
  logo: `${SITE_URL}/logo.svg`,
  description:
    "Hybrid Funding is a proprietary trading firm that funds traders across Forex, Crypto, Futures, and Single Session Equities with up to 90% profit splits.",
  sameAs: [],
  contactPoint: [
    {
      "@type": "ContactPoint",
      contactType: "customer support",
      url: `${SITE_URL}/contact`,
      availableLanguage: ["en"],
    },
  ],
};

export const websiteSchema = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "Hybrid Funding",
  url: SITE_URL,
  potentialAction: {
    "@type": "SearchAction",
    target: `${SITE_URL}/?q={search_term_string}`,
    "query-input": "required name=search_term_string",
  },
};

export function breadcrumbSchema(items: Array<{ name: string; path: string }>) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: item.path.startsWith("http") ? item.path : `${SITE_URL}${item.path}`,
    })),
  };
}

export function faqPageSchema(faqs: Array<{ question: string; answer: string }>) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: f.answer,
      },
    })),
  };
}

interface ProductOffer {
  tier: string;
  price: number;
  assetClass: string;
  challengeType: string;
}

export function productSchema({
  name,
  description,
  url,
  offers,
}: {
  name: string;
  description: string;
  url: string;
  offers: ProductOffer[];
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name,
    description,
    brand: { "@type": "Brand", name: "Hybrid Funding" },
    url: url.startsWith("http") ? url : `${SITE_URL}${url}`,
    offers: offers.map((o) => ({
      "@type": "Offer",
      name: `$${o.tier} ${o.assetClass} ${o.challengeType} Challenge`,
      price: o.price.toFixed(2),
      priceCurrency: "USD",
      availability: "https://schema.org/InStock",
      url: url.startsWith("http") ? url : `${SITE_URL}${url}`,
    })),
  };
}

export function articleSchema({
  title,
  description,
  path,
  publishedTime,
  modifiedTime,
  authorName = "Hybrid Funding",
}: {
  title: string;
  description: string;
  path: string;
  publishedTime: string;
  modifiedTime?: string;
  authorName?: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: title,
    description,
    mainEntityOfPage: { "@type": "WebPage", "@id": `${SITE_URL}${path}` },
    author: { "@type": "Organization", name: authorName, url: SITE_URL },
    publisher: {
      "@type": "Organization",
      name: "Hybrid Funding",
      logo: { "@type": "ImageObject", url: `${SITE_URL}/logo.svg` },
    },
    datePublished: publishedTime,
    dateModified: modifiedTime || publishedTime,
    image: `${SITE_URL}/og-image.svg`,
  };
}
