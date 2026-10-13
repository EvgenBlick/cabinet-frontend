import { useEffect, useRef } from 'react';
import { useReducedAnimation } from '@/hooks/useReducedAnimation';
import { WebGLRenderer, Scene, PerspectiveCamera, ShaderMaterial, TetrahedronGeometry, InstancedBufferAttribute, InstancedMesh, Vector2 } from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';

export default function ParticleWaveBackground() {
  const host = useRef<HTMLDivElement>(null);
  const { reduced } = useReducedAnimation();
  useEffect(() => {
    const target = host.current;
    if (!target) return;
    let renderer: WebGLRenderer;
    try { renderer = new WebGLRenderer({ alpha: true, antialias: false, powerPreference: 'low-power' }); } catch { return; }
    renderer.setPixelRatio(Math.min(devicePixelRatio, 1.5));
    target.appendChild(renderer.domElement);
    const scene = new Scene();
    const camera = new PerspectiveCamera(60, 1, .1, 1000);
    camera.position.z = 100;
    const geometry = new TetrahedronGeometry(.25);
    geometry.setAttribute('aIndex', new InstancedBufferAttribute(Float32Array.from({length:20000}, (_,i)=>i),1));
    const material = new ShaderMaterial({ uniforms:{uTime:{value:0}},
      vertexShader:`uniform float uTime;attribute float aIndex;varying vec3 vColor;
      vec3 hsl(float h,float s,float l){vec3 rgb=clamp(abs(mod(h*6.+vec3(0.,4.,2.),6.)-3.)-1.,0.,1.);return l+s*(rgb-.5)*(1.-abs(2.*l-1.));}
      void main(){float band=mod(aIndex,3.);float spread=sin(aIndex*2.399963229728653*1.7)*.5+.5;
      float x=(aIndex/20000.-.5)*240.;float phase=x*.032+uTime*.35+band*1.3;float pulse=.5+.5*sin(uTime*.7);
      float y=sin(phase)*(13.+pulse*6.)+sin(x*.085+uTime*.23+band)*7.+(16.+spread*44.)*(spread-.5);
      float z=(band-1.)*17.+sin(phase*.7)*8.;vColor=hsl(band>1.5?.74:.45+band*.055,.65+pulse*.18,.16+spread*.25+pulse*.08);
      gl_Position=projectionMatrix*modelViewMatrix*vec4(position+vec3(x,y,z),1.);}`,
      fragmentShader:`varying vec3 vColor;void main(){gl_FragColor=vec4(vColor,1.);}` });
    const swarm = new InstancedMesh(geometry, material, 20000);
    swarm.frustumCulled=false;scene.add(swarm);
    const composer = new EffectComposer(renderer);
    composer.addPass(new RenderPass(scene,camera));
    const bloom = new UnrealBloomPass(new Vector2(1,1),1.8,.4,0);
    composer.addPass(bloom);
    let frame=0, previous=0, time=0;
    const draw = (now:number) => {
      frame=0;
      if (document.hidden) { previous=0;return; }
      if(previous && !reduced) time+=Math.min((now-previous)/1000,.05)*.22;
      previous=now;material.uniforms.uTime.value=time;swarm.rotation.y=time*.03;
      composer.render();
      if(!reduced) frame=requestAnimationFrame(draw);
    };
    const resize=()=>{const width=target.clientWidth,height=target.clientHeight;if(!width||!height)return;
      camera.aspect=width/height;camera.updateProjectionMatrix();renderer.setSize(width,height);composer.setSize(width,height);
      if(!frame)frame=requestAnimationFrame(draw);};
    const visibility=()=>{cancelAnimationFrame(frame);frame=0;previous=0;if(!document.hidden)frame=requestAnimationFrame(draw);};
    window.addEventListener('resize',resize);document.addEventListener('visibilitychange',visibility);resize();
    return()=>{cancelAnimationFrame(frame);window.removeEventListener('resize',resize);document.removeEventListener('visibilitychange',visibility);
      bloom.dispose();composer.dispose();geometry.dispose();material.dispose();renderer.dispose();renderer.domElement.remove();};
  },[reduced]);
  return <div ref={host} className="particle-wave-background" aria-hidden="true" />;
}
