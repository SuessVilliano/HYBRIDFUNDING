import { lazy, Suspense } from "react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import SEO from "@/components/SEO";
import { breadcrumbSchema, articleSchema } from "@/lib/jsonLd";
import { getPostBySlug, getRelatedPosts } from "@/lib/posts";
import { Calendar, Clock, ArrowRight, ChevronLeft } from "lucide-react";
import A2PCompliantOptInForm from "@/components/A2PCompliantOptInForm";

const postModules = import.meta.glob("./blog-posts/*.tsx");

interface BlogPostProps {
  slug: string;
}

const BlogPost: React.FC<BlogPostProps> = ({ slug }) => {
  const meta = getPostBySlug(slug);

  if (!meta) {
    return (
      <section className="py-32 cyberpunk-bg page-transition text-center">
        <SEO title="Post not found" description="This post doesn't exist." path={`/blog/${slug}`} noindex />
        <h1 className="font-['Orbitron'] text-3xl text-white mb-4">Post not found</h1>
        <Link href="/blog" className="text-accent underline">Back to the blog</Link>
      </section>
    );
  }

  const loader = postModules[`./blog-posts/${slug}.tsx`];
  const PostBody = loader
    ? lazy(() => loader().then((m: any) => ({ default: m.default })))
    : null;

  const related = getRelatedPosts(slug, 3);

  return (
    <article className="py-20 cyberpunk-bg page-transition">
      <SEO
        title={meta.title}
        description={meta.description}
        path={`/blog/${slug}`}
        type="article"
        publishedTime={meta.publishedAt}
        modifiedTime={meta.updatedAt}
        jsonLd={[
          breadcrumbSchema([
            { name: "Home", path: "/" },
            { name: "Blog", path: "/blog" },
            { name: meta.title, path: `/blog/${slug}` },
          ]),
          articleSchema({
            title: meta.title,
            description: meta.description,
            path: `/blog/${slug}`,
            publishedTime: meta.publishedAt,
            modifiedTime: meta.updatedAt,
          }),
        ]}
      />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.header
          className="max-w-3xl mx-auto mb-10"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Link href="/blog" className="inline-flex items-center gap-1 text-[#B8B8D0] hover:text-accent text-sm mb-6">
            <ChevronLeft className="h-4 w-4" /> Back to blog
          </Link>
          <div className="flex flex-wrap gap-2 mb-4">
            {meta.tags.map((t) => (
              <span key={t} className="text-[10px] font-['Orbitron'] uppercase tracking-wide bg-accent/15 text-accent border border-accent/30 rounded-full px-2 py-0.5">
                {t}
              </span>
            ))}
          </div>
          <h1 className="font-['Orbitron'] text-3xl md:text-5xl font-bold text-white mb-4 leading-tight">
            {meta.title}
          </h1>
          <p className="text-[#B8B8D0] text-lg mb-4">{meta.description}</p>
          <div className="flex items-center gap-4 text-[#6F6F8A] text-sm">
            <span className="inline-flex items-center gap-1.5"><Calendar className="h-4 w-4" /> {new Date(meta.publishedAt).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}</span>
            <span className="inline-flex items-center gap-1.5"><Clock className="h-4 w-4" /> {meta.readingMinutes} min read</span>
          </div>
        </motion.header>

        <div className="max-w-3xl mx-auto glassmorphism rounded-xl p-6 md:p-10 prose-content">
          <Suspense fallback={<div className="text-[#B8B8D0]">Loading article…</div>}>
            {PostBody ? <PostBody /> : <p className="text-[#B8B8D0]">Article content unavailable.</p>}
          </Suspense>
        </div>

        {/* Inline lead-magnet — capture readers at high intent */}
        <div className="max-w-3xl mx-auto mt-12 glassmorphism rounded-xl p-6 md:p-8 border border-accent/30">
          <p className="text-accent font-['Orbitron'] uppercase tracking-widest text-xs mb-2">Get the playbook</p>
          <h3 className="font-['Orbitron'] text-2xl font-bold text-white mb-2">
            Want our full Trader Playbook (PDF) — free?
          </h3>
          <p className="text-[#B8B8D0] mb-4">
            We'll text you a download link plus a 20% off code for your first challenge.
          </p>
          <A2PCompliantOptInForm showResourceLinks={false} compactMode />
        </div>

        {related.length > 0 && (
          <div className="max-w-5xl mx-auto mt-16">
            <h3 className="font-['Orbitron'] text-2xl font-bold text-white mb-6 text-center">
              Related reading
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {related.map((p) => (
                <Link key={p.slug} href={`/blog/${p.slug}`} className="glassmorphism rounded-xl p-5 hover:scale-[1.02] transition-transform">
                  <div className="flex flex-wrap gap-1 mb-2">
                    {p.tags.slice(0, 2).map((t) => (
                      <span key={t} className="text-[10px] font-['Orbitron'] uppercase tracking-wide bg-accent/15 text-accent border border-accent/30 rounded-full px-2 py-0.5">
                        {t}
                      </span>
                    ))}
                  </div>
                  <h4 className="font-['Orbitron'] text-base font-bold text-white mb-2 leading-snug">{p.title}</h4>
                  <span className="inline-flex items-center gap-1 text-accent text-sm">
                    Read <ArrowRight className="h-3 w-3" />
                  </span>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </article>
  );
};

export default BlogPost;
