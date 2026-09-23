import { Link } from "wouter";
import { motion } from "framer-motion";
import SEO from "@/components/SEO";
import { breadcrumbSchema } from "@/lib/jsonLd";
import { posts } from "@/lib/posts";
import { Calendar, Clock, ArrowRight } from "lucide-react";

const Blog: React.FC = () => {
  const latestPosts = posts.filter((p) => !p.archive);
  const historyPosts = posts
    .filter((p) => p.archive)
    .sort((a, b) => (b.historicalEventDate || "").localeCompare(a.historicalEventDate || ""));

  return (
    <section className="py-20 cyberpunk-bg page-transition">
      <SEO
        title="Hybrid Funding News & Updates — Features, Promotions, Events & Trader Guides"
        description="Official Hybrid Funding product updates, promotions, events, platform news, rule explainers, and trader education in one documented hub."
        path="/blog"
        jsonLd={[
          breadcrumbSchema([
            { name: "Home", path: "/" },
            { name: "News & Updates", path: "/blog" },
          ]),
          {
            "@context": "https://schema.org",
            "@type": "Blog",
            name: "Hybrid Funding News & Updates",
            url: "https://www.hybridfunding.co/blog",
            blogPost: latestPosts.map((p) => ({
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
            Official Newsroom + Knowledge Base
          </p>
          <h1 className="font-['Orbitron'] text-4xl md:text-5xl font-bold text-white mb-4">
            Hybrid Funding <span className="text-accent neon-text-accent">News & Updates</span>
          </h1>
          <p className="text-[#B8B8D0] max-w-2xl mx-auto text-lg">
            Product launches, promotions, events, platform news, rule explainers, and trader education — documented in one place.
          </p>
          <div className="mt-5 flex flex-wrap justify-center gap-2">
            {["Product Updates", "Promotions", "Events", "Trader Education"].map((label) => (
              <span key={label} className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-[#B8B8D0]">
                {label}
              </span>
            ))}
          </div>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {latestPosts.map((p, i) => (
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
                <h2 className="font-['Orbitron'] text-xl font-bold text-white mb-2 leading-snug">{p.title}</h2>
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

        <div className="max-w-6xl mx-auto mt-20">
          <div className="text-center mb-10">
            <p className="text-primary font-['Orbitron'] uppercase tracking-widest text-xs mb-3">From the Archive</p>
            <h2 className="font-['Orbitron'] text-3xl md:text-4xl font-bold text-white mb-3">
              Hybrid Funding <span className="text-primary neon-text-primary">Product History</span>
            </h2>
            <p className="text-[#B8B8D0] max-w-3xl mx-auto">
              Reconstructed from verified repository history. The dates below are the original ship or campaign dates; these archive entries were added to the newsroom on September 23, 2026.
            </p>
          </div>

          <div className="relative max-w-4xl mx-auto">
            <div className="absolute left-3 md:left-1/2 top-0 bottom-0 w-px bg-white/10" />
            <div className="space-y-6">
              {historyPosts.map((p, i) => (
                <motion.article
                  key={p.slug}
                  className={`relative md:w-[calc(50%-2rem)] ${i % 2 === 0 ? "md:mr-auto" : "md:ml-auto"} ml-10 md:ml-0`}
                  initial={{ opacity: 0, y: 15 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                >
                  <div className="absolute -left-[2.2rem] md:left-auto md:right-[-2.55rem] top-5 h-3 w-3 rounded-full bg-primary shadow-[0_0_12px_rgba(124,58,237,0.7)]" />
                  {i % 2 === 1 && <div className="hidden md:block absolute left-[-2.55rem] right-auto top-5 h-3 w-3 rounded-full bg-primary shadow-[0_0_12px_rgba(124,58,237,0.7)]" />}
                  <div className="glassmorphism rounded-xl p-5 border border-white/5">
                    <div className="text-primary text-xs font-['Orbitron'] mb-2">
                      {new Date(p.historicalEventDate || p.publishedAt).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
                    </div>
                    <h3 className="font-['Orbitron'] text-lg font-bold text-white mb-2">{p.title}</h3>
                    <p className="text-[#B8B8D0] text-sm">{p.excerpt}</p>
                    <Link href={`/blog/${p.slug}`} className="mt-4 inline-flex items-center gap-1 text-primary font-semibold text-sm">
                      Read archive entry <ArrowRight className="h-4 w-4" />
                    </Link>
                  </div>
                </motion.article>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Blog;
