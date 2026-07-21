import { useEffect, useRef, useState, type Dispatch, type SetStateAction } from "react";
import type { DekoBrainCopy } from "../../config/dekoBrainTranslations";
import { dekoBrainPreviewTranslations } from "../../config/dekoBrainPreviewTranslations";
import type { Lang } from "../../config/translations";
import type {
  AnalyzedMediaItem,
  MediaFit,
  MediaObjectPosition,
  MediaPreviewRatio,
  PreviewTransform,
} from "../../types/dekobrain";

const ratios: MediaPreviewRatio[] = ["original", "1:1", "4:3", "3:4", "16:9"];
const fits: MediaFit[] = ["contain", "cover"];
const positions: MediaObjectPosition[] = ["center", "top", "bottom", "left", "right"];

const ratioValues: Record<MediaPreviewRatio, string> = {
  original: "auto",
  "1:1": "1 / 1",
  "4:3": "4 / 3",
  "3:4": "3 / 4",
  "16:9": "16 / 9",
};

type Props = {
  copy: DekoBrainCopy;
  item: AnalyzedMediaItem;
  ratio: MediaPreviewRatio;
  fit: MediaFit;
  position: MediaObjectPosition;
  onRatioChange: (value: MediaPreviewRatio) => void;
  onFitChange: (value: MediaFit) => void;
  onPositionChange: (value: MediaObjectPosition) => void;
  locale: Lang;
  previewSourceUrl: string;
  sourceAvailable: boolean;
  sourceWidth: number;
  sourceHeight: number;
  transform: PreviewTransform;
  setTransform: Dispatch<SetStateAction<PreviewTransform>>;
  smartCropActive: boolean;
  onUndoSmartCrop: () => void;
};

export default function MediaPreview({
  copy,
  item,
  ratio,
  fit,
  position,
  onRatioChange,
  onFitChange,
  onPositionChange,
  locale,
  previewSourceUrl,
  sourceAvailable,
  sourceWidth,
  sourceHeight,
  transform,
  setTransform,
  smartCropActive,
  onUndoSmartCrop,
}: Props) {
  const toolCopy = dekoBrainPreviewTranslations[locale];
  const frameRef=useRef<HTMLDivElement>(null);const [frameSize,setFrameSize]=useState({width:0,height:0});const [loadedSource,setLoadedSource]=useState({width:sourceWidth,height:sourceHeight});
  useEffect(()=>{const element=frameRef.current;if(!element)return;const update=()=>setFrameSize({width:element.clientWidth,height:element.clientHeight});update();const observer=new ResizeObserver(update);observer.observe(element);return()=>observer.disconnect();},[ratio]);
  useEffect(()=>{if(!previewSourceUrl)return;const image=new Image();image.onload=()=>{setLoadedSource({width:image.naturalWidth,height:image.naturalHeight});setTransform(current=>({...current,scale:1,x:0,y:0,zoom:1}));onPositionChange("center");};image.src=previewSourceUrl;},[previewSourceUrl,setTransform,onPositionChange]);
  const originalRatio = `${item.width} / ${item.height}`;
  const actualWidth=loadedSource.width||sourceWidth,actualHeight=loadedSource.height||sourceHeight;const availableWidth=frameSize.width*(1-transform.safeArea/50);const availableHeight=frameSize.height*(1-transform.safeArea/50);const containScale=actualWidth&&actualHeight?Math.min(availableWidth/actualWidth,availableHeight/actualHeight):1;const coverScale=actualWidth&&actualHeight?Math.max(availableWidth/actualWidth,availableHeight/actualHeight):1;const baseFitScale=fit==="contain"?containScale:coverScale;const finalScale=(Number.isFinite(baseFitScale)&&baseFitScale>0?baseFitScale:1)*transform.scale*transform.zoom;const movementX=Math.abs(frameSize.width-actualWidth*finalScale)/2;const movementY=Math.abs(frameSize.height-actualHeight*finalScale)/2;
  function move(value:MediaObjectPosition){
    onPositionChange(value);
    setTransform(current=>value==="center"?{...current,x:0,y:0}:value==="top"?{...current,y:-movementY}:value==="bottom"?{...current,y:movementY}:value==="left"?{...current,x:-movementX}:{...current,x:movementX});
  }

  return (
    <section className="dkBrainPanel dkBrainPreviewPanel">
      <div className="dkBrainSectionHeading">
        <div>
          <span>01</span>
          <h2>{copy.preview}</h2>
        </div>
        <small>
          {copy.suggested}: {copy.ratios[item.recommendedCardRatio]} · {copy.fits[item.recommendedFit]}
        </small>
      </div>

      <div
        ref={frameRef}
        className="dkBrainPreviewFrame"
        style={{ aspectRatio: ratio === "original" ? originalRatio : ratioValues[ratio] }}
      >
        {/* Blob URLs are intentionally used because files remain local in Phase 1. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <div className="dkBrainPreviewSafeArea">{sourceAvailable?<img src={previewSourceUrl} alt={item.filename} width={actualWidth} height={actualHeight} style={{transform:`translate3d(${transform.x}px, ${transform.y}px, 0) scale(${finalScale})`}} />:<p className="dkBrainPreviewNeedsApproval">{toolCopy.needsApproval}</p>}</div>
      </div>
      <div className={`dkBrainPreviewSourceStatus ${sourceAvailable?"ready":"waiting"}`}>{sourceAvailable?toolCopy.approvedSource:toolCopy.needsApproval}</div>

      <div className="dkBrainPreviewControls">
        <fieldset>
          <legend>{copy.previewRatio}</legend>
          <div className="dkBrainSegmentedControls">
            {ratios.map((value) => (
              <button key={value} type="button" className={ratio === value ? "active" : ""} onClick={() => onRatioChange(value)}>
                {copy.ratios[value]}
              </button>
            ))}
          </div>
        </fieldset>
        <fieldset>
          <legend>{copy.fit}</legend>
          <div className="dkBrainSegmentedControls">
            {fits.map((value) => (
              <button key={value} type="button" className={fit === value ? "active" : ""} onClick={() => onFitChange(value)}>
                {copy.fits[value]}
              </button>
            ))}
          </div>
        </fieldset>
        <fieldset>
          <legend>{copy.objectPosition}</legend>
          <div className="dkBrainSegmentedControls">
            {positions.map((value) => (
              <button key={value} type="button" className={position === value ? "active" : ""} onClick={() => move(value)}>
                {copy.positions[value]}
              </button>
            ))}
          </div>
        </fieldset>
        <div className="dkBrainPreviewTransformControls">{([
          ["scale",toolCopy.productSize,.4,1.4,.01],["x",toolCopy.horizontal,-45,45,1],["y",toolCopy.vertical,-45,45,1],["zoom",toolCopy.zoom,.5,2,.01],["safeArea",toolCopy.safeArea,0,20,1]
        ] as const).map(([key,label,min,max,step])=><label key={key}><span>{label}: <b>{transform[key]}</b></span><input type="range" min={min} max={max} step={step} value={transform[key]} onChange={event=>setTransform(current=>({...current,[key]:Number(event.target.value)}))}/></label>)}</div>
        {smartCropActive&&<button type="button" className="dkBrainUndoCrop" onClick={onUndoSmartCrop}>{toolCopy.undoCrop}</button>}
      </div>
    </section>
  );
}
