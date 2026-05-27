import { redirect } from 'next/navigation';
import { trpc } from '~/trpc/client';

export function useAuthRedirect() {
  const { data: userSession, isLoading: sessionLoading } = trpc.auth.getCurrentUser.useQuery();
  const user = userSession?.user;

  if (!sessionLoading && !user) {
    redirect('/login');
  }

  return { user, sessionLoading };
}
