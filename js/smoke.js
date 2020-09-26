const Smoke_ = {
    serialIndex: 0,
    scene: null,

    template: Handlebars.compile($('template#object-smoke').html())
}

class Smoke {
    
    constructor(id, x, y) {
        this.id = id
        this.selector = `#smoke-${id}`

        Smoke_.scene.append(Smoke_.template(this))

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
        new Smoke(Smoke_.serialIndex++, x, y)
    }

    static initialize(scene) {
        Smoke_.scene = scene
        Smoke_.serialIndex = 0
    }
}