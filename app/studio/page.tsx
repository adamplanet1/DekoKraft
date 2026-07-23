import type { Metadata } from "next";
import StudioV2Shell from "../studio-v2/components/StudioV2Shell";
import "../studio-v2/studio-v2.css";

export const metadata: Metadata = {
  title: "Echo Studio | DekoKraft",
  description: "مساحة لمعالجة الصور والفيديو والتصميم ثلاثي الأبعاد",
};

export default function StudioPage() {
  return <StudioV2Shell />;
}
