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
        this.tl = gsap.timeline({
            onComplete: Sheep.onGsapComplete,
            onCompleteParams: [ this ]
        })
        this.tl.fromTo(this.selector,
            { x: this.x + FIELD_SIZE_X, y: yy },
            { x: this.x, y: yy})

        $(this.selector).css('z-index', y)
    }
    /**
     * 羊矩形を返す。
     */
    getRect() {
        const _o = $(this.selector)
        return {
            x0: _o.position().left,
            x1: _o.position().left + SHEEP_WIDTH,
            y0: _o.position().top,
            y1: _o.position().top + SHEEP_HEIGHT
        }
    }

    isWalk() {
        return this.status == SHEEP_STATUS.WALK
    }
    setHit() {
        this.tl.kill()
        this.tl = gsap.timeline({
            onComplete: Sheep.onGsapComplete,
            onCompleteParams: [ this ]
        })
        this.tl.to(this.selector, {
            opacity: 1,
            duration: 0.5,
        })
        this.status = SHEEP_STATUS.HIT
    }

    static create() {
        const y = parseInt(Math.random() * (FIELD_Y_MAX - FIELD_Y_MIN)) + FIELD_Y_MIN
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
     * アニメーションタイムラインupdate時処理
     * @param {*} params 
     */
    static onGsapUpdate(params) {
        const self = params
        const pos = self.getRect()

        switch(self.status) {
            case SHEEP_STATUS.AWAY:
                Smoke.create(pos.x1, pos.y1)
                break
        }
    }

    /**
     * アニメーションタイムライン終了時処理
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
            case SHEEP_STATUS.HIT:
                self.tl = gsap.timeline({
                    onUpdate: Sheep.onGsapUpdate,
                    onUpdateParams: [ self ],
                    onComplete: Sheep.onGsapComplete,
                    onCompleteParams: [ self ]
                })
                self.tl.to(self.selector, {
                    x: -FIELD_SIZE_X,
                    duration: 0.5,
                    ease: Power2.easeOut
                })
                self.status = SHEEP_STATUS.AWAY
                break
            case SHEEP_STATUS.AWAY:
                $(self.selector).remove()
                Sheep.sheeps = Sheep.sheeps.filter(v => v.id != self.id)
                break
        }
    }
}