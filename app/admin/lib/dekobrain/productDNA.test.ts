import {buildProductDNA} from "./productDNA";import {analyzeProductNature} from "./productNatureAnalyzer";
function assert(condition:boolean,message:string){if(!condition)throw new Error(message)}
const report=analyzeProductNature({fileName:"candlescircular01.jpeg",width:800,height:1200});
const initial=buildProductDNA({productId:"product-1",report,image:{width:800,height:1200,mimeType:"image/jpeg"}});
assert(initial.category==="candle"&&initial.protections.flame&&initial.protections.wick,"candle DNA protections");
const corrected=buildProductDNA({productId:"product-1",report,image:{width:800,height:1200},correctedCategory:"glass",previous:initial,categoryCorrection:true});
assert(corrected.category==="glass"&&corrected.learning.userCorrectedCategory&&corrected.learning.correctionCount===1,"category correction learning");
const approved=buildProductDNA({productId:"product-1",report,image:{width:800,height:1200},correctedCategory:"glass",previous:corrected,acceptedResult:true,extractionSettings:{backgroundSensitivity:48,edgeSoftness:18,detailProtection:92,shadowMode:"keep"}});
assert(approved.learning.acceptedResult&&approved.version===corrected.version+1,"approval version");
assert(approved.extractionProfile.detailProtection===92,"applied extraction profile");
