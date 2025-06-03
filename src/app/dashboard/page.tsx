'use client';

import '@/lib/amplify';
import { useState, useEffect} from 'react';
import { useRouter } from 'next/navigation';

import { motion } from 'framer-motion';
import { Power, Bell, Upload, Loader2 } from 'lucide-react';
import Image from 'next/image';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

import { getCurrentUser } from 'aws-amplify/auth';

export default function DashboardPage() {
  const router = useRouter();

  const [authChecked, setAuthChecked] = useState(false);

  const [connected, setConnected] = useState(false);
  const [busy, setBusy] = useState(false);
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  // ──────────────────────── auth guard ─────────────────────────────
  useEffect(() => {
    (async () => {
      try {
        await getCurrentUser(); // 若未登入會丟錯誤
        setAuthChecked(true);
      } catch (_) {
        console.log(_)
        router.replace('/signin');
      }
    })();
  }, [router]);

  if (!authChecked) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 text-white">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  // --- 模擬連線 / 發送動作 ------------------------------
  const toggleConnection = async () => {
    setBusy(true);
    try {
      // TODO: 呼叫 IoT publish 或 API 觸發裝置連線/斷線
      const res = await fetch('https://cagrxdp7g5.execute-api.ap-southeast-2.amazonaws.com/check-connectivity');
      if (!res.ok) throw new Error('check connectivity failed');
      else {
        const responseBody = await res.json();
        setConnected((c) => !c);
      }
      
    } finally {
      setBusy(false);
    }
  };

  const handleNotify = async () => {
    setBusy(true);
    try {
      // TODO: publish 通知
      const res = await fetch('https://cagrxdp7g5.execute-api.ap-southeast-2.amazonaws.com/notification');
      if(res.ok){
        const responseBody = await res.json();
        console.log(responseBody);
      }
      await new Promise((res) => setTimeout(res, 500));
    } finally {
      setBusy(false);
    }
  };

  const handleSendMedia = async () => {
    setBusy(true);
    const res = await fetch('https://cagrxdp7g5.execute-api.ap-southeast-2.amazonaws.com/cue');
    //console.log(response);
    if(res.ok){
      const responseBody = await res.json();
      if (responseBody?.success) {
        // cue me is successful
      }
    }
    
    try {
      // TODO: 開檔對話框，將 sound/image 透過 API 上傳 & 發送
      await new Promise((res) => setTimeout(res, 500));
    } finally {
      setBusy(false);
    }
  };

  // 假資料：裝置回傳了一張照片
  const mockReceivePhoto = () => {
    setImageUrl('/media/test.jpg'); // TODO: 換成實際 S3 URL
  };

  // --- 模擬健康檢查 ------------------------------
  const handleHealthCheck = async () => {
    setBusy(true);
    try {
      const res = await fetch('https://cagrxdp7g5.execute-api.ap-southeast-2.amazonaws.com/health-check-no-auth');
      
      if (!res.ok) throw new Error('Health check failed');
      else {
        const responseBody = await res.json();
        console.log(responseBody);
        alert(responseBody.message || 'Device is healthy!');
      }
      
    } catch (err) {
      alert('Health check failed.');
    } finally {
      setBusy(false);
    }
  };


  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="min-h-screen bg-slate-950 p-4 text-white">
      <h1 className="text-3xl font-bold mb-6 text-center">Aidoll Dashboard</h1>

      <div className="mx-auto flex flex-col gap-6 max-w-md">
        {/* 控制卡片 */}
        <Card className="rounded-2xl shadow-xl bg-slate-900">
          <CardContent className="p-8 flex flex-col items-center gap-6">
            {/* 連線按鈕 */}
            <Button onClick={toggleConnection} disabled={busy} size="icon" className="h-16 w-16 rounded-full">
              {busy ? (
                <Loader2 className="h-8 w-8 animate-spin" />
              ) : (
                <Power className={`h-8 w-8 ${connected ? 'text-green-500' : 'text-red-500'}`} />
              )}
            </Button>
            <p className="text-white">{connected ? 'Connected' : 'Disconnected'}</p>

            <div className="flex flex-row gap-4">
              <Button onClick={handleNotify} disabled={!connected || busy} className="gap-2">
                <Bell className="h-4 w-4" /> Notify
              </Button>
              <Button onClick={handleSendMedia} disabled={!connected || busy} className="gap-2">
                <Upload className="h-4 w-4" /> Cue Me
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* 顯示照片 */}
        <Card className="rounded-2xl shadow-xl bg-slate-900">
          <CardContent className="p-4 flex flex-col items-center gap-4">
            <h2 className="text-xl text-white font-semibold">Latest Snapshot</h2>
            {imageUrl ? (
              <Image src={imageUrl} alt="Aidoll snapshot" width={320} height={240} className="rounded-lg object-cover" />
            ) : (
              <p className="text-sm text-slate-400">No image yet.</p>
            )}
            <Button variant="secondary" onClick={mockReceivePhoto} className="text-xs">Mock Receive Photo</Button>
          </CardContent>
        </Card>
        {/* 健康檢查卡片 */}
        <Card className="rounded-2xl shadow-xl bg-slate-900">
          <CardContent className="p-6 flex flex-col items-center gap-4">
            <h2 className="text-xl text-white font-semibold">Health Check</h2>
            <Button onClick={handleHealthCheck}  className="gap-2">
              🩺 Run Health Check
            </Button>
          </CardContent>
        </Card>
      </div>
    </motion.div>
  );
}
