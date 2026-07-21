import { getDashboardMenu, type DashboardMenuItem, type DashboardPermission } from "../../config/dashboardMenu";

export type AdminDashboardPermission = DashboardPermission;
export type AdminDashboardItem = DashboardMenuItem;
export const adminDashboardItems: AdminDashboardItem[] = getDashboardMenu("admin");
