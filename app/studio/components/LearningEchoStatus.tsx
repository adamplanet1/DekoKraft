export default function LearningEchoStatus({ title, pending, items }: { title: string; pending: string; items: string[] }) {
  return <section className="smartEditLearningStatus" role="status"><strong>{title}</strong><ul>{items.map((item) => <li key={item}>{item}</li>)}</ul><p>{pending}</p></section>;
}
