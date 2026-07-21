"use client";
import type{Lang}from"../../config/translations";
import { createTranslator } from "../../../../locales";
import Link from "next/link";
import { routes } from "../../../config/routes";
const legal=["Impressum","Datenschutz","AGB","Accessibility","Cookies","Legal"];
export default function AdminFooter({lang,version}:{lang:Lang;version:string;rights:string}){const t=createTranslator(lang);return <footer className="dkAdminFooter"><strong>DekoKraft</strong><span>© DekoKraft CMS 2026</span><span>{t("footer.rights")}</span><span>{version}</span><nav aria-label={t("footer.legalLinks")}>{legal.map(item=><Link href={`${routes.info("legal")}?topic=${encodeURIComponent(item)}`} key={item}>{item}</Link>)}</nav><button type="button" onClick={()=>window.scrollTo({top:0,behavior:"smooth"})}>{t("footer.top")}</button></footer>}
