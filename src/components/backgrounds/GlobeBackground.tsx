import { useEffect, useMemo, useState } from 'react';
import { useReducedAnimation } from '@/hooks/useReducedAnimation';
import Globe from './Globe';
import ParticleWaveBackground from './ParticleWaveBackground';
import { useTheme } from '@/hooks/useTheme';

export default function GlobeBackground() {
  const { reduced }=useReducedAnimation();
  const { theme } = useTheme();
  const [paused,setPaused]=useState(document.hidden);
  useEffect(()=>{const update=()=>setPaused(document.hidden);document.addEventListener('visibilitychange',update);return()=>document.removeEventListener('visibilitychange',update)},[]);
  const dots=useMemo(()=>({color:'#ffffff',size:3,density:7,allDots:false}),[]);
  const markerConfig=useMemo(()=>({markers:[],color:'#ffffff',size:0}),[]);
  if (theme === 'dark') return <ParticleWaveBackground />;
  return <div className="globe-background" aria-hidden="true">
    <div className={`globe-color-light ${paused||reduced?'light-paused':''}`} />
    <div className="globe-scene"><Globe speed={paused||reduced?0:.7} scale={8} dots={dots} markerConfig={markerConfig}
      outlineColor="#66e0c895" oceanColor="#08080b30" showGrid={true} graticuleColor="#a675ec48"
      showOutline={true} outlineWidth={.4} smoothing={8} initialLongitude={-15} initialLatitude={16} stopOnHover={false}/></div>
    <div className={`globe-hands-layer ${paused||reduced?'hands-paused':''}`}>
      <img className="globe-hands hand-left" src="/globe-hands-points.png" alt=""/>
      <img className="globe-hands hand-right" src="/globe-hands-points.png" alt=""/>
    </div>
  </div>;
}
