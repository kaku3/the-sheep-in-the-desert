# 砂漠のひつじ

![スクリーンショット](https://github.com/kaku3/the-sheep-in-the-desert/blob/master/docs/image/the-sheeps-in-the-desert.gif)

[試しに遊んでみる](https://kaku3.github.io/the-sheep-in-the-desert/)

html, css, javascript, およびオブジェクト指向学習用ミニゲームプロジェクト。(作成中)
※業務プログラムの学習をターゲットとし、canvas を用いない構成とした。

できるだけ少ないコード量で様々な要素の学習ができることを目的としたため、オブジェクト指向やデザインパターン的に必ずしも正しいコードとはなっていないので注意。
逆に「オブジェクト指向」や「デザインパターン」として正しいコードを追求するとコストバランスが悪いケースもあると思う。「メンテナンスが面倒くさい」と思ったら何かを疑ってみるとよいかもしれない。

## 外部ライブラリとか
- [jQuery](https://jquery.com/)
js基本ライブラリ。
- [handlebars](https://handlebarsjs.com/)
js用templateライブラリ。html テンプレートにダブルブラケット記述({{value}})で変数を置き換えられる。
- [GSAP3](https://greensock.com/gsap/)
アニメーションライブラリ。旧TweenMax。アニメーションを簡単に記述できる。

## 課題
完成形のソースは実装量が多くなるので作業の区切り毎に tasks タグを用意しました。
次のタグ部分までの実装してみてください。
- tasks/scene
タイトル→ゲーム画面の基本遷移と、敵キャラの配置まで
- tasks/sight
照準カーソル追加
- tasks/horn
ツノ砲発射
- tasks/horn_shot_with_player
プレイヤーキャラクター配置
- tasks/collision
ツノ砲とヒツジの当たり判定
- tasks/smoke_effect
煙エフェクト

## 未実装
- スコア処理
コメカミに近いほど高得点
- スコアエフェクト表示
- ハイスコア保存
- 結果画面

## 遊び方
マウスカーソルで照準を操作し、ヒツジのコメカミめがけてツノ砲を発射

## オブジェクト指向について

Qiitaに記事書きましたので、よければ見てください。

- [ゲームで理解するオブジェクト指向設計の基本](https://qiita.com/kaku3/items/a875fe1c098509b1fccd)
- [ゲームで身につけるオブジェクト指向設計(実装編)](https://qiita.com/kaku3/items/f482d48676eb7ea9c9a6)
