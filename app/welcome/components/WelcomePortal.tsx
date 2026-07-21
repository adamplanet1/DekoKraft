"use client";

import { DkButton, DkGlassPanel } from "../../components/ui";
import PublicPageShell from "../../components/PublicPageShell";
import WelcomeCard from "./WelcomeCard";

type WelcomeCardDefinition = {
  id: string;
  title: string;
  icon: string;
  href: string;
};

const cards: WelcomeCardDefinition[] = [
  { id: "home", title: "الصفحة الرئيسية", icon: "🏠", href: "/" },
  { id: "market", title: "السوق", icon: "🛍️", href: "/market" },
  { id: "crafts", title: "استكشف أعمال الحرفيين", icon: "🎨", href: "/info/artisans" },
  { id: "join", title: "انضم كمشارك", icon: "🧑‍🎨", href: "/register" },
  { id: "login", title: "تسجيل الدخول", icon: "🔑", href: "/seller/login" },
  { id: "about", title: "من نحن", icon: "ℹ️", href: "/info/about" },
  { id: "comments", title: "التعليقات", icon: "💬", href: "/info/comments" },
  { id: "suggestions", title: "اقتراحات", icon: "💡", href: "/info/suggestions" },
  { id: "services", title: "مركز الخدمات", icon: "🛠️", href: "/info/services" },
  { id: "studio", title: "الاستوديوهات الذكية", icon: "🧠", href: "/echo" },
];

export default function WelcomePortal() {
  return (
    <PublicPageShell className="welcomePublicShell">
      <main className="welcomePage" dir="rtl">
        <div className="welcomePageContent">
          <DkGlassPanel as="section" strength="subtle" className="welcomePortalPanel">
            <header className="welcomePortalHeader">
              <h1>
                مرحبًا بكم في <span>DekoKraft</span>
              </h1>
              <p>منصة تجمع الإبداع، الحرف، التعلم والخدمات في مساحة واحدة</p>
            </header>

            <nav className="welcomePortalGrid" aria-label="روابط الترحيب">
              {cards.map((card) => (
                <WelcomeCard
                  key={card.id}
                  title={card.title}
                  icon={card.icon}
                  href={card.href}
                />
              ))}
            </nav>

            <DkButton
              type="button"
              className="welcomeReplayButton"
              size="sm"
              variant="transparent"
              onClick={() => window.location.reload()}
            >
              إعادة تشغيل الترحيب
            </DkButton>
          </DkGlassPanel>
        </div>
      </main>
    </PublicPageShell>
  );
}
