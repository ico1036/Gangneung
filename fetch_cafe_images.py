"""
네이버 지도에서 카페 이미지 URL 추출
"""
from playwright.sync_api import sync_playwright
import json
import time

def fetch_cafe_images():
    # 카페 데이터 로드
    with open("data/cafes.json", "r", encoding="utf-8") as f:
        data = json.load(f)

    cafes = data["cafes"]

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(
            user_agent="Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36"
        )
        page = context.new_page()

        print("=" * 60)
        print("네이버 지도에서 카페 이미지 추출")
        print("=" * 60)

        for i, cafe in enumerate(cafes):
            print(f"\n[{i+1}/{len(cafes)}] {cafe['name']}...")

            naver_link = cafe.get("naver_link", "")
            if not naver_link:
                print("   ⚠️ 네이버 링크 없음")
                continue

            try:
                # 네이버 지도 페이지 방문
                page.goto(naver_link, timeout=15000)
                page.wait_for_timeout(2000)

                # 이미지 추출 시도 (여러 셀렉터 시도)
                image_url = None

                # 방법 1: OG 이미지 메타 태그
                og_image = page.locator('meta[property="og:image"]').first
                if og_image.count() > 0:
                    image_url = og_image.get_attribute("content")

                # 방법 2: 메인 이미지 영역
                if not image_url:
                    main_img = page.locator('div[class*="place_thumb"] img, div[class*="photo"] img').first
                    if main_img.count() > 0:
                        image_url = main_img.get_attribute("src")

                # 방법 3: 큰 이미지 찾기
                if not image_url:
                    all_imgs = page.locator('img[src*="pstatic.net"]').all()
                    for img in all_imgs:
                        src = img.get_attribute("src")
                        if src and ("place" in src or "review" in src or "blogfiles" in src):
                            # 작은 썸네일 제외
                            if "type=f" not in src or "type=f180" in src or "type=f300" in src:
                                image_url = src
                                break

                if image_url:
                    # 이미지 URL 정리 (더 큰 버전으로)
                    if "type=f" in image_url:
                        image_url = image_url.split("?")[0] + "?type=f640_640"

                    cafe["image"] = image_url
                    print(f"   ✅ 이미지 발견: {image_url[:60]}...")
                else:
                    print("   ⚠️ 이미지를 찾지 못함")

            except Exception as e:
                print(f"   ❌ 에러: {str(e)[:50]}")

            time.sleep(1)  # Rate limiting

        browser.close()

    # 업데이트된 데이터 저장
    with open("data/cafes.json", "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)

    print("\n" + "=" * 60)
    print("완료! data/cafes.json 업데이트됨")
    print("=" * 60)

    # 결과 요약
    found = sum(1 for c in cafes if c.get("image"))
    print(f"\n이미지 발견: {found}/{len(cafes)}개 카페")

if __name__ == "__main__":
    fetch_cafe_images()
