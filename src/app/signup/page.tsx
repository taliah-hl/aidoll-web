'use client';

import '@/lib/amplify';
import { signUp } from 'aws-amplify/auth';
import { useForm } from 'react-hook-form';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { Loader2, CheckCircle2 } from 'lucide-react';

import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

type SignUpForm = { email: string; password: string };

export function SignUpPage() {
  const { register, handleSubmit } = useForm<SignUpForm>();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const router = useRouter();

  const onSubmit = async (data: SignUpForm) => {
    setLoading(true);
    setError(null);
    setSuccess(false);
    try {
      await signUp({
        username: data.email,
        password: data.password,
        options: {
          userAttributes: { email: data.email },
        },
      });
      setSuccess(true);
      setTimeout(() => router.push(`/confirm?u=${encodeURIComponent(data.email)}`), 800);
    } catch (err: any) {
      setError(err.message || 'Sign-up failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-950 to-slate-900 p-4">
      <Card className="w-full max-w-md rounded-2xl shadow-xl">
        <CardContent className="p-8 space-y-6">
          <h1 className="text-2xl font-bold text-center text-black">Sign up</h1>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Input placeholder="Email" type="email" {...register('email', { required: true })} />
            <Input type="password" placeholder="Password" {...register('password', { required: true, minLength: 8 })} />
            {error && <p className="text-sm text-red-500">{error}</p>}
            {success && <p className="flex items-center gap-1 text-sm text-emerald-400"><CheckCircle2 className="h-4 w-4" /> Account created! Check your email.</p>}
            <Button type="submit" className="w-full" disabled={loading}>{loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Create account'}</Button>
            <Button variant="link" className="w-full text-xs" type="button" onClick={() => router.push('/signin')}>Already have an account? Sign in</Button>
          </form>
        </CardContent>
      </Card>
    </motion.div>
  );
}

export default SignUpPage;
