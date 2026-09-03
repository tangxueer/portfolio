import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js'

/**
 * 3D 钻石项目导航
 * 中央：金属材质八面体钻石；三轴六向：
 *   X+ 纵向 落地实施 / X- 横向 破圈拓维
 *   Y+ 宏观 总体统筹 / Y- 微观 方案创作
 *   Z+ 深度 深度研究 / Z- 广度 技术赋能
 * 鼠标拖拽旋转视角；点击标签滚动到对应标签页 section
 */
export default function Diamond({ onNavigate }) {
  const mountRef = useRef(null)
  const labelRefs = useRef({})

  useEffect(() => {
    const mount = mountRef.current
    if (!mount) return

    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(42, mount.clientWidth / mount.clientHeight, 0.1, 100)
    camera.position.set(3.4, 1.7, 4.8)

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.setSize(mount.clientWidth, mount.clientHeight)
    mount.appendChild(renderer.domElement)

    // ---- 灯光 + 环境贴图（金属反射关键） ----
    const pmrem = new THREE.PMREMGenerator(renderer)
    const envTex = pmrem.fromScene(new RoomEnvironment(), 0.04).texture
    scene.environment = envTex
    scene.add(new THREE.AmbientLight(0xbcd4ff, 0.4))
    const key = new THREE.DirectionalLight(0xffffff, 1.6)
    key.position.set(4, 6, 3)
    scene.add(key)
    const rim = new THREE.DirectionalLight(0x2f7dff, 1.1)
    rim.position.set(-5, -2, -4)
    scene.add(rim)
    // 钻石火彩用强点光源：暖光 + 冷光 + 品红光，色散会把它们折射成棱面彩虹
    const warm = new THREE.PointLight(0xffe6c2, 55, 0, 2)
    warm.position.set(2.8, 1.4, 2.6)
    scene.add(warm)
    const cool = new THREE.PointLight(0x88d4ff, 42, 0, 2)
    cool.position.set(-3.2, -0.8, 2.2)
    scene.add(cool)
    const accent = new THREE.PointLight(0xff7ad9, 32, 0, 2)
    accent.position.set(0, 2.2, -2.4)
    scene.add(accent)

    // ---- 钻石：上下两个锥体组合（sharplink 晶体感） ----
    const diamondGroup = new THREE.Group()
    // 钻石材质：透明晶体（非金属）+ 真实折射率 2.42 + 色散火彩 + 抛光棱面
    const material = new THREE.MeshPhysicalMaterial({
      color: 0xffffff,
      metalness: 0,           // 钻石是介电质，不是金属
      roughness: 0.02,        // 抛光镜面
      transmission: 0.85,     // 透射稍降 → 保留更多棱面反射，璀璨而不"烟熏"
      thickness: 1.4,
      ior: 2.42,              // 钻石真实折射率
      dispersion: 8,          // 色散 → 棱面彩虹火彩
      envMapIntensity: 3.5,   // 加强环境反射
      specularColor: 0xffffff,
      specularIntensity: 1.3, // 强镜面高光，棱面更亮
      clearcoat: 1,           // 表面清漆层 → 额外光泽
      clearcoatRoughness: 0,
      iridescence: 0.55,      // 棱面虹彩
      iridescenceIOR: 1.5,
      flatShading: true,      // 保留锋利棱面
      transparent: true,
      attenuationColor: 0xeef6ff,  // 极淡冷白体色
      attenuationDistance: 2.5,
    })
    // 用八面体拉伸近似钻石晶体
    const gem = new THREE.Mesh(new THREE.OctahedronGeometry(0.92, 0), material)
    gem.scale.set(1, 1.5, 1)
    diamondGroup.add(gem)

    // 内核线框
    const wire = new THREE.LineSegments(
      new THREE.EdgesGeometry(new THREE.OctahedronGeometry(0.92, 0)),
      new THREE.LineBasicMaterial({ color: 0x8fb8ff, transparent: true, opacity: 0.5 }),
    )
    wire.scale.set(1, 1.5, 1)
    diamondGroup.add(wire)

    // 外层线框盒（sharplink 风格的装饰线框）
    const boxWire = new THREE.LineSegments(
      new THREE.EdgesGeometry(new THREE.BoxGeometry(2.1, 3.2, 2.1)),
      new THREE.LineBasicMaterial({ color: 0x4a7fd4, transparent: true, opacity: 0.22 }),
    )
    diamondGroup.add(boxWire)

    scene.add(diamondGroup)

    // ---- 坐标轴 ----
    const axisLen = 1.9
    const axisMat = new THREE.LineBasicMaterial({ color: 0xeaf2fb, transparent: true, opacity: 0.55 })
    const axesGroup = new THREE.Group()

    const makeAxis = (dir, len) => {
      const geo = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(0, 0, 0), dir.clone().multiplyScalar(len)])
      return new THREE.Line(geo, axisMat)
    }
    const axisX = makeAxis(new THREE.Vector3(1, 0, 0), axisLen)
    const axisXn = makeAxis(new THREE.Vector3(-1, 0, 0), axisLen)
    const axisY = makeAxis(new THREE.Vector3(0, 1, 0), axisLen)
    const axisYn = makeAxis(new THREE.Vector3(0, -1, 0), axisLen)
    const axisZ = makeAxis(new THREE.Vector3(0, 0, 1), axisLen)
    const axisZn = makeAxis(new THREE.Vector3(0, 0, -1), axisLen)
    axesGroup.add(axisX, axisXn, axisY, axisYn, axisZ, axisZn)

    // 轴端小节点
    const nodeGeo = new THREE.SphereGeometry(0.035, 12, 12)
    const nodeMat = new THREE.MeshBasicMaterial({ color: 0xeaf2fb })
    ;[
      [axisLen, 0, 0], [-axisLen, 0, 0],
      [0, axisLen, 0], [0, -axisLen, 0],
      [0, 0, axisLen], [0, 0, -axisLen],
    ].forEach((p) => {
      const n = new THREE.Mesh(nodeGeo, nodeMat)
      n.position.set(...p)
      axesGroup.add(n)
    })
    scene.add(axesGroup)

    // ---- 交互：拖拽旋转（带惯性） ----
    const controls = new OrbitControls(camera, renderer.domElement)
    controls.target.set(0, 0.22, 0)
    controls.enableDamping = true
    controls.dampingFactor = 0.06
    controls.enablePan = false
    controls.enableZoom = false
    controls.autoRotate = true
    controls.autoRotateSpeed = 0.7
    // 拖拽时停止自动旋转
    controls.addEventListener('start', () => { controls.autoRotate = false })
    controls.addEventListener('end', () => { controls.autoRotate = true })

    // ---- 标签 3D 锚点 → 屏幕投影 ----
    // 三轴六向：X 横向/纵向；Y 宏观/微观；Z 深度/广度
    const anchors = {
      macro:      new THREE.Vector3(0, axisLen + 0.34, 0),            // Y+ 宏观（顶部）
      micro:      new THREE.Vector3(0, -axisLen - 0.34, 0),           // Y- 微观（底部）
      vertical:   new THREE.Vector3(axisLen + 0.28, 0, 0),            // X+ 纵向（右侧）
      horizontal: new THREE.Vector3(-axisLen - 0.28, 0, 0),           // X- 横向（左侧）
      depth:      new THREE.Vector3(0, 0, axisLen + 0.34),            // Z+ 深度（朝向相机）
      width:      new THREE.Vector3(0, 0, -axisLen - 0.34),           // Z- 广度（背向相机）
    }
    const proj = new THREE.Vector3()

    const updateLabels = () => {
      const w = mount.clientWidth
      const h = mount.clientHeight
      Object.entries(anchors).forEach(([key, v]) => {
        proj.copy(v).project(camera)
        const el = labelRefs.current[key]
        if (!el) return
        const behind = proj.z > 1
        el.style.left = `${(proj.x * 0.5 + 0.5) * 100}%`
        el.style.top = `${(-proj.y * 0.5 + 0.5) * 100}%`
        el.style.opacity = behind ? 0 : 1
        el.style.pointerEvents = behind ? 'none' : 'auto'
      })
    }

    // ---- 渲染循环 ----
    let raf
    const clock = new THREE.Clock()
    const tick = () => {
      const t = clock.getElapsedTime()
      gem.rotation.y = t * 0.18
      wire.rotation.y = t * 0.18
      diamondGroup.position.y = Math.sin(t * 0.8) * 0.06
      controls.update()
      renderer.render(scene, camera)
      updateLabels()
      raf = requestAnimationFrame(tick)
    }
    tick()

    const onResize = () => {
      if (!mount.clientWidth) return
      camera.aspect = mount.clientWidth / mount.clientHeight
      camera.updateProjectionMatrix()
      renderer.setSize(mount.clientWidth, mount.clientHeight)
    }
    window.addEventListener('resize', onResize)

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', onResize)
      controls.dispose()
      envTex.dispose()
      pmrem.dispose()
      renderer.dispose()
      scene.traverse((obj) => {
        if (obj.geometry) obj.geometry.dispose()
        if (obj.material) obj.material.dispose()
      })
      if (renderer.domElement.parentNode === mount) mount.removeChild(renderer.domElement)
    }
  }, [])

  const labels = [
    { key: 'macro',      zh: '宏观-总体统筹', en: 'MACRO',      target: 'macro' },
    { key: 'micro',      zh: '微观-方案创作', en: 'MICRO',      target: 'micro' },
    { key: 'vertical',   zh: '纵向-落地实施', en: 'VERTICAL',   target: 'vertical' },
    { key: 'horizontal', zh: '横向-破圈拓维', en: 'HORIZONTAL', target: 'horizontal' },
    { key: 'depth',      zh: '深度-深度研究', en: 'DEPTH',      target: 'research' },
    { key: 'width',      zh: '广度-技术赋能', en: 'WIDTH',      target: 'skills' },
  ]

  const handleClick = (target, disabled) => {
    if (disabled) return
    onNavigate?.(target)
  }

  return (
    <div className="diamond-stage" ref={mountRef}>
      {labels.map((l) => (
        <button
          key={l.key}
          ref={(el) => (labelRefs.current[l.key] = el)}
          className={`axis-label ${l.disabled ? 'disabled' : ''}`}
          onClick={() => handleClick(l.target, l.disabled)}
          aria-label={`跳转到${l.zh}标签页`}
        >
          <span className="tag">{l.zh}{l.disabled ? '' : ' →'}</span>
          <span className="en">{l.en}</span>
        </button>
      ))}
      <p className="diamond-hint">拖拽旋转视角 · 点击维度标签进入对应项目</p>
    </div>
  )
}
