// iOS safari で static field 動かない
// https://caniuse.com/?search=static%20field
// ES2015 の仕様にもない。
// https://stackoverflow.com/questions/40367392/static-class-property-not-working-with-babel


// ゲーム scene 定義
const SCENE = {
    INIT: 0,
    TITLE_INIT: 100,
    TITLE_EXEC: 101,
    GAME_INIT: 200,
    GAME_EXEC: 201,
    RESULT_INIT: 300,
    RESULT_EXEC: 301
}

const Game_ = {
    self: null
}

class Game {

    static create() {
        Game_.self = new Game()
    }

    static exec() {
        let self = Game_.self
        if(self.currentScene != self.nextScene) {
            self.changeScene()
        }
        self.execScene()
    }

    static addScore(score) {
        Game_.self.score += score
    }


    constructor() {
        this.currentScene = SCENE.INIT
        this.setNextScene(SCENE.GAME_INIT)
        this.setNextScene(SCENE.TITLE_INIT)
        setInterval(Game.exec, FPS)
    }

    /**
     * 次の scene を設定
     * @param {*} scene 
     * @param {*} immediate 
     */
    setNextScene(scene, immediate = false) {
        this.nextScene = scene
        if(immediate) {
            this.currentScene = this.nextScene
        }
    }

    /**
     * scene 移行
     */
    changeScene() {
        this.currentScene = this.nextScene
        switch(this.currentScene) {
            case SCENE.TITLE_INIT:
                this.initTitle()
                break
            case SCENE.TITLE_EXEC:
                break
            case SCENE.GAME_INIT:
                this.initGame()
                break
            case SCENE.GAME_EXEC:
                break
        }
    }

    /**
     * ゲームループ
     */
    execScene() {
        switch(this.currentScene) {
            case SCENE.TITLE_EXEC:
                break
            case SCENE.GAME_EXEC:
                this.execGame()
                break
            case SCENE.RESULT_EXEC:
                break
        }
    }

    /**
     * title 初期化
     */
    initTitle() {
        const game = this.initScene('template#scene-title')

        gsap.set('.start', { opacity: 0})

        const tl = gsap.timeline({
            onComplete: (params) => {
                const tl = gsap.timeline({ repeat: -1, yoyo: true })
                tl.to('.start', { opacity: 1, duration: .5})
        
                $('.scene.title', game).on('click', (e) => {
                    this.setNextScene(SCENE.GAME_INIT)
                })
            }
        })
        tl.to('.scene.title .title1', {
            duration: 2,
            text: {
                value: "The Sheeps"
            }
        })
        tl.to('.scene.title .title2', {
            duration: 1,
            text: {
                value: "in the desert"
            }
        })
        
        this.setNextScene(SCENE.TITLE_EXEC, true)
    }

    /**
     * game 初期化
     */
    initGame() {
        const game = this.initScene('template#scene-game')
        const scene = $('.scene.game', game)

        Sheep.initialize(scene)
        Horn.initialize(scene)
        Smoke.initialize(scene)
        ScoreEffect.initialize(scene)

        this.initSight(game)

        this.score = 0
        this.time = GAME_TIME

        // player 登場アニメ
        const tl = gsap.timeline()
        tl.set('.game > .player', { opacity: 0, scaleX: 0, scaleY: 3 })
        tl.to('.game > .player', { opacity: 1, scaleX: 1, scaleY: 1, duration: 0.5, ease: Power2.easeIn })

        this.setNextScene(SCENE.GAME_EXEC, true)
    }
    /**
     * 照準カーソル初期化
     * @param {*} game 
     */
    initSight(game) {
        const scene = $('.scene.game', game)
        const sight = $('.sight', game)
        game.on('mousemove', (e) => {
            sight.css({
                left: e.offsetX - sight.width() / 2,
                top: e.offsetY - sight.height() / 2
            })
        })
        scene.on('click', (e) => {
            this.shot(e.offsetX, e.offsetY)
        })
    }
    /**
     * ツノ砲発射
     * @param {*} x 
     * @param {*} y 
     */
    shot(x, y) {
        const t = gsap.timeline()
        t.to('.game > .sight', { scale: 0.8, duration: 0.02 })
        t.to('.game > .sight', { scale: 1, duration: 0.05 })

        if(Horn.canShoot()) {
            const player = '.game > .player'    
            const tl = gsap.timeline()
            tl.set(player, { backgroundImage: 'url("image/player-attack.png")' })
            tl.to(player, { opacity: 1, duration: 0.1})
            tl.set(player, { backgroundImage: 'url("image/player-stand.png")' })

            Horn.create(HORN_X, HORN_Y, x, y)
        }

    }

    /**
     * scene 初期化
     * @param {*} params 
     */
    initScene(sceneTemplate, params = {}) {
        const game = $('.game')
        const template = Handlebars.compile($(sceneTemplate).html())
        game.empty()
        game.append(template(params))

        return game
    }


    /**
     * ゲーム処理
     */
    execGame() {
        this.time -= FPS
        if(this.time <= 0) {
            this.time = 0
            this.setNextScene(SCENE.RESULT_INIT)
        }
        let scene = $('.game .scene.game')

        Sheep.execute()

        $('.score-value', scene).text(this.score)
        $('.time-value', scene).text(parseInt(this.time / 1000))
    }
}
