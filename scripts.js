class AWaves extends HTMLElement {
  connectedCallback() {
    this.svg = this.querySelector('svg')
    this.mouse = {
      x: 0,
      y: 0,
      lx: 0,
      ly: 0,
      sx: 0,
      sy: 0,
      v: 0,
      vs: 0,
      a: 0,
    }
    this.lines = []
    this.paths = []
    this.waveTime = 0 // 波纹时间跟踪

    this.bindEvents()
    this.setSize()
    this.setLines()

    requestAnimationFrame(this.tick.bind(this))
  }
  bindEvents() {
    window.addEventListener('resize', () => {
      this.setSize()
      this.setLines()
    })
    window.addEventListener('mousemove', (e) => {
      this.updateMousePosition(e.pageX, e.pageY)
    })
    this.addEventListener('touchmove', (e) => {
      e.preventDefault()
      this.updateMousePosition(e.touches[0].clientX, e.touches[0].clientY)
    })
  }
  setSize() {
    this.bounding = this.getBoundingClientRect()
    this.svg.style.width = `${this.bounding.width}px`
    this.svg.style.height = `${this.bounding.height}px`
  }
  setLines() {
    const { width, height } = this.bounding

    this.lines = []
    this.paths.forEach((path) => {
      path.remove()
    })
    this.paths = []

    const xGap = 10
    const yGap = 32

    const oWidth = width + 200
    const oHeight = height + 30

    const totalLines = Math.ceil(oWidth / xGap)
    const totalPoints = Math.ceil(oHeight / yGap)

    const xStart = (width - xGap * totalLines) / 2
    const yStart = (height - yGap * totalPoints) / 2

    for (let i = 0; i <= totalLines; i++) {
      const points = []
      for (let j = 0; j <= totalPoints; j++) {
        // 组合效果：波浪 + 随机扰动
        const waveAmplitude = 90  // 波浪振幅
        const waveFrequency = 0.015  // 波浪频率
        const randomFactor = 70  // 随机扰动强度

        const waveX = Math.sin(j * waveFrequency + i * 0.3) * waveAmplitude
        const waveY = Math.cos(i * waveFrequency + j * 0.2) * waveAmplitude * 0.7
        const randomX = (Math.random() - 0.5) * randomFactor
        const randomY = (Math.random() - 0.5) * randomFactor

        const initialX = waveX + randomX
        const initialY = waveY + randomY

        const point = {
          x: xStart + xGap * i,
          y: yStart + yGap * j,
          cursor: { x: initialX, y: initialY, vx: 0, vy: 0 },
        }
        points.push(point)
      }
      this.lines.push(points)

      const path = document.createElementNS('http://www.w3.org/2000/svg', 'path')
      this.svg.appendChild(path)
      this.paths.push(path)
    }
  }
  updateMousePosition(x, y) {
    const { mouse } = this
    mouse.x = x - this.bounding.left
    mouse.y = y - this.bounding.top + window.scrollY
  }
  movePoints(time) {
    const { lines, mouse } = this
    const { width, height } = this.bounding

    // 更新波纹时间
    this.waveTime += 0.02

    // 屏幕中心坐标
    const centerX = width / 2
    const centerY = height / 2

    // 波纹参数
    const waveSpeed = 0.3 // 波纹扩散速度
    const waveAmplitude = 20 // 波纹振幅
    const waveFrequency = 0.03 // 波纹频率

    lines.forEach((points) => {
      points.forEach((p, i) => {
        const dx = p.x - mouse.sx
        const dy = p.y - mouse.sy
        const d = Math.hypot(dx, dy)
        const l = Math.max(175, mouse.vs)

        if (d < l) {
          const f = 1 - d / l
          p.cursor.vx += Math.cos(mouse.a) * f * mouse.vs * 0.08
          p.cursor.vy += Math.sin(mouse.a) * f * mouse.vs * 0.08
        }

        // 从中心向外扩散的波纹效果
        const distanceToCenter = Math.hypot(p.x - centerX, p.y - centerY)
        const waveOffset = (distanceToCenter * waveFrequency) - (this.waveTime * waveSpeed)
        const waveEffect = Math.sin(waveOffset) * waveAmplitude

        // 计算波纹方向（从中心向外）
        const waveDirX = (p.x - centerX) / distanceToCenter || 0
        const waveDirY = (p.y - centerY) / distanceToCenter || 0

        // 添加微动画效果（轻微的呼吸感）
        const breatheAmount = 0.5
        const breatheSpeed = 0.005
        const breatheX = Math.sin(time * breatheSpeed + p.x * 0.01) * breatheAmount
        const breatheY = Math.cos(time * breatheSpeed + p.y * 0.01) * breatheAmount

        // 组合效果：波纹 + 呼吸 + 回归原始位置
        p.cursor.vx += (0 - p.cursor.x + breatheX + waveDirX * waveEffect) * 0.005
        p.cursor.vy += (0 - p.cursor.y + breatheY + waveDirY * waveEffect) * 0.005

        p.cursor.vx *= 0.925
        p.cursor.vy *= 0.925

        p.cursor.x += p.cursor.vx * 2
        p.cursor.y += p.cursor.vy * 2

        p.cursor.x = Math.min(100, Math.max(-100, p.cursor.x))
        p.cursor.y = Math.min(100, Math.max(-100, p.cursor.y))
      })
    })
  }
  moved(point, withCursorForce = true) {
    const coords = {
      x: point.x + (withCursorForce ? point.cursor.x : 0),
      y: point.y + (withCursorForce ? point.cursor.y : 0),
    }

    coords.x = Math.round(coords.x * 10) / 10
    coords.y = Math.round(coords.y * 10) / 10

    return coords
  }
  drawLines() {
    const { lines, moved, paths } = this

    lines.forEach((points, lIndex) => {
      let p1 = moved(points[0], false)
      let d = `M ${p1.x} ${p1.y}`

      points.forEach((p, pIndex) => {
        const isLast = pIndex === points.length - 1
        p = moved(p, !isLast)
        d += `L ${p.x} ${p.y}`
      })

      paths[lIndex].setAttribute('d', d)
    })
  }
  tick(time) {
    const { mouse } = this

    mouse.sx += (mouse.x - mouse.sx) * 0.1
    mouse.sy += (mouse.y - mouse.sy) * 0.1

    const dx = mouse.x - mouse.lx
    const dy = mouse.y - mouse.ly
    const d = Math.hypot(dx, dy)

    mouse.v = d
    mouse.vs += (d - mouse.vs) * 0.1
    mouse.vs = Math.min(100, mouse.vs)

    mouse.lx = mouse.x
    mouse.ly = mouse.y

    mouse.a = Math.atan2(dy, dx)

    this.movePoints(time)
    this.drawLines()

    requestAnimationFrame(this.tick.bind(this))
  }
}

customElements.define('a-waves', AWaves)

window.addEventListener('scroll', function () {
  const navbar = document.querySelector('.top-navbar');
  if (window.scrollY > 50) {
    navbar.classList.add('scrolled');
  } else {
    navbar.classList.remove('scrolled');
  }
});

// 横向滑动模块脚本
document.addEventListener('DOMContentLoaded', function () {
  // 初始化Lenis实现平滑滚动
  const lenis = new Lenis({
    duration: 1,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    smoothWheel: true,
    autoRaf: true,
  });

  // 横向滑动逻辑
  const scrollbox = {
    wapper: document.querySelector(".wapper"),
    cardsbox: document.querySelector(".cardsbox"),
    distance: 0,
    if_leave: false,

    init() {
      this.resize();
      window.addEventListener("resize", this.resize.bind(this));
      this.create_scrolltrigger();
    },

    create_scrolltrigger() {
      ScrollTrigger.create({
        trigger: this.wapper,
        start: "top top",
        end: "bottom bottom",
        onUpdate: (self) => {
          this.cardsbox.style.transform = `translateX(-${self.progress * this.distance}px)`;
        },
        onLeave: () => {
          this.if_leave = true;
        },
        onEnterBack: () => {
          this.if_leave = false;
        }
      });
    },

    resize() {
      this.distance = this.cardsbox.offsetWidth - innerWidth;
      this.wapper.style.height = `${this.distance}px`;
      if (this.if_leave) {
        this.cardsbox.style.transform = `translateX(-${this.distance}px)`;
      }
    }
  };

  // 初始化横向滑动
  scrollbox.init();
});