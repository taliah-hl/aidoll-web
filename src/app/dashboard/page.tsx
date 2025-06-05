'use client';

import '@/lib/amplify';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Power, Bell, Upload, Loader2, LogOut } from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { getCurrentUser, signOut } from 'aws-amplify/auth';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

export default function DashboardPage() {
  const router = useRouter();

  /* --- Auth Guard ------------------------------------ */
  const [authChecked, setAuthChecked] = useState(false);
  useEffect(() => {
    (async () => {
      try {
        await getCurrentUser();
        setAuthChecked(true);
        console.log(authChecked)
      } catch (_) {
        router.replace('/signin');
      }
    })();
  }, [router]);

  /* --- State ----------------------------------------- */
  const [connected, setConnected] = useState(false);
  const [busy, setBusy] = useState(false);
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  /* --- Actions --------------------------------------- */
  const toggleConnection = async () => {
    setBusy(true);
    await new Promise((r) => setTimeout(r, 500)); // TODO: IoT publish
    setConnected((c) => !c);
    setBusy(false);
  };

  const handleNotify = async () => {
    setBusy(true);
    await new Promise((r) => setTimeout(r, 500)); // TODO: publish notif
    setBusy(false);
  };

  const handleSendMedia = async () => {
    setBusy(true);
    await new Promise((r) => setTimeout(r, 500)); // TODO: upload & publish
    setBusy(false);
  };

  const mockReceivePhoto = () => setImageUrl('/media/test.jpg');

  /* --- Logout ---------------------------------------- */
  const handleLogout = async () => {
    await signOut();
    router.replace('/signin');
  };

  if (!authChecked) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 text-white">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  /* --- UI -------------------------------------------- */
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="relative min-h-screen bg-slate-950 p-4 text-white">
      {/* Logout Button */}
      <Button
        onClick={handleLogout}
        variant="ghost"
        className="absolute top-4 right-4 gap-2 text-sm"
      >
        <LogOut className="h-4 w-4" /> Logout
      </Button>

      <h1 className="text-3xl font-bold mb-6 text-center">Aidoll Dashboard</h1>

      <div className="mx-auto flex flex-col gap-6 max-w-xl">
        {/* 控制卡片 */}
        <Card className="rounded-2xl shadow-xl bg-slate-900">
          <CardContent className="p-8 flex flex-col items-center gap-6">
            <Button onClick={toggleConnection} disabled={busy} size="icon" className="h-16 w-16 rounded-full">
              {busy ? (
                <Loader2 className="h-8 w-8 animate-spin" />
              ) : (
                <Power className={`h-8 w-8 ${connected ? 'text-green-500' : 'text-red-500'}`} />
              )}
            </Button>
            <p className="text-white">{connected ? 'Connected' : 'Disconnected'}</p>

            <div className="flex gap-4">
              <Button onClick={handleNotify} disabled={!connected || busy} className="gap-2">
                <Bell className="h-4 w-4" /> Notify
              </Button>
              <Button onClick={handleSendMedia} disabled={!connected || busy} className="gap-2">
                <Upload className="h-4 w-4" /> Media
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Snapshot */}
        <Card className="rounded-2xl shadow-xl bg-slate-900">
          <CardContent className="p-4 flex flex-col items-center gap-4">
            <h2 className="text-xl font-semibold text-white">Latest Snapshot</h2>
            {imageUrl ? (
              <Image src={imageUrl} alt="Aidoll snapshot" width={320} height={240} className="rounded-lg object-cover" />
            ) : (
              <p className="text-sm text-slate-400">No image yet.</p>
            )}
            <Button variant="secondary" onClick={mockReceivePhoto} className="text-xs">
              Mock Receive Photo
            </Button>
          </CardContent>
        </Card>
      </div>
    </motion.div>
  );
}
