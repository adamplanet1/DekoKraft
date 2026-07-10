"use client";

import { useState } from "react";
import { cmsTabs, type CmsTabId } from "../config/cmsTabs";
import { translations } from "../config/translations";
import { useLanguage } from "../../components/LanguageProvider";

import Sidebar from "./layout/Sidebar";
import Header from "./layout/Header";
import DashboardPage from "./pages/DashboardPage";
import ProductsPage from "./pages/ProductsPage";
import ProductModal from "./products/ProductModal";

export default function AdminShell() {
  const [activeTab, setActiveTab] = useState<CmsTabId>("dashboard");
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const { lang, setLang } = useLanguage();

  const isArabic = lang === "ar";
  const active = cmsTabs.find((tab) => tab.id === activeTab);
  const t = translations[lang];

  const openAddProductForm = () => {
    setActiveTab("products");
    setIsProductModalOpen(true);
  };

  return (
    <main
      className="dkAdminLayout"
      dir={isArabic ? "rtl" : "ltr"}
      data-dir={isArabic ? "rtl" : "ltr"}
    >
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        lang={lang}
      />

      <section className="dkMain">
        <Header
          activeTab={activeTab}
          lang={lang}
          setLang={setLang}
          onAddProduct={openAddProductForm}
        />

        <div className="dkContent">
          {activeTab === "dashboard" && (
            <DashboardPage
              lang={lang}
              setActiveTab={setActiveTab}
              onAddProduct={openAddProductForm}
            />
          )}

          {activeTab === "products" && (
            <ProductsPage
              lang={lang}
              onAddProduct={openAddProductForm}
            />
          )}

          {activeTab !== "dashboard" && activeTab !== "products" && (
            <section className="dkHeroCard">
              <h2>
                {active?.icon} {t.sidebar[activeTab]}
              </h2>

              <p>{t.readySection}</p>
            </section>
          )}
        </div>

        <footer className="dkFooter">
          <span>{t.version}</span>
          <span>{t.rights}</span>
        </footer>
      </section>

      <ProductModal
        open={isProductModalOpen}
        onClose={() => setIsProductModalOpen(false)}
        lang={lang}
      />
    </main>
  );
}
