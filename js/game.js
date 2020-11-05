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
    var self = Game_.self
    if (self.currentScene != self.nextScene) {
      self.changeScene()
    }
    self.execScene()
  }

  static addScore(score) {
    Game_.self.score += score
  }

  static getTime() {
    return Game_.self.time
  }

  /**
   * hiScore 表示更新
   * @param {*} forceUpdate 
   */
  static buildHiScores(forceUpdate) {
    var self = Game_.self
    if(forceUpdate || !self.hiScores) {
      self.obtainHiScores().then((hiScores) => {
        self.hiScores = hiScores
        self._buildHiscores()
      })
    } else {
      self._buildHiscores()
    }
  }
  _buildHiscores() {
    var self = Game_.self
    var _template = Handlebars.compile($('template#hiscores-table-tbody-row').html());
    $('#hiscores-table-tbody').empty();
    for(var o of self.hiScores) {
      $('#hiscores-table-tbody').append(_template(o));
    }
  }

  obtainHiScores() {
    return new Promise((resolve, reject) => {
      var db = firebase.firestore()
      var q = db.collection('scores').orderBy('score', 'desc').limit(100)
      q.get().then((r) => {
        var hiScores = r.docs.map(d => d.data())
        var _score = hiScores[0].score
        var _rank = 1
        var _rank0 = 0
        hiScores = hiScores.map(s => {
          // 順位：同点処理
          if(s.score < _score) {
            _score = s.score
            _rank += _rank0
            _rank0 = 1
          } else {
            _rank0++
          }
          s.rank = _rank
          return s
        })
        resolve(hiScores)
      })
    })
  }

  constructor() {
    this.user = null
    this.displayName = "SHEEP"

    this.hiScore = 0
    this.hiScores = null
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
    if (immediate) {
      this.currentScene = this.nextScene
    }
  }

  /**
   * scene 移行
   */
  changeScene() {
    this.currentScene = this.nextScene
    switch (this.currentScene) {
      case SCENE.TITLE_INIT:
        this.initTitle()
        break
      case SCENE.GAME_INIT:
        this.initGame()
        break
      case SCENE.RESULT_INIT:
        this.initResult()
        break
    }
  }

  /**
   * ゲームループ
   */
  execScene() {
    switch (this.currentScene) {
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

    gsap.set('.start', {
      opacity: 0
    })

    const tl = gsap.timeline({
      onComplete: (params) => {
        const tl = gsap.timeline({
          repeat: -1,
          yoyo: true
        })
        tl.to('.start', {
          opacity: 1,
          duration: .5
        })

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
    tl.set('.game > .player', {
      opacity: 0,
      scaleX: 0,
      scaleY: 3
    })
    tl.to('.game > .player', {
      opacity: 1,
      scaleX: 1,
      scaleY: 1,
      duration: 0.5,
      ease: Power2.easeIn
    })

    this.setNextScene(SCENE.GAME_EXEC, true)
  }

  initResult() {
    console.log(firebase.auth.currentUser)

    let notSignin = (this.user == null)
    let isShownFirebaseAuthUi = false
    let isNewRecord = false
    let isRanked = false
    let rank = -1
    const self = Game_.self
    const tl = gsap.timeline({
      onComplete: (params) => {
        const game = this.initScene('template#scene-result', {
          score: self.score,
          displayName: self.displayName,
          isNewRecord: isNewRecord,
          isRanked: isRanked,
          rank: rank,
          notSignin: notSignin
        })

        const _title = '.scene.result .button.title'
        const _again = '.scene.result .button.again'
        const _newRecord = '.scene.result .new-record'
        const _signin ='.scene.result button.signin'

        gsap.timeline({ repeat: -1, yoyo: true })
          .to(_title, { scale: 1.1, duration: 1 })

        gsap.timeline({ repeat: -1, yoyo: true })
          .to(_again, { scale: 1.1, duration: 1 })

        if(isNewRecord) {
          gsap.timeline({ repeat: -1, yoyo: true })
          .to(_newRecord, { opacity: 0, duration: .25 })
        }

        $(_title).on('click', (e) => {
          this.setNextScene(SCENE.TITLE_INIT)
        })
        $(_again).on('click', (e) => {
          this.setNextScene(SCENE.GAME_INIT)
        })

        if(isRanked) {
          $('#register-container #name').focus()

          if(notSignin) {
            $('#register-container .register').hide()
  
            $(_signin).on('click', (e) => {
              $('#firebaseui-auth-container').show()
              if(!isShownFirebaseAuthUi) {
                isShownFirebaseAuthUi = true
                startFirebaseAuthUi('#firebaseui-auth-container', (authResult, redirectUrl) => {
                  console.log(authResult, redirectUrl)
                  this.user = authResult.user
                  $('#firebaseui-auth-container').hide()
                  $('#signin-container').hide()
  
                  self.showRegisterButton()
                })
                $('#firebaseui-auth-container-close').on('click', (e) => {
                  $('#firebaseui-auth-container').hide()
                })
              }
            })
          } else {
            self.showRegisterButton()
          }
        }
        
        this.setNextScene(SCENE.RESULT_EXEC, true)
      }
    })
    tl.to('.game .scene.game', {
      opacity: 0,
      duration: 2
    })

    gsap.to('.game > .player', {
      opacity: 0,
      scaleY: 2,
      duration: 0.5
    })
    gsap.to('.game > .sight', {
      opacity: 0,
      scale: 5,
      duration: 0.5
    })

    if(this.score > 0) {
      // 自己スコア更新？
      if(this.score > this.hiScore) {
        this.hiScore = this.score
        isNewRecord = true

        // ランク入り？
        if(this.hiScores.length < 100 || this.hiScores.filter(s => this.score > s.score).length > 0) {
          isRanked = true
          rank = this.hiScores.filter(s => this.score < s.score).length + 1
        }
      }
    }
  }
  showRegisterButton() {
    let _registerButton = $('#register-container .register')
    _registerButton.show()
    _registerButton.on('click', (e) => {
      let name = $('#register-container #name').val()
      if(name.length == 0) {
        return
      }
      var db = firebase.firestore()
      db.collection('scores').add({
        name: name,
        score: this.score
      }).then((r) => {
        $('#register-container').hide()
        Game.buildHiScores(true)
      })
    })
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
      if (this.currentScene == SCENE.GAME_EXEC) {
        this.shot(e.offsetX, e.offsetY)
      }
    })
  }
  /**
   * ツノ砲発射
   * @param {*} x 
   * @param {*} y 
   */
  shot(x, y) {
    const t = gsap.timeline()
    t.to('.game > .sight', {
      scale: 0.8,
      duration: 0.02
    })
    t.to('.game > .sight', {
      scale: 1,
      duration: 0.05
    })

    if (Horn.canShoot()) {
      const player = '.game > .player'
      const tl = gsap.timeline()
      tl.set(player, {
        backgroundImage: 'url("image/player-attack.png")'
      })
      tl.to(player, {
        opacity: 1,
        duration: 0.1
      })
      tl.set(player, {
        backgroundImage: 'url("image/player-stand.png")'
      })

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
    if (this.time <= 0) {
      this.time = 0
      this.setNextScene(SCENE.RESULT_INIT)
    }
    var scene = $('.game .scene.game')

    Sheep.execute()

    $('.score-value', scene).text(this.score)
    $('.time-value', scene).text(parseInt(this.time / 1000))
  }
}
