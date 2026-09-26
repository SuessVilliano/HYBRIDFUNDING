import { useEffect, useState } from 'react';
export type Standing = { id: string; name: string; rank: number; dashboardUrl: string; startingBalance: number; balance: number; equity: number; pnl: number; returnPct: number; tradeCount: number; wins: number; losses: number; biggestWin: number; openPositionCount: number; verified: boolean; status: 'live' | 'flat' | 'unavailable' };
export type LeaderboardPayload = { season: { name: string; status: 'forming' | 'live' | 'complete'; accountType: 'simulated'; refreshSeconds: number; endsAt: string | null }; standings: Standing[]; updatedAt: string };
export function rehearsalFeed(): LeaderboardPayload {
  return { season: { name: 'Battle rehearsal', status: 'forming', accountType: 'simulated', refreshSeconds: 15, endsAt: null }, updatedAt: new Date().toISOString(), standings: [1240,980,725,410,180,-95,-240,-480].map((pnl,i)=>({id:`demo-${i+1}`,name:`Trader ${String(i+1).padStart(2,'0')}`,rank:i+1,dashboardUrl:'',startingBalance:50000,balance:50000+pnl,equity:50000+pnl,pnl,returnPct:pnl/500,tradeCount:12-i,wins:7-Math.floor(i/2),losses:5-Math.ceil(i/2),biggestWin:320,openPositionCount:i%2,verified:false,status:i%2?'live':'flat'})) };
}
export function useTradeHouseFeed(demo = false) {
  const [data,setData] = useState<LeaderboardPayload|null>(demo ? rehearsalFeed() : null);
  const [state,setState] = useState<'loading'|'fresh'|'stale'|'demo'>(demo?'demo':'loading');
  useEffect(()=>{
    if(demo){setData(rehearsalFeed());setState('demo');return;}
    let active=true; let timer: ReturnType<typeof setTimeout>; let controller: AbortController;
    setData(null); setState('loading');
    const load=async()=>{
      controller=new AbortController(); const timeout=setTimeout(()=>controller.abort(),10000);
      try {
        const response=await fetch('/api/tradehouse/leaderboard',{cache:'no-store',signal:controller.signal});
        if(!response.ok) throw new Error('Feed unavailable');
        const next=await response.json();
        if(!Array.isArray(next.standings)||!next.season||!Number.isFinite(Date.parse(next.updatedAt))) throw new Error('Invalid feed');
        if(active){setData(next);setState(Date.now()-Date.parse(next.updatedAt)>45000?'stale':'fresh');}
      } catch {if(active)setState('stale');}
      finally {clearTimeout(timeout);if(active)timer=setTimeout(load,15000);}
    };load();return()=>{active=false;clearTimeout(timer);controller?.abort();};
  },[demo]);
  return {data,state};
}
