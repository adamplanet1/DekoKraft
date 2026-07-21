"use client";
"use client";

import Link from "next/link";

type WelcomeCard = {
  id: string;
  title: string;
  icon: string;
  href: string;
};

const cards: WelcomeCard[] = [
  {
    id: "home",
    title: "الصفحة الرئيسية",
    icon: "🏠",
    href: "/",
  },
  {
    id: "market",
    title: "السوق",
    icon: "🛍️",
    href: "/",
  },
  {
    id: "crafts",
    title: "استكشف أعمال الحرفيين",
    icon: "🎨",
    href: "/",
  },
  {
    id: "join",
    title: "انضم كمشارك",
    icon: "🧑‍🎨",
    href: "/",
  },
  {
    id: "login",
    title: "تسجيل الدخول",
    icon: "🔑",
    href: "/seller/login/",
  },
  {
    id: "about",
    title: "من نحن",
    icon: "ℹ️",
    href: "/info/about/",
  },
  {
    id: "comments",
    title: "التعليقات",
    icon: "💬",
    href: "/info/contact/",
  },
  {
    id: "suggestions",
    title: "اقتراحات",
    icon: "💡",
    href: "/info/contact/",
  },
  {
    id: "services",
    title: "مركز الخدمات",
    icon: "🛠️",
    href: "/info/",
  },
  {
    id: "studio",
    title: "الاستوديوهات الذكية",
    icon: "🧠",
    href: "/echo/",
  },
];

function getCorrectHref(path: string): string {
  const cleanPath = path.startsWith("/") ? path : `/${path}`;

  if (typeof window !== "undefined") {
    const isGitHubPages =
      window.location.hostname === "adamplanet1.github.io";

    if (isGitHubPages) {
      return `/DekoKraft${cleanPath}`;
    }
  }

  return cleanPath;
}

export default function WelcomePortal() {
  return (
    <main className="welcomePage" dir="rtl">
      <section className="welcomePortal">
        <header className="welcomeHeader">
          <h1>
            مرحبًا بكم في <span>DekoKraft</span>
          </h1>

          <p>منصة تجمع الإبداع، الحرف، التعلم والخدمات في مساحة واحدة</p>
        </header>

        <div className="welcomeCards">
          {cards.map((card) => (
            <Link
              key={card.id}
              href={getCorrectHref(card.href)}
              className="welcomeCard"
              prefetch={false}
            >
              <span className="welcomeCardIcon" aria-hidden="true">
                {card.icon}
              </span>

              <span className="welcomeCardTitle">{card.title}</span>
            </Link>
          ))}
        </div>

        <button
          type="button"
          className="welcomeRestartButton"
          onClick={() => window.location.reload()}
        >
          إعادة تشغيل الترحيب
        </button>
      </section>
    </main>
  );
}