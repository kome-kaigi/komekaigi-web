# KomeKaigi2025

## タイムテーブルの更新

タイムテーブルは fortee の API から取得した `docs/data/timetable.json` を表示しています。
fortee 側でタイムテーブルを更新したら、以下を実行して JSON を更新・コミットしてください。

```sh
make timetable
```

`make serve` で `docs/` を http://localhost:8000 で確認できます。
