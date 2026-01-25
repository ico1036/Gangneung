"""
네이버 지도에서 카페 이미지 URL 추출 (Playwright 사용)
"""
from playwright.sync_api import sync_playwright
import json
import time
import urllib.parse

def extract_images_from_naver():
    # 카페 데이터 로드
    with open("data/cafes.json", "r", encoding="utf-8") as f:
        data = json.load(f)

    cafes = data["cafes"]

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(
            user_agent="Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
            viewport={"width": 1280, "height": 900}
        )
        page = context.new_page()

        print("=" * 60)
        print("네이버 지도에서 카페 이미지 추출")
        print("=" * 60)

        for i, cafe in enumerate(cafes):
            print(f"\n[{i+1}/{len(cafes)}] {cafe['name']}...")

            naver_link = cafe.get("naver_link", "")
            if not naver_link:
                print("   - 네이버 링크 없음")
                continue

            try:
                # 네이버 지도 페이지 방문
                page.goto(naver_link, timeout=30000)
                page.wait_for_load_state("networkidle")
                page.wait_for_timeout(2000)

                # 사진 탭 클릭 시도
                try:
                    frame = page.frame_locator('iframe[title="Naver Place Entry"]')
                    photo_tab = frame.get_by_role("tab", name="사진")
                    if photo_tab.count() > 0:
                        photo_tab.click()
                        page.wait_for_timeout(1500)
                except Exception as e:
                    print(f"   - 사진 탭 없음: {str(e)[:30]}")

                # iframe 내부 이미지 추출
                images = frame.locator('img').all()
                urls = []

                for img in images:
                    try:
                        src = img.get_attribute("src")
                        if src and ("pup-review" in src or "ldb-phinf" in src or "blogfiles" in src):
                            urls.append(src)
                    except:
                        pass

                if urls:
                    # 가장 좋은 이미지 선택 (ldb-phinf 우선 - 업체 이미지)
                    best_url = None
                    for url in urls:
                        if "ldb-phinf" in url:
                            best_url = url
                            break

                    if not best_url:
                        best_url = urls[0]

                    # URL 정리 - 더 큰 버전 요청
                    if "type=w278" in best_url or "type=f320" in best_url:
                        best_url = best_url.replace("type=w278_sharpen", "type=w560_sharpen")
                        best_url = best_url.replace("type=f320_320", "type=f640_640")

                    cafe["image"] = best_url
                    print(f"   + 이미지 발견! ({len(urls)}개 중 선택)")
                    print(f"     {best_url[:70]}...")
                else:
                    print("   - 이미지 없음")

            except Exception as e:
                print(f"   X 에러: {str(e)[:50]}")

            time.sleep(1)  # Rate limiting

        browser.close()

    # 저장
    with open("data/cafes.json", "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)

    print("\n" + "=" * 60)
    print("완료! data/cafes.json 업데이트됨")
    print("=" * 60)

    # 결과 요약
    found = sum(1 for c in cafes if c.get("image"))
    print(f"\n이미지 발견: {found}/{len(cafes)}개 카페")

if __name__ == "__main__":
    extract_images_from_naver()
