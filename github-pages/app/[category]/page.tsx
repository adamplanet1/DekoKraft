import CategoryPage, { generateStaticParams as publicCategoryParams } from "../../../app/[category]/page";
export function generateStaticParams() { return publicCategoryParams(); }
export default CategoryPage;
