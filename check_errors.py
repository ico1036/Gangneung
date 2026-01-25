"""콘솔 에러 상세 확인"""
from playwright.sync_api import sync_playwright

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page()

    errors = []
    page.on("console", lambda msg: errors.append({"type": msg.type, "text": msg.text}) if msg.type in ["error", "warning"] else None)

    page.goto("http://localhost:8082/")
    page.wait_for_load_state("networkidle")
    page.wait_for_timeout(1000)

    print(f"총 에러/경고: {len(errors)}개\n")

    # 에러 타입별 분류
    by_type = {}
    for e in errors:
        key = e["text"][:50] if len(e["text"]) > 50 else e["text"]
        by_type[key] = by_type.get(key, 0) + 1

    print("에러 유형별 카운트:")
    for text, count in sorted(by_type.items(), key=lambda x: -x[1])[:10]:
        print(f"  [{count}x] {text}")

    browser.close()
