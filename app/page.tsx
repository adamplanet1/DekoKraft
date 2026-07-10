import Header from "./admin/components/Header";
import LocalizedText from "./components/LocalizedText";
import Image from "next/image";
import Link from "next/link";
import { categories } from "./data/products";

const homeSections = [
  {
    slug: "gift",
    key: "packaging",
  },
  {
    slug: "candles",
    key: "candles",
  },
  {
    slug: "gift",
    key: "gifts",
  },
  {
    slug: "kids",
    key: "kids",
  },
];

export default function Home() {
  const visibleSections = homeSections
    .map((section) => {
      const category = categories.find((item) => item.slug === section.slug);

      return category ? { ...section, image: category.image } : null;
    })
    .filter((section) => section !== null);

  return (
    <>
      <Header />

      <main className="homePage">
        <section className="hero" style={{ textAlign: "center" }}>
          <h1>DekoKraft</h1>
          <p>
            <LocalizedText textKey="home.heroDescription" />
          </p>
        </section>

        <section
          className="homeGrid"
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "28px",
          }}
        >
          {visibleSections.map((section) => (
              <article
                key={section.key}
                className="homeCard homePreviewCard"
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
                  href={`/${section.slug}`}
                  className="homeImageLink homePreviewImageLink"
                  style={{
                    display: "block",
                    marginInline: "auto",
                    maxWidth: "780px",
                    width: "100%",
                  }}
                >
                  <Image
                    src={section.image}
                    alt=""
                    width={1200}
                    height={1200}
                    className="homeImage homePreviewImage"
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
                      textKey={`home.sections.${section.key}.title`}
                    />
                  </h2>
                  <p>
                    <LocalizedText
                      textKey={`home.sections.${section.key}.description`}
                    />
                  </p>
                </div>
              </article>
            ))}
        </section>
      </main>
    </>
  );
}
