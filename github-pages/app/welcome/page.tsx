import type { Metadata } from "next";
import WelcomePortal from "./components/WelcomePortal";
import "../../../app/welcome/welcome.css";

export const metadata: Metadata = {
  title: "Welcome | DekoKraft",
  description: "DekoKraft Welcome Portal",
};

export default function WelcomePage() {
  return <WelcomePortal />;
}
