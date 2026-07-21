import ProductPage, { generateStaticParams as publicProductParams } from "../../../../app/[category]/[product]/page";
export function generateStaticParams() { return publicProductParams(); }
export default ProductPage;
