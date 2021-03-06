# Contribution Guide

この文章では、XR ヘッドセット比較表に貢献する方法を示します。
温かい助力を頂けると、泣いて喜びます。

## 貢献する方法

### 情報を提供する
掲載された情報に間違いや旧価格といった誤情報がある場合、または日本市場において主要なヘッドセット、世界的に注目すべきヘッドセットが載っていないなど、管理者に情報を提供したい場合、次の方法を取ることができます。

- [Issue を立てて](https://github.com/yutokun/XR-Headset-Comparison/issues/new)情報提供
- Twitter で管理者 [@yutoVR](https://twitter.com/yutoVR) に突撃

迷ったら Issues を見て、なければ言って下さい。

### データ本体を改善し、プルリクエストを作成する
データの本体は、[headset.tsv](headset.tsv) です。これを sheet-parser.js が解釈し、HTML を構築しています。

サイトの見た目と異なり、行がヘッドセット、列が項目となっています。これは、編集時に差分を見やすくするための措置です。表は sheet-parser.js によって転置されます。


| やりたい事 | 方法 |
| --- | --- |
| 既存の情報を変更する | [headset.tsv](headset.tsv) の該当セルを編集し、プルリクエストを作成して下さい。 |
| 新しいヘッドセットを追加する | [create ページ](https://xr-comparison.yutokun.com/create) にデータを入力することで、表に挿入する1行分のデータを生成できるようにしてあります。TSV の独自仕様にも自動的に対応します。これを [headset.tsv](headset.tsv) のそれらしい位置に手作業で挿入すれば、新しいヘッドセットを追加できます。なお、読み込み速度を維持するため、画像は16:9、266 × 150 ピクセルで作成して下さい。 |

### サイトのバグを報告する
ウェブサイトに特定の環境で動かないバグがあったり、閲覧に支障をきたす問題を発見した場合、[新しい Issue](https://github.com/yutokun/XR-Headset-Comparison/issues/new) に問題を日本語、または英語で報告することができます。管理者は問題の優先順位を判断し、管理者自ら修正するか、コミュニティの貢献を待ちます。

### サイトのバグを修正する
もし発見したバグを自ら修正できる場合、ブランチを作成して修正を行い、プルリクエストを作成してください。管理者がレビューし、問題がなくなればマージします。

## headset.tsv の仕様
表現力を増すために、TSV ファイルに独自の仕様を設けてあります。必要に応じて使用して下さい。なお、これらの多くは [create.html](https://xr-comparison.yutokun.com/create.html) を使用することで自動的に記述できます。


| 機能 | 記法 | 例 | 結果 |
| --- | --- | --- | --- |
| 画像を貼る | `\image{/path/to/image.jpg}` | `\image{images/headsets/Rift S.jpg}` | <img src="images/headsets/Rift S.jpg"> |
| リンクを貼る | `\link{リンク名,URL`} | `\link{Rift S 公式サイト,https://www.oculus.com/rift-s/}` | [Rift S 公式サイト](https://www.oculus.com/rift-s/) |
| 税抜き価格から税込価格を計算する | `\ct{税抜き価格}` | `\ct{89882}` | 98870 |
| 改行する | `\n` | `\n` | 改行コードに変換されます |

## デプロイについて

本リポジトリは GitHub Actions を利用しており、master ブランチにプッシュされたコミット差分が自動的にデプロイされる仕組みになっています。通常、master への push が完了してから5分以内にウェブサイト上で変更を確認できるようになります。

この仕組み上、本番環境での不整合を避けるため、master への force push は行えない設定としています。

## その他
わからない事があったら、[管理者@yutoVR](https://twitter.com/yutoVR) に聞いて下さい。

また、本サイトは管理者の趣味で私的な時間を使って…つまり、無償の愛によって運用されており、対応に時間がかかる場合がある点は、あらかじめご容赦いただければと思います。


