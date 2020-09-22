class Horn {
    static serialIndex = 0
    static scene = null
    static horns = []

    static template = Handlebars.compile($('template#object-horn').html())

    constructor(id, x, y, tx, ty) {

        this.id = id
        this.selector = {
            'body': `#horn-body-${id}`,
            'shadow': `#horn-shadow-${id}`
        }

        Horn.scene.append(Horn.template(this))

        const d = Math.sqrt(Math.pow(tx - x, 2) + Math.pow((ty - y) * 8, 2))
        const zz = d / 10
        const dd = d / 40000 + 0.6

        ty -= 16

        const body = $(this.selector.body)
        let ww = body.width() / 2
        let hh = body.height() / 2


        this.tl = gsap.timeline({
            onUpdate: Horn.onGsapUpdate,
            onUpdateParams: [ this ],
            onComplete: Horn.onGsapComplete,
            onCompleteParams: [ this ]
        })
        this.tl.set(this.selector.body, { left: x - ww, top: y - hh - 16 }) // 16: ツノ砲の銃口位置
        this.tl.to(this.selector.body, { left: (tx - x) / 2 + x - ww, top: (ty - y) / 2 + y - zz - hh, ease: Power2.easeOut, duration: dd })
        this.tl.to(this.selector.body, { left: tx - ww, top: ty - hh, ease: Power2.easeIn, duration: dd })

        this.tlRotate = gsap.timeline({ repeat: -1 })
        this.tlRotate.to(this.selector.body, { rotation: "+=360", duration: 0.6, ease: Power0 })

        const shadow = $(this.selector.shadow)
        ww = shadow.width() / 2
        hh = shadow.height() / 2


        this.tlShadow = gsap.timeline()
        this.tlShadow.set(this.selector.shadow, { left: x - ww, top: y - hh })
        this.tlShadow.to(this.selector.shadow, { left: (tx - x) / 2 + x - ww, top: (ty - y) / 2 + y - hh, ease: Power2.easeOut, duration: dd })
        this.tlShadow.to(this.selector.shadow, { left: tx - ww, top: ty - hh, ease: Power2.easeIn, duration: dd })

        // 最背面
        $(this.selector.shadow).css('z-index', 1)
    }
    setHit() {
        this.tl.kill()
        this.tlRotate.kill()
        this.tlShadow.kill()

        $(this.selector.shadow).remove()

        this.tl = gsap.timeline({
            onComplete: Horn.onGsapComplete,
            onCompleteParams: [ this ]
        })
        this.tl.to(this.selector.body, { opacity: 1, duration: 0.5 })
        this.tl.to(this.selector.body, {
            x: -FIELD_SIZE_X,
            duration: 0.5,
            ease: Power2.easeOut
        })
    }
    exec() {
        const body = $(this.selector.body)
        const shadow = $(this.selector.shadow)
        const yy = parseInt(shadow.css('top') + shadow.height() / 2)


        // 高さ方向を zとする。
        const xx = body.position().left + body.width() / 2
        const zz = (body.position().top + body.height() / 2)

        // 当たり判定
        const sheeps = Sheep.sheeps.filter(o => {
            if(!o.isWalk()) {
                return false
            }
            const rect = o.getRect()

            // 奥行き方向（影と、羊の足元座標を比較）
            if(Math.abs(yy - rect.y1) > 24) {
                return false
            }
            // 幅・高さ判定
            if( (xx < rect.x0 || rect.x1 < xx)  // 幅
            ||  (zz < rect.y0 || rect.y1 < zz)  // 高さ
            ) {
                return false
            }
            return true
        })
        const sheep = (sheeps.length > 0) ? sheeps[0] : null
        if(!sheep) {
            body.css('z-index', yy)
            return
        }
        body.css('z-index', $(sheep.selector).css('z-index') + 1)

        sheep.setHit()
        this.setHit()
    }


    static canShoot() {
        return Horn.horns.length < 5
    }

    static create(x, y, tx, ty) {
        const o = new Horn(Horn.serialIndex++, x, y, tx, ty)

        Horn.horns.push(o)

        return o
    }

    static initialize(scene) {
        Horn.scene = scene
        Horn.serialIndex = 0
        Horn.horns = []
    }

    static onGsapUpdate(params) {
        const self = params
        self.exec()

    }

    static onGsapComplete(params) {
        const self = params

        $(self.selector.body).remove()
        $(self.selector.shadow).remove()

        Horn.horns = Horn.horns.filter(v => v.id != self.id)
    }
}