import PublicPageShell from "../../components/PublicPageShell";
import ProductDetailsIntro from "../../components/ProductDetailsIntro";
import ProductGallery from "../../admin/components/ProductGallery";
import {
  loadCategories,
  loadCategoryProducts,
  loadProduct,
} from "../../data/loadProduct";

export function generateStaticParams() {
  return loadCategories().flatMap((category) =>
    loadCategoryProducts(category.slug).map((product) => ({
      category: category.slug,
      product: product.id,
    }))
  );
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ category: string; product: string }>;
}) {
  const { category, product: productId } = await params;

  const product = loadProduct(category, productId);
  return (
    <PublicPageShell>
      <main className="dk-public-page publicContentContainer">
        <ProductDetailsIntro product={product} />
        <ProductGallery product={product} />
      </main>
    </PublicPageShell>
  );
}
