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
  return (
    <>
      <HeroCard lang={lang} onAddProduct={onAddProduct} />
      <Statistics lang={lang} />
      <QuickAccess lang={lang} setActiveTab={setActiveTab} />
    </>
  );
}
