'use client';

import '@/lib/amplify';
import { confirmSignUp, resendSignUpCode } from 'aws-amplify/auth';
import { useSearchParams, useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Loader2, MailCheck, RotateCcw } from 'lucide-react';

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

type ConfirmForm = { code: string };

export default function ConfirmPage() {
  const params = useSearchParams();
  const username = params.get('u') || '';
  const router = useRouter();

  const { register, handleSubmit } = useForm<ConfirmForm>();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [resent, setResent] = useState(false);

  const onSubmit = async (data: ConfirmForm) => {
    if (!username) {
      setError('Missing username');
      return;
    }
    setLoading(true);
    setError(null);
    setSuccess(false);
    try {
      await confirmSignUp({ username, confirmationCode: data.code });
      setSuccess(true);
      setTimeout(() => router.push('/signin'), 800);
    } catch (err: any) {
      setError(err.message || 'Confirmation failed');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!username) return;
    setLoading(true);
    setError(null);
    setResent(false);
    try {
      await resendSignUpCode({ username });
      setResent(true);
    } catch (err: any) {
      setError(err.message || 'Cannot resend');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-950 to-slate-900 p-4">
      <Card className="w-full max-w-md rounded-2xl shadow-xl">
        <CardContent className="p-8 space-y-6">
          <h1 className="text-2xl font-bold text-center text-white">Confirm your email</h1>
          <p className="text-center text-sm text-slate-600">A 6-digit code was sent to your email for user <span className="font-medium text-slate-400">{username || 'unknown'}</span>.</p>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Input placeholder="Confirmation code" {...register('code', { required: true })} />
            {error && <p className="text-sm text-red-500">{error}</p>}
            {success && <p className="flex items-center gap-1 text-sm text-emerald-400"><MailCheck className="h-4 w-4" /> Confirmed! Redirecting…</p>}
            {resent && <p className="text-sm text-sky-400">Code resent.</p>}
            <Button type="submit" className="w-full" disabled={loading}>{loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Confirm'}</Button>
            <Button variant="secondary" className="w-full gap-2" type="button" disabled={loading} onClick={handleResend}>
              <RotateCcw className="h-4 w-4" /> Resend code
            </Button>
          </form>
        </CardContent>
      </Card>
    </motion.div>
  );
}
