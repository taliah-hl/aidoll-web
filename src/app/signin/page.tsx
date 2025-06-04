'use client';

import '@/lib/amplify';
import { signIn, getCurrentUser } from 'aws-amplify/auth';
import { useForm } from 'react-hook-form';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { Loader2, CheckCircle2 } from 'lucide-react';

import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

type SignInForm = { username: string; password: string };

export default function SignInPage() {
  const { register, handleSubmit } = useForm<SignInForm>();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const router = useRouter();

  const [authChecked, setAuthChecked] = useState<boolean | null>(null); // null = 尚未檢查
  useEffect(() => {
    (async () => {
      try {
        await getCurrentUser();
        setAuthChecked(true);
        router.replace('/dashboard');
      } catch {
        setAuthChecked(false);
      }
    })();
  }, [router]);

  const onSubmit = async (data: SignInForm) => {
    setLoading(true);
    setError(null);
    setSuccess(false);
    try {
      const { isSignedIn, nextStep } = await signIn({ username: data.username, password: data.password });

      if (isSignedIn) {
        setSuccess(true);
        setTimeout(() => router.push('/dashboard'), 500);
        return;
      }

      switch (nextStep?.signInStep) {
        case 'CONFIRM_SIGN_UP':
          router.push(`/confirm?u=${encodeURIComponent(data.username)}`);
          break;
        case 'CONFIRM_SIGN_IN_WITH_SMS_CODE':
          setError('Please complete_SMS verification — not implemented yet.');
          break;      // ── 未完全登入時的流程分支 ───────────────────────────
        case 'RESET_PASSWORD':
          setError('Password reset required.');
          break;
        default:
          setError('Additional verification required.');
      }
    } catch (err: any) {
      if (err.name === 'UserNotConfirmedException') {
        // 帶 username 去 confirm 頁
        router.push(`/confirm?u=${encodeURIComponent(data.username)}`);
        return;
      }
      setError(err.message || 'Sign-in failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-950 to-slate-900 p-4">
      {authChecked === null ? <Loader2/> :
      <Card className="w-full max-w-md rounded-2xl shadow-xl">
        <CardContent className="p-8 space-y-6">
          <h1 className="text-2xl font-bold text-center text-black">Sign in</h1>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Input placeholder="Email" {...register('username', { required: true })} />
            <Input type="password" placeholder="Password" {...register('password', { required: true })} />
            {error && <p className="text-sm text-red-500">{error}</p>}
            {success && <p className="flex items-center gap-1 text-sm text-emerald-400"><CheckCircle2 className="h-4 w-4" /> Signed in!</p>}
            <Button type="submit" className="w-full" disabled={loading}>{loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Sign in'}</Button>
            <Button variant="link" className="w-full text-xs" type="button" onClick={() => router.push('/signup')}>Don't have an account? Sign up</Button>
          </form>
        </CardContent>
      </Card>
      } 
    </motion.div>
  );
}
