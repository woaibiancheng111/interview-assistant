import { questions } from "@/lib/data/questions";
import QuestionDetailClient from "./QuestionDetailClient";

export function generateStaticParams() {
  return questions.map((q) => ({
    id: q.id,
  }));
}

export default function QuestionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return <QuestionDetailClient params={params} />;
}
