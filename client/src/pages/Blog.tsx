import { Link } from "wouter";
import { motion } from "framer-motion";
import SEO from "@/components/SEO";
import { breadcrumbSchema } from "@/lib/jsonLd";
import { posts } from "@/lib/posts";
import { Calendar, Clock, ArrowRight } from "lucide-react";

const Blog: React.FC = () => {
  return (
    <section className="py-20 cyberpunk-bg page-transition">
      <SEO
        title="Hybrid Funding Blog — Prop Trading Guides & Rules Explained"
        description="Strategy guides, rule breakdowns, and asset-class deep dives for Forex, Crypto, Futures, and Single Session Equities prop traders."
        path="/blog"
        jsonLd={[
          breadcrumbSchema([
            { name: "Home", path: "/" },
            { name: "Blog", path: "/blog" },
          ]),
          {
            "@context": "https://schema.org",
            "@type": "Blog",
            name: "Hybrid Funding Blog",
            url: "https://www.hybridfunding.co/blog",
            blogPost: posts.map((p) => ({
              "@type": "BlogPosting",
              headline: p.title,
              url: `https://www.hybridfunding.co/blog/${p.slug}`,
              datePublished: p.publishedAt,
              description: p.description,
            })),
          },
        ]}
      />
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <p className="text-accent font-['Orbitron'] uppercase tracking-widest text-xs mb-3">
            Trader Knowledge Base
          </p>
          <h1 className="font-['Orbitron'] text-4xl md:text-5xl font-bold text-white mb-4">
            Hybrid Funding <span className="text-accent neon-text-accent">Blog</span>
          </h1>
          <p className="text-[#B8B8D0] max-w-2xl mx-auto text-lg">
            Strategy guides, rule explainers, and honest takes on prop trading.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {posts.map((p, i) => (
            <motion.article
              key={p.slug}
              className="glassmorphism rounded-xl overflow-hidden flex flex-col hover:scale-[1.015] transition-transform"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.06 }}
            >
              <div className="p-6 flex-1 flex flex-col">
                <div className="flex flex-wrap gap-2 mb-3">
                  {p.tags.map((t) => (
                    <span key={t} className="text-[10px] font-['Orbitron'] uppercase tracking-wide bg-accent/15 text-accent border border-accent/30 rounded-full px-2 py-0.5">
                      {t}
                    </span>
                  ))}
                </div>
                <h2 className="font-['Orbitron'] text-xl font-bold text-white mb-2 leading-snug">
                  {p.title}
                </h2>
                <p className="text-[#B8B8D0] text-sm flex-1">{p.excerpt}</p>
                <div className="flex items-center gap-4 text-[#6F6F8A] text-xs mt-4">
                  <span className="inline-flex items-center gap-1"><Calendar className="h-3 w-3" /> {new Date(p.publishedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</span>
                  <span className="inline-flex items-center gap-1"><Clock className="h-3 w-3" /> {p.readingMinutes} min read</span>
                </div>
                <Link href={`/blog/${p.slug}`} className="mt-5 inline-flex items-center gap-1 text-accent font-semibold text-sm hover:gap-2 transition-all">
                  Read more <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Blog;
