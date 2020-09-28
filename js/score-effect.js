const ScoreEffect_ = {
    serialIndex: 0,
    scene: null,

    template: Handlebars.compile($('template#object-score-effect').html())
}

class ScoreEffect {

    constructor(id, x, y, score) {
        this.id = id
        this.selector = `#score-effect-${id}`
        this.score = score

        ScoreEffect_.scene.append(ScoreEffect_.template(this))

        gsap.set(this.selector, { left: x, top: y })
        this.tl = gsap.timeline({
            onComplete: (params) => {
                const self = params
                $(self.selector).remove()
            },
            onCompleteParams: [ this ]
        })
        this.tl.to(this.selector, { top: y / 80 + 60, scale: 1 + score / 20, duration: 0.3, ease: Power4.easeOut })
        this.tl.to(this.selector, { opacity: 1, duration: 0.2 })
    }

    static create(x, y, score) {
        new ScoreEffect(ScoreEffect_.serialIndex++, x, y, score)
    }

    static initialize(scene) {
        ScoreEffect_.scene = scene
        ScoreEffect_.serialIndex = 0
    }
}