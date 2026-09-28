TIMETABLE_URL  := https://fortee.jp/komekaigi-2026/api/timetable
TIMETABLE_JSON := docs/data/timetable.json

.PHONY: help timetable serve

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

serve: ## docs/ をローカルで配信する (http://localhost:8000)
	python3 -m http.server 8000 -d docs
