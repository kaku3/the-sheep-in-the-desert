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
        const dd = d / 2000 + 0.1

        const body = $(this.selector.body)
        let ww = body.width() / 2
        let hh = body.height() / 2

        gsap.from(this.selector.body, { left: x - ww, top: y - hh })

        this.tl = gsap.timeline({
            onUpdate: Horn.onGsapUpdate,
            onUpdateParams: [ this ],
            onComplete: Horn.onGsapComplete,
            onCompleteParams: [ this ]
        })
        this.tl.to(this.selector.body, { left: (tx - x) / 2 + x - ww, top: (ty - y) / 2 + y - zz - hh, ease: Sine.easeOut, duration: dd })
        this.tl.to(this.selector.body, { left: tx - ww, top: ty - hh, ease: Sine.easeIn, duration: dd })

        this.tlRotate = gsap.timeline({ repeat: -1 })
        this.tlRotate.to(this.selector.body, { rotation: "+=360", duration: 0.6, ease: Power0 })

        const shadow = $(this.selector.shadow)
        ww = shadow.width() / 2
        hh = shadow.height() / 2

        gsap.from(this.selector.shadow, { left: x - ww, top: y - hh })

        this.tlShadow = gsap.timeline()
        this.tlShadow.to(this.selector.shadow, { left: (tx - x) / 2 + x - ww, top: (ty - y) / 2 + y - hh, ease: Sine.easeOut, duration: dd })
        this.tlShadow.to(this.selector.shadow, { left: tx - ww, top: ty - hh, duration: dd })

        // 最背面
        $(this.selector.shadow).css('z-index', 1)
    }
    static canShoot() {
        return Horn.horns.length < 3
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
    static execute() {

    }

    static onGsapUpdate(params) {
        const self = params

        const body = $(self.selector.body)
        const shadow = $(self.selector.shadow)
        const y = parseInt(shadow.css('top') + body.height() / 2)

        body.css('z-index', y)
    }

    static onGsapComplete(params) {
        const self = params

        $(self.selector.body).remove()
        $(self.selector.shadow).remove()

        Horn.horns = Horn.horns.filter(v => v.id != self.id)
    }
}