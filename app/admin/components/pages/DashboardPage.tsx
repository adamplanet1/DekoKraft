import HeroCard from "../dashboard/HeroCard";
import Statistics from "../dashboard/Statistics";
import QuickAccess from "../dashboard/QuickAccess";
import { type CmsTabId } from "../../config/cmsTabs";
import { type Lang } from "../../config/translations";

type Props = {
  lang: Lang;
  setActiveTab: (tab: CmsTabId) => void;
  onAddProduct: () => void;
};

export default function DashboardPage({
  lang,
  setActiveTab,
  onAddProduct,
}: Props) {
  const dir = lang === "ar" ? "rtl" : "ltr";

  return (
    <div className="dkDashboardPage" dir={dir}>
      <HeroCard lang={lang} dir={dir} onAddProduct={onAddProduct} />
      <Statistics lang={lang} dir={dir} />
      <QuickAccess lang={lang} dir={dir} setActiveTab={setActiveTab} />
    </div>
  );
}
