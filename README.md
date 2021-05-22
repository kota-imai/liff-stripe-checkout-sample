# LIFFとStripe CheckoutでLINE上で使える決済画面を作ろうハンズオン！

こちらはLINE Developers Community にてハンズオンを行った際の手順をまとめたものです。





## デモ

[デモサイト](https://liff.line.me/1655194342-OBj3dG0j)
LINEが立ち上がります。
テスト用のカード4242-4242-4242-4242を使って決済の流れをご確認頂けます。カード有効期限とCVC、所有者名、メールアドレスは適当でokです。





## 開発環境

Node.js





## １．ソースコードを取得

↓コードは[GitHubのリポジトリ](https://github.com/kota-imai/liff-stripe-checkout-sample)を公開してますので、そちらを落としてみてください。[Stripe公式のサンプル](https://github.com/stripe-samples/checkout-subscription-and-add-on)をLIFF向けに修正したものです。

```
$ git clone https://github.com/kota-imai/liff-stripe-checkout-sample.git
$ cd liff-stripe-checkout-sample
```



↓プロジェクトの依存パッケージをダウンロードします

```
$ npm install
```



↓プロジェクト内の.env ファイル と index.js をご自身の環境に合わせて書き換えてください。

**.env**

```.env
# LINE
CHANNEL_ID=(①LINEのチャネルID)

# Stripe keys
STRIPE_PUBLISHABLE_KEY=pk_XXXXXXXXX(②公開可能キー)
STRIPE_SECRET_KEY=sk_XXXXXXXXX(③シークレットキー)

# Checkout options
DONATION_PRODUCT_ID=prod_XXXXXXXX(④商品ID)
SUBSCRIPTION_PRICE_ID=price_XXXXXXXX(⑤価格ID)

# ex.https://payment.herokuapp.com
DOMAIN=(⑥デプロイ先のドメイン)

# client path
STATIC_DIR=client
```



**client/index.js (1行目)**

```javascript
const liffId = (⑦作成したLIFFアプリのLIFF ID)
```







## ２．LINE側の設定

まずは[LINE Developers](https://developers.line.biz/ja/) からチャンネルを作成します。LINEログインのチャンネルにLIFFアプリを登録していきます。

**チャネルID**と**LIFF ID**を控えて .env ファイルに追加してください。
LIFF IDはLIFFアプリ作成後に付与されます。

![image-20210522213339850](https://user-images.githubusercontent.com/56163213/119226822-0cb18f00-bb46-11eb-9f5d-2491343eb5ad.png)

![image-20210522213642053](https://user-images.githubusercontent.com/56163213/119226859-24891300-bb46-11eb-9b02-f8709f0082b0.png)









## ３．Stripe側の設定

次に[Stripe](https://dashboard.stripe.com/dashboard)のダッシュボードから定期支払いの商品を作成します。

ホーム画面で確認できる**公開可能キー**（pk_XXXXXXX）と**シークレットキー**（sk_XXXXXXX）

![image-20210522215412213](https://user-images.githubusercontent.com/56163213/119227470-ffe26a80-bb48-11eb-953d-2d8a688c01a6.png)



詳細欄の**商品ID**（prod_XXXXXX）と料金欄の**価格ID**（price_XXXXXXXX）を .env ファイルに追加します。

![image-20210522215840254](https://user-images.githubusercontent.com/56163213/119227462-eb9e6d80-bb48-11eb-8773-b6a5f1898918.png)







## ４．ngrokでトンネリング開始

↓ngrokでポートフォワーディング

```
$ ngrok http 5000
```

![image-20210522220402259](https://user-images.githubusercontent.com/56163213/119227594-a7f83380-bb49-11eb-9b2e-e67a3cc98a0b.png)

httpsで始まるアドレスを .env のドメインに追加します。



最後にLINE DevelopersのLIFFアプリ詳細からエンドポイントURLを書き換えます。
エンドポイントURLは**httpsでないと登録できない**のでご注意ください。

![image-20210522220859446](https://user-images.githubusercontent.com/56163213/119227727-5603dd80-bb4a-11eb-8753-e1e5c8b22c6a.png)







## ５．ローカルでサーバー起動

```
$ npm start
```

![image-20210522221832841](https://user-images.githubusercontent.com/56163213/119227992-ab8cba00-bb4b-11eb-9f4f-6b571df57fee.png)

listening on port 5000!  と表示されれば node のサーバー立ち上げ成功です。 







## ６．決済してみる

LIFFアプリのURLを開くと決済画面が立ち上がるかと思います。
4242のテスト用カードを使って決済してみます。

決済してからStripeのダッシュボードを確認してみると、、

![20200728093917.jpg](https://qiita-image-store.s3.ap-northeast-1.amazonaws.com/0/594998/47bf7881-9853-bc57-c420-a4592150150b.jpeg)
処理が成功しています。メタデータのユーザーIDも登録されてました！





## ７．Herokuにデプロイ

新しくアプリケーションを作成します。

作成後、「Open app」からアプリのURLを確認してください。
.env ファイルとLINE DevelopersのエンドポイントURLはこちらに上書きしてください。

今回はHeroku CLIを使ってデプロイしていきます。詳しい手順は[コチラ](https://devcenter.heroku.com/ja/articles/git)！







## 注意点！！



##### 運用時は .env ファイルは利用禁止！！

本ハンズオンでは、.env ファイルごとHerokuにデプロイしていますが、実際に運用する際は環境変数を使うようにしてください。
また、こちらのコードを公開リポジトリに上げる際は、.env ファイルを管理対象から外してください。




##### LINEのユーザー情報の取り扱いに注意！！

クライアント側で取得したユーザー情報をサーバーに送ることは**公式で禁止されています**。
今回はクライアント側でIDトークンを発行して、サーバーサイドでトークンの検証を行いユーザー情報を取得するようにしました。
https://developers.line.biz/ja/docs/liff/using-user-profile/
https://developers.line.biz/ja/reference/line-login/#verify-id-token










## 参考にしたサイト

https://developers.line.biz/ja/reference/line-login/
https://developers.line.biz/ja/docs/liff/using-user-profile/
https://stripe.com/docs/api/checkout/sessions/create
https://support.stripe.com/questions/using-metadata-with-checkout-sessions







## 宣伝

chrome拡張を公開してます。良かったら使ってみてください

https://chrome.google.com/webstore/detail/simple-aws-launcher/odbbkogjmgpmdfindgkngoojldhephif?hl=en