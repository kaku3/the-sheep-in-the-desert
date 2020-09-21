
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

class Game {
    static self

    static create() {
        Game.self = new Game()
    }

    static exec() {
        let self = Game.self
        if(self.currentScene != self.nextScene) {
            self.changeScene()
        }
        self.execScene()

        console.log('Game.exec : ' + self.currentScene)
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
        this.initScene('template#title')

        let game = $('.game')

        let t = gsap.timeline({ repeat: -1, yoyo: true })
        t.to('.start', { opacity: 0, duration: .5})

        $('.scene.title', game).on('click', (e) => {
            this.setNextScene(SCENE.GAME_INIT)
        })

        this.setNextScene(SCENE.TITLE_EXEC, true)
    }

    /**
     * game 初期化
     */
    initGame() {
        this.initScene('template#game')
        Sheep.initialize($('.game .scene.game'))

        this.score = 0
        this.time = GAME_TIME

        this.setNextScene(SCENE.GAME_EXEC, true)
    }

    /**
     * scene 初期化
     * @param {*} params 
     */
    initScene(sceneTemplate, params = {}) {
        let game = $('.game')
        let template = Handlebars.compile($(sceneTemplate).html())
        game.empty()
        game.append(template(params))
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
