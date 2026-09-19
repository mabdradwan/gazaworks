import { notFound } from "next/navigation";
import { BlogList } from "@/components/blog-list";
import { Reveal } from "@/components/motion-primitives";
import { isLocale } from "@/lib/i18n";
import { marketingCopy } from "@/lib/marketing-copy";

export default async function Page({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const copy = marketingCopy(locale).blog;

  return (
    <>
      <section className="blog-hero">
        <div className="container">
          <Reveal>
            <span className="badge premium-badge">
              {copy.eyebrow}
            </span>
            <h1>{copy.title}</h1>
            <p>{copy.description}</p>
          </Reveal>
        </div>
      </section>
      <section className="container blog-list-section">
        <BlogList locale={locale} />
      </section>
    </>
  );
}
