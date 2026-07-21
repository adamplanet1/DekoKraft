"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { useLanguage } from "../../components/LanguageProvider";
import { getSellerById } from "../../data/sellers";
import { setSellerStatus } from "../lib/sellerAccountStorage";
import SellerSessionProvider, { useSellerSession } from "./SellerSessionProvider";

function LoginForm() {
  const router = useRouter();
  const { direction, t } = useLanguage();
  const { loginSeller } = useSellerSession();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  function login() {
    if (!password.trim()) {
      setMessage(t("login.passwordRequired"));
      return;
    }
    const result = loginSeller(email);
    if (!result.ok) {
      setMessage(result.message ?? t("login.failed"));
      return;
    }
    router.replace("/seller/dashboard");
  }

  function quickLogin(sellerId: string) {
    setMessage("");
    const account = getSellerById(sellerId);
    if (!account) {
      setMessage(t("login.testAccountMissing"));
      return;
    }
    if (account.status === "invited") setSellerStatus(sellerId, "active");
    const result = loginSeller(account.email, sellerId);
    if (!result.ok) {
      setMessage(result.message ?? t("login.quickFailed"));
      return;
    }
    router.push(`/seller/${sellerId}`);
  }

  function submit(event: FormEvent) {
    event.preventDefault();
    login();
  }

  return (
    <main className="sellerLoginPage" dir={direction}>
      <section className="sellerLoginCard">
        <span className="sellerLoginLogo">DK</span>
        <h1>{t("login.title")}</h1>
        <p>{t("login.description")}</p>
        <form onSubmit={submit}>
          <label>
            {t("login.email")}
            <input type="email" value={email} onChange={(event) => setEmail(event.target.value)} autoComplete="email" />
          </label>
          <label>
            {t("login.password")}
            <input type="password" value={password} onChange={(event) => setPassword(event.target.value)} autoComplete="current-password" />
          </label>
          {message && <p role="alert" className="sellerFormMessage">{message}</p>}
          <button className="sellerPrimary">{t("login.submit")}</button>
        </form>
        {process.env.NODE_ENV === "development" && (
          <div className="sellerTestAccounts">
            <h2>{t("login.testAccounts")}</h2>
            <p>{t("login.testAccountsDescription")}</p>
            {["seller-001", "seller-002", "seller-003"].map((id) => (
              <button type="button" key={id} onClick={() => quickLogin(id)}>
                {t("login.quickLogin", { id })}
              </button>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}

export default function SellerLogin() {
  return <SellerSessionProvider><LoginForm /></SellerSessionProvider>;
}
