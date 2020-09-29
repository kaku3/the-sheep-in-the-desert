const Horn_ = {
    serialIndex: 0,
    scene: null,
    horns: [],

    template: Handlebars.compile($('template#object-horn').html())
}


class Horn {

    constructor(id, x, y, tx, ty) {

        this.id = id
        this.selector = {
            'body': `#horn-body-${id}`,
            'shadow': `#horn-shadow-${id}`
        }

        Horn_.scene.append(Horn_.template(this))

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
        this.tl.to(this.selector.body, {
            keyframes: [
                { left: (tx - x) / 2 + x - ww, top: (ty - y) / 2 + y - zz - hh, duration: dd },
                { left: tx - ww, top: ty - hh, duration: dd }
            ],
            ease: Power1.easeOut
        })
        this.tlRotate = gsap.timeline({ repeat: -1 })
        this.tlRotate.to(this.selector.body, { rotation: "+=360", duration: 0.6, ease: Power0 })

        const shadow = $(this.selector.shadow)
        ww = shadow.width() / 2
        hh = shadow.height() / 2

        this.tlShadow = gsap.timeline()
        this.tlShadow.set(this.selector.shadow, { left: x - ww, top: y - hh })
        this.tlShadow.to(this.selector.shadow, {
            keyframes: [
                { left: (tx - x) / 2 + x - ww, top: (ty - y) / 2 + y - hh, duration: dd },
                { left: tx - ww, top: ty - hh, duration: dd }
            ],
            ease: Power1.easeOut
        })

        // 最背面
        $(this.selector.shadow).css('z-index', 1)
    }
    setHit(score) {
        this.score = score

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
            duration: 0.7,
            ease: Power2.easeOut
        })
    }
    exec() {
        const body = $(this.selector.body)
        const shadow = $(this.selector.shadow)
        const yy = parseInt(shadow.position().top + shadow.height() / 2)


        // 高さ方向を zとする。
        const xx = body.position().left + body.width() / 2
        const zz = (body.position().top + body.height() / 2)

        // 当たり判定
        const sheeps = Sheep.getSheeps().filter(o => {
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
            body.css('z-index', shadow.position().top - 64)
            return
        }

        // score 処理
        const rect = sheep.getRect()
        let score = 100 - Math.sqrt(Math.pow(xx - (rect.x0 + 64), 2) + Math.pow(zz - rect.y0, 2))
        score = Math.max(1, parseInt(score))
        Game.addScore(score)
        ScoreEffect.create(xx, zz, score)

        // hit 処理
        body.css('z-index', $(sheep.selector).css('z-index') + 1)

        sheep.setHit(score)
        this.setHit(score)
    }


    static canShoot() {
        return Horn_.horns.length < 10
    }

    static create(x, y, tx, ty) {
        const o = new Horn(Horn_.serialIndex++, x, y, tx, ty)

        Horn_.horns.push(o)

        return o
    }

    static initialize(scene) {
        Horn_.scene = scene
        Horn_.serialIndex = 0
        Horn_.horns = []
    }

    static onGsapUpdate(params) {
        const self = params
        self.exec()

    }

    static onGsapComplete(params) {
        const self = params

        $(self.selector.body).remove()
        $(self.selector.shadow).remove()

        Horn_.horns = Horn_.horns.filter(v => v.id != self.id)
    }
}