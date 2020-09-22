const SHEEP_WIDTH = 192
const SHEEP_HEIGHT = 96

const SHEEP_MOVE_SIZE_X_MIN = 32
const SHEEP_MOVE_SIZE_X_MAX = 288
const SHEEP_MOVE_SIZE_X_RANGE = SHEEP_MOVE_SIZE_X_MAX - SHEEP_MOVE_SIZE_X_MIN

const SHEEP_STATUS = {
    INIT: 0,
    APPEAR: 100,
    WALK: 200,
    HIT: 300,
    AWAY: 400
}

class Sheep {
    static serialIndex = 0
    static scene = null
    static sheeps = []

    static template = Handlebars.compile($('template#object-sheep').html())

    constructor(id, x, y) {

        x += (id % 4) * FIELD_STEP_X / 4
        y += (id % 4) * FIELD_STEP_Y / 4

        this.id = id
        this.selector = `#sheep-${id}`
        this.x = x
        this.y = y
        this.speed = parseInt(Math.random() * 10) * 8 + 120
        this.status = SHEEP_STATUS.APPEAR

        Sheep.scene.append(Sheep.template(this))

        let yy = this.y - SHEEP_HEIGHT
        this.tl = gsap.timeline()
        this.tl.fromTo(this.selector, { x: this.x + FIELD_SIZE_X, y: yy }, { x: this.x, y: yy , onComplete: Sheep.onGsapComplete, onCompleteParams: [ this ]})

        $(this.selector).css('z-index', y)
    }

    static create() {
        const y = parseInt(Math.random() * (FIELD_Y_MAX - FIELD_Y_MIN) / FIELD_STEP_Y) * FIELD_STEP_Y + FIELD_Y_MIN
        const x = parseInt(Math.random() * (FIELD_SIZE_X / 3 - SHEEP_WIDTH) / FIELD_STEP_X) * FIELD_STEP_X + (FIELD_SIZE_X / 4)

        const o = new Sheep(Sheep.serialIndex++, x, y)

        return o
    }
    static initialize(scene) {
        Sheep.scene = scene
        Sheep.serialIndex = 0
        Sheep.sheeps = []
    }
    static execute() {
        if(Sheep.sheeps.length < 5) {
            Sheep.sheeps.push(Sheep.create())
        }
    }

    /**
     * 
     * @param {*} params 
     */
    static onGsapComplete(params) {
        const self = params
        switch(self.status) {
            case SHEEP_STATUS.APPEAR:
                const moveX = (Math.random() * SHEEP_MOVE_SIZE_X_RANGE) + SHEEP_MOVE_SIZE_X_MIN

                self.tl = gsap.timeline({ repeat: -1 })
                self.tl.to(self.selector, {
                    x: self.x + moveX,
                    duration: (moveX / self.speed) * 3 + 0.5
                })
                self.tl.to(self.selector, {
                    x: self.x,
                    duration: (moveX / self.speed) * 3 + 0.2
                })
                self.status = SHEEP_STATUS.WALK
                break
        }
    }

}