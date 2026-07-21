import { analyzeProductNature } from "./productNatureAnalyzer";

function assert(condition:boolean,message:string){if(!condition)throw new Error(message)}
const candle=analyzeProductNature({fileName:"candlescircular01.jpeg"});
assert(candle.nature==="candle","candle filename classification");assert(candle.protectedFeatures.includes("flame")&&candle.protectedFeatures.includes("wick"),"candle protection");assert(candle.recommendedSettings.detailProtection>=85,"candle detail protection");assert(candle.recommendedSettings.shadowMode!=="experimentalRemove","candle shadow safety");
const glass=analyzeProductNature({fileName:"glass-vase-phone.jpg"});assert(glass.nature==="glass","glass filename classification");assert(glass.recommendedSettings.extractionPreset==="reflectionSafe","glass reflection preset");
const unknown=analyzeProductNature({fileName:"articles.jpg"});assert(["unknown","mixed"].includes(unknown.nature),"ambiguous filename classification");assert(unknown.confidence<40&&unknown.riskLevel==="high","ambiguous image safety");
const phone=analyzeProductNature({fileName:"IMG_1234.jpg",imageMetrics:{edgeDensity:88,colorVariance:84,backgroundUniformity:15}});assert(["phonePhoto","complexScene"].includes(phone.sceneSource),"complex phone scene source");assert(phone.recommendedSettings.extractionPreset==="complexSceneManual","complex scene manual preset");
