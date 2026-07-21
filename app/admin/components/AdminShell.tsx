"use client";

import { useEffect, useState } from "react";
import { cmsTabs, type CmsTabId } from "../config/cmsTabs";
import { useLanguage } from "../../components/LanguageProvider";
import type { DkMenuAnchor } from "../../components/ui";
import "../admin-v2.css";

import Sidebar from "./layout/Sidebar";
import Header from "./layout/Header";
import AdminFooter from "./layout/AdminFooter";
import DashboardPage from "./pages/DashboardPage";
import ProductsPage from "./pages/ProductsPage";
import AdminToolLauncher from "./AdminToolLauncher";
import ProductModal, {
  type ProductModalSavedProduct,
} from "./products/ProductModal";

export default function AdminShell() {
  const [activeTab, setActiveTab] = useState<CmsTabId>("dashboard");
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [productsRefreshKey, setProductsRefreshKey] = useState(0);
  const [lastSavedProduct, setLastSavedProduct] =
    useState<ProductModalSavedProduct | null>(null);
  const [productSaveSuccessMessage, setProductSaveSuccessMessage] =
    useState("");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [sidebarAnchor, setSidebarAnchor] = useState<DkMenuAnchor | null>(null);
  const { lang, setLang, t } = useLanguage();

  const isArabic = lang === "ar";
  const direction = isArabic ? "rtl" : "ltr";
  const active = cmsTabs.find((tab) => tab.id === activeTab);

  const openAddProductForm = () => {
    setActiveTab("products");
    setProductSaveSuccessMessage("");
    setIsProductModalOpen(true);
  };

  useEffect(() => {
    if (!isSidebarOpen) return;

    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsSidebarOpen(false);
    };

    document.addEventListener("keydown", closeOnEscape);
    return () => document.removeEventListener("keydown", closeOnEscape);
  }, [isSidebarOpen]);

  return (
    <main
      className="dkAdminLayout"
      dir="ltr"
      data-dir={direction}
      data-menu-open={isSidebarOpen || undefined}
    >
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        lang={lang}
        isOpen={isSidebarOpen}
        anchor={sidebarAnchor}
        onClose={() => setIsSidebarOpen(false)}
      />

      <section className="dkMain" dir={direction}>
        <Header
          activeTab={activeTab}
          lang={lang}
          setLang={setLang}
          isMenuOpen={isSidebarOpen}
          onToggleMenu={(anchor) => {
            setSidebarAnchor(anchor);
            setIsSidebarOpen((open) => !open);
          }}
        />

        {activeTab === "dekobrain" && <AdminToolLauncher lang={lang} />}

        <div className="dkContent">
          {activeTab === "dashboard" && (
            <DashboardPage
              lang={lang}
            />
          )}

          {activeTab === "products" && (
            <ProductsPage
              lang={lang}
              onAddProduct={openAddProductForm}
              refreshKey={productsRefreshKey}
              savedProduct={lastSavedProduct}
              saveSuccessMessage={productSaveSuccessMessage}
            />
          )}

          {activeTab !== "dashboard" && activeTab !== "products" && activeTab !== "dekobrain" && (
            <section className="dkHeroCard">
              <h2>
                {active?.icon} {t(`admin.sidebar.${activeTab}`)}
              </h2>

              <p>{t("admin.readySection")}</p>
            </section>
          )}
        </div>

        <AdminFooter lang={lang} version={t("admin.version")} rights={t("admin.rights")} />
      </section>

      <ProductModal
        open={isProductModalOpen}
        onClose={() => setIsProductModalOpen(false)}
        onSaved={(product, successMessage) => {
          setLastSavedProduct(product);
          setProductSaveSuccessMessage(successMessage);
          setProductsRefreshKey((current) => current + 1);
        }}
        lang={lang}
      />
    </main>
  );
}
