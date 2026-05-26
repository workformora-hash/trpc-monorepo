import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { trpc } from '~/trpc/client';

export function useAuthRedirect() {
  const router = useRouter();
  const { data: userSession, isLoading: sessionLoading } = trpc.auth.getCurrentUser.useQuery();
  const user = userSession?.user;

  useEffect(() => {
    if (!sessionLoading && !user) {
      toast.error('Please login to access the form builder.');
      router.push('/login');
    }
  }, [user, sessionLoading, router]);

  return { user, sessionLoading };
}
