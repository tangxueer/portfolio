import { useEffect, useRef } from 'react'
import { Renderer, Program, Mesh, Triangle, Vec2 } from 'ogl'

/**
 * LineWaves —— 参考 React Bits line-waves 的 WebGL 波浪线背景
 * 鼠标经过处波浪缓慢流动（相位推进 + 涟漪荡开），远离处回归缓慢呼吸。
 * 纯 ogl 实现，无运行时网络请求，离线可用。
 */

const VERT = /* glsl */ `
attribute vec2 uv;
attribute vec2 position;
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = vec4(position, 0.0, 1.0);
}
`

const FRAG = /* glsl */ `
precision highp float;
uniform vec2 uRes;
uniform float uTime;
uniform vec2 uMouse;
uniform float uMouseActive;
uniform float uSpeed;
uniform float uInner;
uniform float uOuter;
uniform float uWarp;
uniform float uRotation;
uniform float uFade;
uniform float uCycle;
uniform float uBrightness;
uniform vec3 uColor1;
uniform vec3 uColor2;
uniform vec3 uColor3;
uniform float uMouseInfluence;

mat2 rot(float a) { float c = cos(a), s = sin(a); return mat2(c, -s, s, c); }
float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123); }
float noise(vec2 p) {
  vec2 i = floor(p), f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x),
             mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x), u.y);
}

void main() {
  vec2 uv = gl_FragCoord.xy / uRes;
  vec2 asp = vec2(uRes.x / uRes.y, 1.0);
  vec2 p = (uv - 0.5) * asp;
  float a = radians(uRotation);
  vec2 pr = rot(a) * p;

  float t = uTime * uSpeed;

  // 鼠标场：高斯衰减，半径随 uMouseInfluence 缩放
  vec2 m = rot(a) * ((uMouse - 0.5) * asp);
  float md = length(pr - m);
  float influence = max(uMouseInfluence, 0.05);
  float boost = uMouseActive * exp(-(md * md) / (influence * influence * 0.55));

  // 缓慢流动（极微弱）：鼠标附近轻微相位推进 + 极轻涟漪（幅度已升 30%）
  float flow = boost * 0.058;
  float ripple = sin(md * 9.0 - t * 1.6) * boost * 0.013;

  // 域扭曲（domain warp，幅度已调低）
  vec2 q = pr;
  float w1 = noise(q * 2.2 + vec2(t * 0.35, -t * 0.28));
  float w2 = noise(q * 3.1 + vec2(-t * 0.22, t * 0.4) + w1);
  q += uWarp * 0.12 * vec2(w1 - 0.5, w2 - 0.5);
  q.y += ripple;

  // 线密度：与背景静态海洋图的波纹密度一致（整屏约 34 条）
  float r = length(p);
  float density = mix(uInner, uOuter, smoothstep(0.05, 0.8, r));
  float coord = q.y * density * 0.65;
  float wave = sin(q.x * 5.0 + t * 2.0 + noise(q * 1.6 + t * 0.12) * 3.2) * (0.05 + flow * 0.025);
  float dLine = abs(fract(coord + wave) - 0.5);
  float line = smoothstep(0.18, 0.03, dLine);

  // 三色缓慢循环
  vec3 col = mix(uColor1, uColor2, 0.5 + 0.5 * sin(uCycle * t * 0.5 + r * 2.5));
  col = mix(col, uColor3, 0.5 + 0.5 * cos(uCycle * t * 0.35 + q.y * 1.8));

  float alpha = line * clamp(uBrightness * 0.63 * (0.6 + boost * 0.31), 0.0, 1.0);
  if (uFade > 0.0) {
    vec2 e = abs(uv - 0.5) * 2.0;
    float fade = 1.0 - smoothstep(1.0 - uFade, 1.0, max(e.x, e.y));
    alpha *= fade;
  }
  gl_FragColor = vec4(col * alpha, alpha); // premultiplied 输出
}
`

const hexToRgb = (hex) => {
  const h = hex.replace('#', '')
  const n = parseInt(h.length === 3 ? h.split('').map((c) => c + c).join('') : h, 16)
  return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255]
}

export default function LineWaves({
  speed = 0.039,
  innerLineCount = 48,
  outerLineCount = 56,
  warpIntensity = 1.0,
  rotation = 0,
  edgeFadeWidth = 0.0,
  colorCycleSpeed = 1.0,
  brightness = 0.2,
  color1 = '#ffffff',
  color2 = '#ffffff',
  color3 = '#ffffff',
  enableMouseInteraction = true,
  mouseInfluence = 2.0,
  className = '',
}) {
  const holderRef = useRef(null)

  useEffect(() => {
    const holder = holderRef.current
    if (!holder) return
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduced) return // 减少动画：仅显示静态纹理层

    const canvas = document.createElement('canvas')
    canvas.className = 'lw-canvas'
    holder.appendChild(canvas)

    const renderer = new Renderer({
      canvas,
      alpha: true,
      antialias: false,
      dpr: Math.min(window.devicePixelRatio || 1, 1.5),
    })
    const gl = renderer.gl
    const geometry = new Triangle(gl)
    const program = new Program(gl, {
      vertex: VERT,
      fragment: FRAG,
      uniforms: {
        uRes: { value: new Vec2(1, 1) },
        uTime: { value: 0 },
        uMouse: { value: new Vec2(0.5, 0.5) },
        uMouseActive: { value: 0 },
        uSpeed: { value: speed },
        uInner: { value: innerLineCount },
        uOuter: { value: outerLineCount },
        uWarp: { value: warpIntensity },
        uRotation: { value: rotation },
        uFade: { value: edgeFadeWidth },
        uCycle: { value: colorCycleSpeed },
        uBrightness: { value: brightness },
        uColor1: { value: hexToRgb(color1) },
        uColor2: { value: hexToRgb(color2) },
        uColor3: { value: hexToRgb(color3) },
        uMouseInfluence: { value: mouseInfluence },
      },
    })
    const mesh = new Mesh(gl, { geometry, program })

    const resize = () => {
      const w = holder.clientWidth || window.innerWidth
      const h = holder.clientHeight || window.innerHeight
      renderer.setSize(w, h)
      program.uniforms.uRes.value.set(gl.canvas.width, gl.canvas.height)
    }
    resize()
    window.addEventListener('resize', resize)

    // 鼠标：目标值 + lerp 平滑，产生"缓慢流动"的跟随感
    const mouse = { x: 0.5, y: 0.5, tx: 0.5, ty: 0.5, active: 0, tActive: 0 }
    const onMove = (e) => {
      mouse.tx = e.clientX / window.innerWidth
      mouse.ty = 1 - e.clientY / window.innerHeight
      mouse.tActive = 1
    }
    const onLeave = () => { mouse.tActive = 0 }
    if (enableMouseInteraction) {
      window.addEventListener('mousemove', onMove, { passive: true })
      document.documentElement.addEventListener('mouseleave', onLeave)
    }

    let raf = 0
    let last = performance.now()
    let time = 0
    const loop = (now) => {
      raf = requestAnimationFrame(loop)
      if (document.hidden) { last = now; return }
      const dt = Math.min((now - last) / 1000, 0.05)
      last = now
      time += dt
      const k = 1 - Math.pow(0.0015, dt) // 帧率无关的平滑系数
      mouse.x += (mouse.tx - mouse.x) * k
      mouse.y += (mouse.ty - mouse.y) * k
      mouse.active += (mouse.tActive - mouse.active) * Math.min(1, dt * 2.2)
      program.uniforms.uTime.value = time
      program.uniforms.uMouse.value.set(mouse.x, mouse.y)
      program.uniforms.uMouseActive.value = mouse.active
      renderer.render({ scene: mesh })
    }
    raf = requestAnimationFrame(loop)

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', resize)
      if (enableMouseInteraction) {
        window.removeEventListener('mousemove', onMove)
        document.documentElement.removeEventListener('mouseleave', onLeave)
      }
      gl.getExtension('WEBGL_lose_context')?.loseContext()
      canvas.remove()
    }
  }, [speed, innerLineCount, outerLineCount, warpIntensity, rotation, edgeFadeWidth,
      colorCycleSpeed, brightness, color1, color2, color3, enableMouseInteraction, mouseInfluence])

  return <div ref={holderRef} className={`lw-holder ${className}`} aria-hidden="true" />
}
