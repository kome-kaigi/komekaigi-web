# KomeKaigi2025

## タイムテーブルの更新

タイムテーブルは fortee の API から取得した `docs/data/timetable.json` を表示しています。
fortee 側でタイムテーブルを更新したら、以下を実行して JSON を更新・コミットしてください。

```sh
make timetable
```

`docs/data/timetable.json` は `make timetable` で丸ごと上書きされるため、手で設定したい内容（枠のリンク先やタイトルなど）は
`docs/data/timetable_overrides.json` に分けて管理しています。`items` に fortee の枠の `uuid` をキーとして `title` / `url` を書くと上書きされます。

`make serve` で `docs/` を http://localhost:8000 で確認できます。

## CSS/JS を変更したとき

CSS/JS はブラウザに最大4時間キャッシュされるため、`docs/index.html` からは内容ハッシュ付きの URL（`css/teaser.css?v=xxxx`）で読み込んでいます。
`docs/css/` や `docs/js/` を変更したら、以下を実行して `docs/index.html` も一緒にコミットしてください（付け忘れは PR の CI で検知されます）。

```sh
make assets
```
