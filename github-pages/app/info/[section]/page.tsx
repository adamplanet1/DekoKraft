import InfoPage, {
  generateStaticParams as publicInfoParams,
} from "../../../../app/info/[section]/page";

export function generateStaticParams() {
  return publicInfoParams();
}

export default InfoPage;
