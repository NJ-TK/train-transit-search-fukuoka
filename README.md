# 福岡県近郊限定 鉄道乗換案内

福岡県近郊の路線データに基づき、乗換案内をするWebアプリです。

経路はサーバー側でダイクストラ法を用いて計算します。

所要時間データは独自で作成したものを使用しており、正確な時刻表に基づいて算出するわけではないため、
所要時間はあくまで目安です。

## 技術仕様

+ フレームワーク: Nuxt.js (Nuxt3)
+ バックエンド: Netlify Functions (AWS LambdaをNetlify用にラップしたサービス)
    + 開発言語: TypeScript
+ ホスティングサービス: Netlify

## 対応エリア

以下の路線図に示すエリア内の検索に対応しています(細い線の路線を除く)。

また、一部の駅間の徒歩連絡ルートも収録しています。

![対応エリア路線図](public/train_map/fukuoka_route_map.png)

※ 路線図も独自で作成したものです