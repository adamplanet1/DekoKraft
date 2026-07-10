import Header from "../../admin/components/Header";
import LocalizedText from "../../components/LocalizedText";
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
  const isBoxProduct =
    product.category === "boxes" ||
    product.shape?.toLowerCase() === "box" ||
    product.tags?.toLowerCase().split(",").includes("box");

  return (
    <>
      <Header />

      <main className="homePage">
        <section className="hero" style={{ textAlign: "center" }}>
          <h1>
            {isBoxProduct ? (
              <LocalizedText textKey="product.boxTitle" />
            ) : (
              product.title
            )}
          </h1>
          <p>
            {isBoxProduct ? (
              <LocalizedText textKey="product.boxDescription" />
            ) : (
              product.description
            )}
          </p>
        </section>

        <ProductGallery product={product} />
      </main>
    </>
  );
}
