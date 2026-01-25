"""
네이버 지도에서 실제 카페 사진 추출 (페이지 내부 탐색)
"""
from playwright.sync_api import sync_playwright
import json
import time
import re

def fetch_real_images():
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
        print("네이버 지도에서 실제 카페 사진 추출")
        print("=" * 60)

        for i, cafe in enumerate(cafes):
            print(f"\n[{i+1}/{len(cafes)}] {cafe['name']}...")

            naver_link = cafe.get("naver_link", "")
            if not naver_link:
                print("   ⚠️ 네이버 링크 없음")
                continue

            try:
                page.goto(naver_link, timeout=20000)
                page.wait_for_load_state("networkidle")
                page.wait_for_timeout(2000)

                image_url = None

                # 페이지 HTML에서 이미지 URL 직접 추출
                content = page.content()

                # pup-review-phinf.pstatic.net 이미지 찾기 (리뷰 이미지)
                review_imgs = re.findall(r'https://pup-review-phinf\.pstatic\.net/[^"\'>\s]+', content)
                if review_imgs:
                    # 가장 큰 이미지 선택 (type 파라미터 제거하고 큰 버전 요청)
                    for img in review_imgs[:5]:
                        if 'MjAyN' in img or 'MjAyN' in img:  # base64 encoded date
                            base_url = img.split('?')[0]
                            image_url = base_url
                            break
                    if not image_url and review_imgs:
                        image_url = review_imgs[0].split('?')[0]

                # ldb-phinf.pstatic.net 이미지 찾기 (장소 대표 이미지)
                if not image_url:
                    place_imgs = re.findall(r'https://ldb-phinf\.pstatic\.net/[^"\'>\s]+', content)
                    if place_imgs:
                        image_url = place_imgs[0].split('?')[0]

                # 검색 결과 페이지인 경우 첫 번째 결과 클릭
                if not image_url and "/search/" in naver_link:
                    try:
                        # 첫 번째 검색 결과 클릭
                        first_result = page.locator('a[href*="/place/"]').first
                        if first_result.count() > 0:
                            first_result.click()
                            page.wait_for_timeout(2000)
                            content = page.content()

                            # 다시 이미지 찾기
                            review_imgs = re.findall(r'https://pup-review-phinf\.pstatic\.net/[^"\'>\s]+', content)
                            if review_imgs:
                                image_url = review_imgs[0].split('?')[0]

                            if not image_url:
                                place_imgs = re.findall(r'https://ldb-phinf\.pstatic\.net/[^"\'>\s]+', content)
                                if place_imgs:
                                    image_url = place_imgs[0].split('?')[0]
                    except:
                        pass

                if image_url:
                    cafe["image"] = image_url
                    print(f"   ✅ 이미지 발견!")
                    print(f"      {image_url[:70]}...")
                else:
                    # 기본 이미지 유지 (SVG 폴백 사용)
                    cafe["image"] = None
                    print("   ⚠️ 실제 이미지 없음 (기본 이미지 사용)")

            except Exception as e:
                print(f"   ❌ 에러: {str(e)[:60]}")
                cafe["image"] = None

            time.sleep(1)

        browser.close()

    # 저장
    with open("data/cafes.json", "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)

    print("\n" + "=" * 60)
    print("완료!")
    print("=" * 60)

    found = sum(1 for c in cafes if c.get("image"))
    print(f"\n실제 이미지 발견: {found}/{len(cafes)}개 카페")

if __name__ == "__main__":
    fetch_real_images()
