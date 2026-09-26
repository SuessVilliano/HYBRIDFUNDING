import React, { useEffect, useState } from 'react';
import { useSearch } from 'wouter';
import { useTradeHouseFeed, type Standing } from '@/lib/tradehouse-feed';
import './tradehouse-stage.css';
const cash=(n:number)=>new Intl.NumberFormat('en-US',{style:'currency',currency:'USD',maximumFractionDigits:0}).format(n);
export default function TradeHouseStage(){
  const qs=new URLSearchParams(useSearch()); const demo=qs.get('demo')==='1';
  const layout=qs.get('layout')||'duel'; const overlay=qs.get('overlay')==='1';
  const {data,state}=useTradeHouseFeed(demo); const [size,setSize]=useState({w:window.innerWidth,h:window.innerHeight});
  useEffect(()=>{const resize=()=>setSize({w:window.innerWidth,h:window.innerHeight});window.addEventListener('resize',resize);return()=>window.removeEventListener('resize',resize);},[]);
  useEffect(()=>{if(!overlay)return;const b=document.body.style.background;const h=document.documentElement.style.background;document.body.style.background='transparent';document.documentElement.style.background='transparent';return()=>{document.body.style.background=b;document.documentElement.style.background=h;};},[overlay]);
  const roster=data?.standings.slice(0,8)||[];
  const select=(id:string|null,fallback:number)=>id?roster.find(t=>t.id===id):roster[fallback];
  const left=select(qs.get('left'),0);const right=qs.get('right')?roster.find(t=>t.id===qs.get('right')&&t.id!==left?.id):roster.find(t=>t.id!==left?.id);
  const seats=[...roster].sort((a,b)=>a.id.localeCompare(b.id));
  const selected=layout==='grid'?Array.from({length:8},(_,i)=>seats[i]):[left,right];
  const valid=(t?:Standing)=>!!t && state!=='stale' && (demo || (t.verified&&t.status!=='unavailable'));
  const label=demo?'REHEARSAL · SAMPLE DATA':state==='stale'?'DATA INTERRUPTED':!roster.length?'AWAITING ROSTER':data?.season.status==='live'?'LIVE STANDINGS':(data?.season.status||'CONNECTING').toUpperCase();
  const scale=Math.min(size.w/1920,size.h/1080);
  return <main className={`th-stage-shell ${overlay?'th-transparent':''}`} style={{height:size.h}}>
    <div className={`th-stage ${overlay?'th-overlay':''}`} style={{transform:`scale(${scale})`,left:(size.w-1920*scale)/2,top:(size.h-1080*scale)/2}}>
      <header className="th-mast"><div className="th-brand">HYBRID<span>FUNDING</span></div><div className="th-title">TRADE HOUSE<span>THE TRADING ARENA</span></div><div className={`th-status ${demo?'th-demo':''}`}>{label}</div></header>
      {layout==='break'?<section className="th-break"><span>HYBRID FUNDING PRESENTS</span><h1>BACK IN<br/><em>THE ARENA SOON.</em></h1><p>Trade House · Simulated competition accounts</p></section>:<>
      <section className={`th-floor ${layout==='grid'?'th-grid':'th-duel'}`}>
        {selected.map((trader,i)=><article key={trader?.id||i} className={`th-seat th-seat-${i%2}`}>
          <div className="th-seat-head"><span>{layout==='grid'?`SEAT ${String(i+1).padStart(2,'0')}`:i===0?'CHALLENGER A':'CHALLENGER B'}</span><strong>{valid(trader)?`#${trader!.rank}`:'—'}</strong></div>
          <div className="th-camera">{!overlay&&<><span className="th-camera-icon">{String(i+1).padStart(2,'0')}</span><span>CAMERA / TRADING SCREEN</span><small>{demo?'Rehearsal slot · add video in OBS':'Video is supplied by the producer in OBS'}</small></>}</div>
          <div className="th-plate"><div className="th-trader-name">{trader?.name||'Open seat'}<small>{demo?'SAMPLE CONTESTANT':valid(trader)?'DASHBOARD CONNECTED':trader?'DATA UNAVAILABLE':'CONTESTANT NOT ASSIGNED'}</small></div><div className={`th-pnl ${valid(trader)&&trader!.pnl<0?'th-loss':''}`}>{valid(trader)?cash(trader!.pnl):'—'}<small>{valid(trader)?`${trader!.returnPct>=0?'+':''}${trader!.returnPct.toFixed(2)}% RETURN`:'AWAITING VERIFIED DATA'}</small></div></div>
          {layout!=='grid'&&<div className="th-statline"><span>EQUITY <b>{valid(trader)?cash(trader!.equity):'—'}</b></span><span>TRADES <b>{valid(trader)?trader!.tradeCount:'—'}</b></span><span>W / L <b>{valid(trader)?`${trader!.wins} / ${trader!.losses}`:'—'}</b></span><span>POSITIONS <b>{valid(trader)?trader!.openPositionCount:'—'}</b></span></div>}
        </article>)}
        {layout!=='grid'&&<div className="th-vs">VS</div>}
      </section>
      <section className="th-ribbon"><div className="th-ribbon-title">THE HOUSE<br/><strong>STANDINGS</strong></div>{roster.length?roster.map(t=><div className="th-ribbon-trader" key={t.id}><span>{valid(t)?`#${t.rank}`:'—'} {t.name}</span><b className={t.pnl<0?'th-loss':''}>{valid(t)?`${t.returnPct>=0?'+':''}${t.returnPct.toFixed(2)}%`:'—'}</b></div>):<p>Eight seats. Contestant dashboards have not been connected yet.</p>}</section>
      </>}
      <footer className="th-footer"><span>{demo?'DEMO • NOT REAL TRADES OR RESULTS':'SIMULATED COMPETITION ACCOUNTS • RANKED BY RETURN'}</span><span>{state==='stale'?'SCORES HIDDEN UNTIL FEED RECOVERS':data?`FEED ${new Date(data.updatedAt).toLocaleTimeString('en-US')}`:'CONNECTING TO SCOREBOARD'}</span><strong>HYBRIDFUNDING.CO</strong></footer>
    </div>
  </main>;
}
