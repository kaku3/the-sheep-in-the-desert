class Smoke {
    static serialIndex = 0
    static scene = null

    static template = Handlebars.compile($('template#object-smoke').html())
    
    constructor(id, x, y) {
        this.id = id
        this.selector = `#smoke-${id}`

        Smoke.scene.append(Smoke.template(this))

        const o = $(this.selector)
        let ww = o.width() / 2
        let hh = o.height() / 2

        gsap.set(this.selector, { left: x - ww, top: y - hh, opacity: 0.25, scale: 0.25 })
        this.tl = gsap.timeline({
            onComplete: (params) => {
                const self = params
                $(self.selector).remove()
            },
            onCompleteParams: [ this ]
        })
        this.tl.to(this.selector, { left: x + FIELD_SIZE_X * 2, opacity: 0.75, scale: 3, duration: 0.75, ease: Power1.easeIn })

        o.css('z-index', y - o.height())
    }

    static create(x, y) {
        new Smoke(Smoke.serialIndex++, x, y)
    }

    static initialize(scene) {
        Smoke.scene = scene
        Smoke.serialIndex = 0
    }
}