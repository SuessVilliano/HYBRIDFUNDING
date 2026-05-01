import { Helmet } from "react-helmet-async";

const SITE_URL = "https://www.hybridfunding.co";
const DEFAULT_OG = `${SITE_URL}/og-image.svg`;

interface SEOProps {
  title: string;
  description: string;
  path?: string;
  image?: string;
  type?: "website" | "article";
  noindex?: boolean;
  publishedTime?: string;
  modifiedTime?: string;
  /** Optional JSON-LD object(s) injected as <script type="application/ld+json"> */
  jsonLd?: Record<string, unknown> | Array<Record<string, unknown>>;
}

const SEO: React.FC<SEOProps> = ({
  title,
  description,
  path = "/",
  image = DEFAULT_OG,
  type = "website",
  noindex = false,
  publishedTime,
  modifiedTime,
  jsonLd,
}) => {
  const url = path.startsWith("http") ? path : `${SITE_URL}${path}`;
  const imageUrl = image.startsWith("http") ? image : `${SITE_URL}${image}`;
  const fullTitle = title.includes("Hybrid Funding") ? title : `${title} | Hybrid Funding`;
  const ldArray = Array.isArray(jsonLd) ? jsonLd : jsonLd ? [jsonLd] : [];

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={url} />
      {noindex && <meta name="robots" content="noindex,nofollow" />}

      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:type" content={type} />
      <meta property="og:url" content={url} />
      <meta property="og:image" content={imageUrl} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:site_name" content="Hybrid Funding" />
      {publishedTime && <meta property="article:published_time" content={publishedTime} />}
      {modifiedTime && <meta property="article:modified_time" content={modifiedTime} />}

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={imageUrl} />

      {ldArray.map((ld, i) => (
        <script key={i} type="application/ld+json">{JSON.stringify(ld)}</script>
      ))}
    </Helmet>
  );
};

export default SEO;
