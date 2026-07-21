import PublicPageShell from "../components/PublicPageShell";
import LocalizedText from "../components/LocalizedText";
import LocalizedValueText from "../components/LocalizedValueText";
import DkCategoryCard from "../components/ui/DkCategoryCard";
import DkPageHero from "../components/ui/DkPageHero";
import DkResponsiveGrid from "../components/ui/DkResponsiveGrid";
import { categories } from "../data/products";
import { firstProductImage, loadCategoryProducts } from "../data/loadProduct";

const categoryPreviewContent: Record<
  string,
  { key: "boxes" | "gift" | "candles" | "kids" }
> = {
  boxes: { key: "boxes" },
  gift: { key: "gift" },
  candles: { key: "candles" },
  kids: { key: "kids" },
};

export function generateStaticParams() {
  return categories.map((category) => ({ category: category.slug }));
}

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ category: string }>;
}) {
  const { category: categorySlug } = await params;
  const category = categories.find((item) => item.slug === categorySlug);
  const categoryProducts = loadCategoryProducts(categorySlug);
  const previewContent = category ? categoryPreviewContent[category.slug] : undefined;

  if (!category) {
    return (
      <PublicPageShell>
        <main className="dk-public-page publicContentContainer">
          <DkPageHero title={<LocalizedText textKey="categories.notFound" />} size="compact" />
        </main>
      </PublicPageShell>
    );
  }

  const heroTitle = previewContent ? (
    <LocalizedText textKey={`category.sections.${previewContent.key}.title`} />
  ) : (
    <LocalizedValueText value={category.title} />
  );
  const heroDescription = previewContent ? (
    <LocalizedText textKey={`category.sections.${previewContent.key}.description`} />
  ) : (
    <LocalizedValueText value={category.description} />
  );

  return (
    <PublicPageShell>
      <main className="dk-public-page publicContentContainer">
        <DkPageHero title={heroTitle} description={heroDescription} />
        <DkResponsiveGrid
          desktop={previewContent ? 1 : 3}
          tablet={previewContent ? 1 : 2}
          mobile={1}
          className={previewContent ? "dk-responsive-grid--featured" : undefined}
        >
          {categoryProducts.map((product) => {
            const productHref = `/${category.slug}/${product.id}`;
            const previewImage = product.images[0] || firstProductImage(product);
            return (
              <DkCategoryCard
                key={product.id}
                href={productHref}
                image={previewContent ? previewImage : firstProductImage(product)}
                imageAlt={product.title}
                featured={Boolean(previewContent)}
                title={previewContent ? heroTitle : <LocalizedValueText value={product.title} />}
                description={previewContent ? heroDescription : <LocalizedValueText value={product.description} />}
              />
            );
          })}
        </DkResponsiveGrid>
      </main>
    </PublicPageShell>
  );
}
