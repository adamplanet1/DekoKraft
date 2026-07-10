"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useLanguage } from "../../components/LanguageProvider";

type ProductGalleryProduct = {
  id: string;
  category: string;
  title: string;
  images: string[];
  thumbnails: string[];
  shape?: string;
  tags?: string;
};

export default function ProductGallery({
  product,
}: {
  product: ProductGalleryProduct;
}) {
  const { lang, t } = useLanguage();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showBoxModels, setShowBoxModels] = useState(false);
  const [selectedBoxModelIndex, setSelectedBoxModelIndex] = useState(0);
  const [showCustomBoxPanel, setShowCustomBoxPanel] = useState(false);
  const [customBoxDimensions, setCustomBoxDimensions] = useState({
    length: "4.5",
    width: "4.5",
    height: "4.5",
  });
  const [customBoxNotice, setCustomBoxNotice] = useState("");

  const currentImage = product.images[currentIndex];
  const hasImages = Boolean(currentImage);
  const textAlign = lang === "ar" ? "right" : "left";
  const customBoxDimensionFields = [
    { key: "length", label: t.product.dimensions.length },
    { key: "width", label: t.product.dimensions.width },
    { key: "height", label: t.product.dimensions.height },
  ] as const;
  const boxModelOptions = t.product.boxModels;
  const selectedBoxModel = boxModelOptions[selectedBoxModelIndex];
  const isBoxProduct =
    product.category === "boxes" ||
    product.shape?.toLowerCase() === "box" ||
    product.tags?.toLowerCase().split(",").includes("box");

  function nextImage() {
    if (product.images.length === 0) {
      return;
    }

    setCurrentIndex((currentIndex + 1) % product.images.length);
  }

  function previousImage() {
    if (product.images.length === 0) {
      return;
    }

    setCurrentIndex(
      (currentIndex - 1 + product.images.length) % product.images.length
    );
  }

  function formatDimension(value: number) {
    return Number.isInteger(value) ? String(value) : value.toFixed(1);
  }

  function normalizeCustomBoxDimension(
    key: keyof typeof customBoxDimensions,
    rawValue: string
  ) {
    const min = 4.5;
    const max = 20;
    const step = 1.5;
    const value = Number(rawValue);

    if (!Number.isFinite(value) || value < min) {
      setCustomBoxDimensions((dimensions) => ({
        ...dimensions,
        [key]: formatDimension(min),
      }));
      setCustomBoxNotice(
        t.product.dimensions.minNotice.replace("{value}", formatDimension(min))
      );
      return;
    }

    if (value > max) {
      setCustomBoxDimensions((dimensions) => ({
        ...dimensions,
        [key]: formatDimension(max),
      }));
      setCustomBoxNotice(
        t.product.dimensions.maxNotice.replace("{value}", formatDimension(max))
      );
      return;
    }

    const normalized = Math.min(
      max,
      Math.max(min, min + Math.round((value - min) / step) * step)
    );

    setCustomBoxDimensions((dimensions) => ({
      ...dimensions,
      [key]: formatDimension(normalized),
    }));

    if (normalized !== value) {
      setCustomBoxNotice(
        t.product.dimensions.acceptedNotice
          .replace("{input}", formatDimension(value))
          .replace("{value}", formatDimension(normalized))
      );
      return;
    }

    setCustomBoxNotice("");
  }

  const thumbnails = (
    <div
      className="thumbnailRow"
      style={{
        display: "flex",
        flexWrap: "wrap",
        justifyContent: "center",
        gap: "10px",
        marginTop: "14px",
        width: "100%",
      }}
    >
      {product.thumbnails.map((image: string, index: number) => (
        <Image
          key={image}
          src={image}
          alt={t.common.thumbnailAlt}
          width={90}
          height={90}
          onClick={() => setCurrentIndex(index)}
          className={
            index === currentIndex ? "thumbnail activeThumbnail" : "thumbnail"
          }
          style={{
            cursor: "pointer",
            objectFit: "cover",
          }}
        />
      ))}
    </div>
  );

  if (isBoxProduct) {
    return (
      <section className="gallery" dir={t.dir}>
        <div
          style={{
            marginInline: "auto",
            maxWidth: "920px",
            width: "100%",
          }}
        >
          <div
            className="mainImageBox"
            style={{
              marginInline: "auto",
              maxWidth: "780px",
              position: "relative",
              width: "100%",
            }}
          >
            {hasImages ? (
              <Image
                src={currentImage}
                alt={product.title}
                width={1400}
                height={1400}
                className="mainProductImage"
                style={{
                  display: "block",
                  height: "auto",
                  marginInline: "auto",
                  width: "100%",
                }}
              />
            ) : (
              <div className="mainProductImage productImagePlaceholder">
                {product.title}
              </div>
            )}

            <button className="galleryButton left" onClick={previousImage}>
              ‹
            </button>

            <button className="galleryButton right" onClick={nextImage}>
              ›
            </button>
          </div>

          <div
            style={{
              marginInline: "auto",
              marginTop: "14px",
              maxWidth: "560px",
              width: "100%",
            }}
          >
            <div
              className="boxActions"
              style={{
                display: "grid",
                gap: "8px",
                gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
                padding: 0,
                width: "100%",
              }}
            >
              <div style={{ position: "relative", width: "100%" }}>
                <button
                  type="button"
                  className="boxActionButton"
                  aria-expanded={showBoxModels}
                  aria-controls="box-models-list"
                  style={{ width: "100%" }}
                  onClick={() => setShowBoxModels((isOpen) => !isOpen)}
                >
                  {t.common.models}
                </button>

                {showBoxModels && (
                  <ul
                    id="box-models-list"
                    className="boxModelsList"
                    style={{
                      marginTop: "8px",
                      position: "static",
                      width: "100%",
                    }}
                  >
                    {boxModelOptions.map((model, index) => (
                      <li key={model.name} style={{ padding: 0 }}>
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedBoxModelIndex(index);
                            setShowBoxModels(false);
                          }}
                          style={{
                            width: "100%",
                            border: 0,
                            borderRadius: "10px",
                            background:
                              index === selectedBoxModelIndex
                                ? "#eef3ff"
                                : "transparent",
                            color: "#17213c",
                            cursor: "pointer",
                            font: "inherit",
                            fontWeight: 800,
                            padding: "10px 12px",
                            textAlign,
                          }}
                        >
                          {model.name}
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <Link
                href={`/${product.category}/${product.id}`}
                className="boxActionButton"
                style={{ width: "100%" }}
              >
                {t.common.buy}
              </Link>
              <Link
                href={`/${product.category}`}
                className="boxActionButton"
                style={{ width: "100%" }}
              >
                {t.common.back}
              </Link>
            </div>

            <div
              style={{
                marginTop: "8px",
                padding: "12px 14px",
                border: "1px solid rgba(100, 130, 220, 0.18)",
                borderRadius: "14px",
                background: "#ffffff",
                color: "#17213c",
                textAlign,
                boxShadow: "0 10px 24px rgba(80, 100, 180, 0.08)",
              }}
            >
              <p
                style={{
                  margin: 0,
                  fontSize: "15px",
                  fontWeight: 900,
                }}
              >
                {t.common.selectedModel}: {selectedBoxModel.name}
              </p>
              <p
                style={{
                  margin: "6px 0 0",
                  fontSize: "14px",
                  fontWeight: 700,
                  lineHeight: 1.7,
                }}
              >
                {selectedBoxModel.description}
              </p>
            </div>
          </div>

          {thumbnails}

          <div
            style={{
              marginInline: "auto",
              marginTop: "14px",
              maxWidth: "560px",
              width: "100%",
            }}
          >
            <button
              type="button"
              className="boxActionButton"
              aria-expanded={showCustomBoxPanel}
              style={{ minHeight: "46px", width: "100%" }}
              onClick={() => setShowCustomBoxPanel((isOpen) => !isOpen)}
            >
              {t.common.customBox}
            </button>

            {showCustomBoxPanel && (
              <div
                style={{
                  marginTop: "8px",
                  padding: "12px 14px",
                  border: "1px solid rgba(100, 130, 220, 0.18)",
                  borderRadius: "14px",
                  background: "#ffffff",
                  color: "#17213c",
                  boxShadow: "0 10px 24px rgba(80, 100, 180, 0.08)",
                }}
              >
                <div
                  style={{
                    display: "grid",
                    gap: "10px",
                    gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
                  }}
                >
                  {customBoxDimensionFields.map((field) => (
                    <label
                      key={field.key}
                      style={{
                        display: "grid",
                        gap: "6px",
                        fontSize: "13px",
                        fontWeight: 900,
                        textAlign,
                      }}
                    >
                      {field.label}
                      <input
                        type="number"
                        min={4.5}
                        max={20}
                        step={1.5}
                        value={customBoxDimensions[field.key]}
                        onChange={(event) =>
                          setCustomBoxDimensions((dimensions) => ({
                            ...dimensions,
                            [field.key]: event.target.value,
                          }))
                        }
                        onBlur={(event) =>
                          normalizeCustomBoxDimension(
                            field.key,
                            event.target.value
                          )
                        }
                        style={{
                          minHeight: "42px",
                          border: "1px solid rgba(100, 130, 220, 0.22)",
                          borderRadius: "12px",
                          padding: "0 10px",
                          textAlign: "center",
                          fontSize: "15px",
                          fontWeight: 800,
                        }}
                      />
                    </label>
                  ))}
                </div>

                {customBoxNotice && (
                  <p
                    role="status"
                    style={{
                      margin: "10px 0 0",
                      color: "#2457ff",
                      fontSize: "13px",
                      fontWeight: 900,
                      textAlign,
                    }}
                  >
                    {customBoxNotice}
                  </p>
                )}

                {/* TODO: engraving type and engraving color options */}
              </div>
            )}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="gallery">
      <div style={{ marginInline: "auto", maxWidth: "720px" }}>
        <div className="mainImageBox">
          {hasImages ? (
            <Image
              src={currentImage}
              alt={product.title}
              width={1200}
              height={1200}
              className="mainProductImage"
            />
          ) : (
            <div className="mainProductImage productImagePlaceholder">
              {product.title}
            </div>
          )}

          <button className="galleryButton left" onClick={previousImage}>
            ‹
          </button>

          <button className="galleryButton right" onClick={nextImage}>
            ›
          </button>
        </div>
      </div>

      {thumbnails}
    </section>
  );
}
