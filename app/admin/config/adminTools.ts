export type AdminToolStatus="stable"|"beta"|"experimental"|"hidden";export type AdminAccessLevel="public"|"subscriber"|"lab"|"developer";export interface AdminTool{id:string;number?:string;titleKey:string;descriptionKey:string;href:string;image:string;status:AdminToolStatus;featured?:boolean;visibility:AdminAccessLevel}
export const adminTools:AdminTool[]=[
 {id:"eco-dekokraft-studio",titleKey:"studio.title",descriptionKey:"studio.description",href:"/admin/studio",image:"/images/admin/studio/studio-cover.webp",status:"beta",featured:true,visibility:"subscriber"},
 {id:"image-analysis",number:"03",titleKey:"imageAnalysis.title",descriptionKey:"imageAnalysis.description",href:"/admin/dekobrains/image-analysis",image:"/images/admin/tools/image-analysis.webp",status:"experimental",visibility:"lab"},
 {id:"living-identity",number:"12",titleKey:"livingIdentity.title",descriptionKey:"livingIdentity.description",href:"/admin/dekobrain/product-memory",image:"/images/admin/tools/living-identity.webp",status:"experimental",visibility:"lab"},
 {id:"golden-architecture",titleKey:"goldenArchitecture.title",descriptionKey:"goldenArchitecture.description",href:"/admin/dekobrain/architecture",image:"/images/admin/tools/golden-architecture.webp",status:"experimental",visibility:"developer"},
];
export const studioTools:AdminTool[]=[
 {id:"media-import",number:"01",titleKey:"media.title",descriptionKey:"media.description",href:"/admin/studio/media",image:"/images/admin/studio/media-import.webp",status:"stable",visibility:"subscriber"},
 {id:"product-extraction-studio",number:"02",titleKey:"extraction.title",descriptionKey:"extraction.description",href:"/admin/studio/extract",image:"/images/admin/studio/product-extraction.webp",status:"beta",visibility:"subscriber"},
 {id:"background-studio",number:"03",titleKey:"backgrounds.title",descriptionKey:"backgrounds.description",href:"/admin/studio/backgrounds",image:"/images/admin/studio/background-studio.webp",status:"beta",visibility:"subscriber"},
 {id:"product-preview",number:"04",titleKey:"preview.title",descriptionKey:"preview.description",href:"/admin/studio/product-preview",image:"/images/admin/studio/product-preview.webp",status:"stable",visibility:"subscriber"},
 {id:"webp-converter",number:"05",titleKey:"webp.title",descriptionKey:"webp.description",href:"/admin/studio/webp",image:"/images/admin/tools/webp-converter.webp",status:"stable",visibility:"subscriber"},
 {id:"canva-assistant",number:"06",titleKey:"canva.title",descriptionKey:"canva.description",href:"/admin/studio/canva",image:"/images/admin/studio/studio-cover.webp",status:"beta",visibility:"subscriber"},
 {id:"ai-marketing-studio",number:"07",titleKey:"marketing.title",descriptionKey:"marketing.description",href:"/admin/studio/marketing-ai",image:"/images/admin/studio/content-studio.webp",status:"beta",visibility:"subscriber"},
];
const studioToolPaths=new Set(studioTools.map(tool=>tool.href));if(studioToolPaths.size!==studioTools.length)throw new Error("Duplicate EcoDekoKraft Studio tool route detected");
const rank:Record<AdminAccessLevel,number>={public:0,subscriber:1,lab:2,developer:3};export function visibleAdminTools(tools:AdminTool[],level:AdminAccessLevel){return tools.filter(tool=>tool.status!=="hidden"&&rank[level]>=rank[tool.visibility])}
