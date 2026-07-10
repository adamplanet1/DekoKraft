import Header from "../admin/components/Header";
import LocalizedText from "../components/LocalizedText";
import Image from "next/image";
import Link from "next/link";
import { categories } from "../data/products";
import { firstProductImage, loadCategoryProducts } from "../data/loadProduct";

const categoryPreviewContent: Record<
  string,
  { key: "boxes" | "gift" | "candles" | "kids" }
> = {
  boxes: {
    key: "boxes",
  },
  gift: {
    key: "gift",
  },
  candles: {
    key: "candles",
  },
  kids: {
    key: "kids",
  },
};

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ category: string }>;
}) {
  const { category: categorySlug } = await params;

  const category = categories.find((item) => item.slug === categorySlug);
  const categoryProducts = loadCategoryProducts(categorySlug);
  const previewContent = category
    ? categoryPreviewContent[category.slug]
    : undefined;
  const shouldUsePreviewCards = Boolean(previewContent);

  if (!category) {
    return (
      <h1>
        <LocalizedText textKey="category.notFound" />
      </h1>
    );
  }

  return (
    <>
      <Header />

      <main className="homePage">
        <section className="hero" style={{ textAlign: "center" }}>
          <h1>
            {previewContent ? (
              <LocalizedText
                textKey={`category.sections.${previewContent.key}.title`}
              />
            ) : (
              category.title
            )}
          </h1>
          <p>
            {previewContent ? (
              <LocalizedText
                textKey={`category.sections.${previewContent.key}.description`}
              />
            ) : (
              category.description
            )}
          </p>
        </section>

        <section
          className="homeGrid"
          style={
            shouldUsePreviewCards
              ? {
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: "28px",
                }
              : undefined
          }
        >
          {categoryProducts.map((product) => {
            const productHref = `/${category.slug}/${product.id}`;
            const previewImage = product.images[0] || firstProductImage(product);

            if (previewContent) {
              return (
                <article
                  key={product.id}
                  className="homeCard giftPreviewCard"
                  style={{
                    alignItems: "center",
                    background: "#ffffff",
                    border: "1px solid rgba(100, 130, 220, 0.18)",
                    borderRadius: "18px",
                    boxShadow: "0 24px 60px rgba(70, 90, 160, 0.16)",
                    display: "flex",
                    flexDirection: "column",
                    marginInline: "auto",
                    maxWidth: "900px",
                    padding: "18px",
                    width: "100%",
                  }}
                >
                  <Link
                    href={productHref}
                    className="homeImageLink giftPreviewImageLink"
                    style={{
                      display: "block",
                      marginInline: "auto",
                      maxWidth: "780px",
                      width: "100%",
                    }}
                  >
                    <Image
                      src={previewImage}
                      alt={product.title}
                      width={1200}
                      height={1200}
                      className="homeImage giftPreviewImage"
                      style={{
                        borderRadius: "14px",
                        display: "block",
                        height: "auto",
                        marginInline: "auto",
                        objectFit: "contain",
                        width: "100%",
                      }}
                    />
                  </Link>

                  <div
                    className="boxActions"
                    style={{
                      display: "grid",
                      gap: "8px",
                      gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
                      marginInline: "auto",
                      maxWidth: "580px",
                      padding: "14px 0 0",
                      width: "100%",
                    }}
                  >
                    <details
                      className="boxModelsMenu"
                      style={{
                        gridColumn: "1",
                        order: 1,
                        position: "relative",
                        width: "100%",
                      }}
                    >
                      <summary
                        className="boxActionButton"
                        style={{
                          minHeight: "46px",
                          width: "100%",
                      }}
                    >
                        <LocalizedText textKey="common.models" />
                      </summary>
                      <ul
                        className="boxModelsList"
                        style={{
                          insetInlineStart: 0,
                          marginTop: "8px",
                          position: "absolute",
                          top: "100%",
                          width: "100%",
                      }}
                    >
                        {Array.from({ length: 10 }, (_, index) => (
                          <li key={index}>
                            <LocalizedText
                              textKey={`product.boxModels.${index}.name`}
                            />
                          </li>
                        ))}
                      </ul>
                    </details>
                    <Link
                      href="/"
                      className="boxActionButton"
                      style={{ minHeight: "46px", order: 2 }}
                    >
                      <LocalizedText textKey="common.back" />
                    </Link>
                  </div>

                  <div className="homeText" style={{ textAlign: "center" }}>
                    <h2>
                      <LocalizedText
                        textKey={`category.sections.${previewContent.key}.title`}
                      />
                    </h2>
                    <p>
                      <LocalizedText
                        textKey={`category.sections.${previewContent.key}.description`}
                      />
                    </p>
                  </div>
                </article>
              );
            }

            return (
              <Link
                href={productHref}
                key={product.id}
                className="homeCard"
              >
                <Image
                  src={firstProductImage(product)}
                  alt={product.title}
                  width={600}
                  height={400}
                  className="homeImage"
                />

                <div className="homeText">
                  <h2>{product.title}</h2>
                  <p>{product.description}</p>
                </div>
              </Link>
            );
          })}
        </section>
      </main>
    </>
  );
}
