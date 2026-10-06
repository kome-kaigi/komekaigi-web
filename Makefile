TIMETABLE_URL  := https://fortee.jp/komekaigi-2026/api/timetable
TIMETABLE_JSON := docs/data/timetable.json

.PHONY: help timetable assets serve

help: ## コマンド一覧を表示する
	@grep -E '^[a-zA-Z_-]+:.*?## ' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "  %-12s %s\n", $$1, $$2}'

timetable: ## fortee からタイムテーブルを取得して docs/data/timetable.json を更新する
	@tmp=$$(mktemp) && \
	curl -fsSL "$(TIMETABLE_URL)" -o "$$tmp" && \
	jq -e '.timetable | length > 0' "$$tmp" > /dev/null && \
	jq '.' "$$tmp" > "$(TIMETABLE_JSON)" && \
	rm -f "$$tmp" && \
	echo "updated $(TIMETABLE_JSON) ($$(jq '.timetable | length' "$(TIMETABLE_JSON)") items)" || \
	{ rm -f "$$tmp"; echo "failed to update $(TIMETABLE_JSON)" >&2; exit 1; }

assets: ## docs/index.html の CSS/JS 参照に内容ハッシュ (?v=) を付け直す。CSS/JS を変えたら実行する
	@perl -pi -e 's{((?:href|src)="((?:css|js)/[^"?]+))(?:\?v=[0-9a-f]*)?"}{"$$1?v=" . substr(`git hash-object docs/$$2`, 0, 8) . "\""}ge' docs/index.html
	@grep -oE '(css|js)/[^"]+\?v=[0-9a-f]+' docs/index.html

serve: ## docs/ をローカルで配信する (http://localhost:8000)
	python3 -m http.server 8000 -d docs
