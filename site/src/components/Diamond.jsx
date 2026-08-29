import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js'

/**
 * 3D 钻石项目导航
 * 中央：金属材质八面体钻石；三轴：X 横向 / Y 纵向 / Z 上宏观 / Z 下 微观
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

    // ---- 钻石：上下两个锥体组合（sharplink 晶体感） ----
    const diamondGroup = new THREE.Group()
    const material = new THREE.MeshStandardMaterial({
      color: 0xe8eef6,
      metalness: 0.98,
      roughness: 0.12,
      envMapIntensity: 1.6,
      flatShading: true,
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
    const anchors = {
      horizontal: new THREE.Vector3(axisLen + 0.28, 0, 0),   // X 正向：横向
      vertical: new THREE.Vector3(0, 0, axisLen + 0.28),      // Z 正向（朝屏幕外时为纵向）
      macro: new THREE.Vector3(0, axisLen + 0.34, 0),         // Y 上：宏观
      micro: new THREE.Vector3(0, -axisLen - 0.34, 0),        // Y 下：微观
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
    { key: 'macro', zh: '宏观', en: 'MACRO', target: 'macro' },
    { key: 'micro', zh: '微观', en: 'MICRO', target: 'micro', disabled: true },
    { key: 'vertical', zh: '纵向', en: 'VERTICAL', target: 'vertical', disabled: true },
    { key: 'horizontal', zh: '横向', en: 'HORIZONTAL', target: 'horizontal', disabled: true },
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
