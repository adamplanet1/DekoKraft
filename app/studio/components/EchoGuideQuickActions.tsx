export default function EchoGuideQuickActions({ labels, onAction }: {
  labels: { professionalBackground: string; improveLighting: string; reduceShadows: string; preserveShape: string; advertisement: string; reviewQuality: string };
  onAction: (action: keyof typeof labels) => void;
}) {
  return <div className="echoGuideQuickActions">{(Object.keys(labels) as (keyof typeof labels)[]).map((action) => <button type="button" key={action} onClick={() => onAction(action)}>{labels[action]}</button>)}</div>;
}
