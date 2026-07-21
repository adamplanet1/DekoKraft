export default function BeforeAfterPreview({ originalUrl, resultUrl, activePreview, comparing, labels, onCompare, onShowOriginal, onShowResult, onModify, onRetry, onAccept, onReject, onDownload }: {
  originalUrl: string; resultUrl: string; activePreview: "original" | "generated"; comparing: boolean;
  labels: { compare: string; showOriginal: string; showResult: string; modify: string; retry: string; accept: string; reject: string; download: string };
  onCompare: (value: boolean) => void; onShowOriginal: () => void; onShowResult: () => void; onModify: () => void; onRetry: () => void; onAccept: () => void; onReject: () => void; onDownload: () => void;
}) {
  const previewUrl = comparing || activePreview === "original" ? originalUrl : resultUrl;
  return <section className="smartEditBeforeAfter"><Image src={previewUrl} alt="" width={420} height={280} unoptimized /><div className="smartEditChat__actions"><button type="button" aria-pressed={activePreview === "original"} onClick={onShowOriginal}>{labels.showOriginal}</button><button type="button" aria-pressed={activePreview === "generated"} onClick={onShowResult}>{labels.showResult}</button><button type="button" onPointerDown={() => onCompare(true)} onPointerUp={() => onCompare(false)} onPointerCancel={() => onCompare(false)}>{labels.compare}</button><button type="button" onClick={onModify}>{labels.modify}</button><button type="button" onClick={onRetry}>{labels.retry}</button><button type="button" onClick={onAccept}>{labels.accept}</button><button type="button" onClick={onReject}>{labels.reject}</button><button type="button" onClick={onDownload}>{labels.download}</button></div></section>;
}
import Image from "next/image";
