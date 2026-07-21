import{StudioMediaProvider}from"./components/StudioMediaContext";
import "../admin-v2.css";
export default function StudioLayout({children}:{children:React.ReactNode}){return <StudioMediaProvider>{children}</StudioMediaProvider>}
