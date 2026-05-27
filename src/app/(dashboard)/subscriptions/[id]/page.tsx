import { redirect } from 'next/navigation';

export default function SubscriptionDetailPage({
  params,
}: {
  params: { id: string };
}) {
  redirect(`/subscriptions?edit=${params.id}`);
}
