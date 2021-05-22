# LIFFとStripe CheckoutでLINE上で使える決済画面を作ろうハンズオン！

こちらはLINE Developers Community にてハンズオンを行った際の手順をまとめたものです。
<br><br><br>

## デモ

[デモサイト](https://liff.line.me/1655194342-OBj3dG0j)<br><br>
LINEが立ち上がります。<br><br>
テスト用のカード4242-4242-4242-4242を使って決済の流れをご確認頂けます。カード有効期限とCVC、所有者名、メールアドレスは適当でokです。
<br><br><br>
## 開発環境
Node.js
<br><br><br>
## １．ソースコードを取得

↓コードは[GitHubのリポジトリ](https://github.com/kota-imai/liff-stripe-checkout-sample)を公開してますので、そちらを落としてみてください。<br>
[Stripe公式のサンプル](https://github.com/stripe-samples/checkout-subscription-and-add-on)をLIFF向けに修正したものです。

```
$ git clone https://github.com/kota-imai/liff-stripe-checkout-sample.git
$ cd liff-stripe-checkout-sample
```
<br><br>
↓プロジェクトの依存パッケージをダウンロードします

```
$ npm install
```
<br><br>
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
<br><br>
**client/index.js (1行目)**

```javascript
const liffId = (⑦作成したLIFFアプリのLIFF ID)
```
<br><br><br>
## ２．LINE側の設定

まずは[LINE Developers](https://developers.line.biz/ja/) からチャンネルを作成します。LINEログインのチャンネルにLIFFアプリを登録していきます。
<br><br>
**チャネルID**と**LIFF ID**を控えて .env ファイルに追加してください。
LIFF IDはLIFFアプリ作成後に付与されます。
<br>

![image-20210522213339850](https://user-images.githubusercontent.com/56163213/119226822-0cb18f00-bb46-11eb-9f5d-2491343eb5ad.png)

![image-20210522213642053](https://user-images.githubusercontent.com/56163213/119226859-24891300-bb46-11eb-9b02-f8709f0082b0.png)
<br><br><br>

## ３．Stripe側の設定

次に[Stripe](https://dashboard.stripe.com/dashboard)のダッシュボードから定期支払いの商品を作成します。
<br><br>
ホーム画面で確認できる**公開可能キー**（pk_XXXXXXX）と**シークレットキー**（sk_XXXXXXX）
<br>
![image-20210522215412213](https://user-images.githubusercontent.com/56163213/119227470-ffe26a80-bb48-11eb-953d-2d8a688c01a6.png)

<br>

詳細欄の**商品ID**（prod_XXXXXX）と料金欄の**価格ID**（price_XXXXXXXX）を .env ファイルに追加します。
![image-20210522215840254](https://user-images.githubusercontent.com/56163213/119227462-eb9e6d80-bb48-11eb-8773-b6a5f1898918.png)

<br><br><br>
## ４．ngrokでトンネリング開始

↓ngrokでポートフォワーディング

```
$ ngrok http 5000
```

![image-20210522220402259](https://user-images.githubusercontent.com/56163213/119227594-a7f83380-bb49-11eb-9b2e-e67a3cc98a0b.png)
<br>

httpsで始まるアドレスを .env のドメインに追加します。
<br><br>
最後にLINE DevelopersのLIFFアプリ詳細からエンドポイントURLを書き換えます。<br>
エンドポイントURLは**httpsでないと登録できない**のでご注意ください。

![image-20210522220859446](https://user-images.githubusercontent.com/56163213/119227727-5603dd80-bb4a-11eb-8753-e1e5c8b22c6a.png)
<br><br><br>

## ５．ローカルでサーバー起動

```
$ npm start
```

![image-20210522221832841](https://user-images.githubusercontent.com/56163213/119227992-ab8cba00-bb4b-11eb-9f4f-6b571df57fee.png)

listening on port 5000!  と表示されれば node のサーバー立ち上げ成功です。 




<br><br><br>


## ６．決済してみる

LIFFアプリのURLを開くと決済画面が立ち上がるかと思います。<br>
4242のテスト用カードを使って決済してみます。
<br><br>
決済してからStripeのダッシュボードを確認してみると、、

![20200728093917.jpg](https://qiita-image-store.s3.ap-northeast-1.amazonaws.com/0/594998/47bf7881-9853-bc57-c420-a4592150150b.jpeg)
処理が成功しています。メタデータのユーザーIDも登録されてました！


<br><br><br>


## ７．Herokuにデプロイ

新しくアプリケーションを作成します。
<br>
作成後、「Open app」からアプリのURLを確認して、envファイルとLINE DevelopersのエンドポイントURLを上書きしてください。
<br><br>
今回はHeroku CLIを使ってデプロイしていきます。詳しい手順は[コチラ](https://devcenter.heroku.com/ja/articles/git)！


<br><br><br>





## 注意点！！

<br>

##### 運用時は .env ファイルは利用禁止！！

本ハンズオンでは、.env ファイルごとHerokuにデプロイしていますが、実際に運用する際は環境変数を使うようにしてください。<br>
また、コードを公開リポジトリに上げる際は、**必ず env ファイルを管理対象から外してください。**
<br><br>
##### LINEのユーザー情報の取り扱いに注意！！

クライアント側で取得したユーザー情報をサーバーに送ることは**公式で禁止されています**。<br>
今回はクライアント側でIDトークンを発行して、サーバーサイドでトークンを使ってユーザー情報を取得するようにしました。<br>
https://developers.line.biz/ja/docs/liff/using-user-profile/<br>
https://developers.line.biz/ja/reference/line-login/#verify-id-token<br>


<br><br><br>


## 参考にしたサイト

https://developers.line.biz/ja/reference/line-login/<br>
https://developers.line.biz/ja/docs/liff/using-user-profile/<br>
https://stripe.com/docs/api/checkout/sessions/create<br>
https://support.stripe.com/questions/using-metadata-with-checkout-sessions<br>



<br><br><br>