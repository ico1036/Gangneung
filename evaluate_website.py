"""
안목 카페거리 웹사이트 종합 평가 스크립트
"""
from playwright.sync_api import sync_playwright
import json
import time

def evaluate_website():
    results = {
        "overall_score": 0,
        "categories": {},
        "issues": [],
        "recommendations": []
    }

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(viewport={"width": 1280, "height": 800})
        page = context.new_page()

        # Console 에러 수집
        console_errors = []
        page.on("console", lambda msg: console_errors.append(msg.text) if msg.type == "error" else None)

        print("=" * 60)
        print("안목 카페거리 웹사이트 종합 평가")
        print("=" * 60)

        # 1. 페이지 로드 성능
        print("\n[1/7] 페이지 로드 성능 테스트...")
        start_time = time.time()
        page.goto("http://localhost:8082/")
        page.wait_for_load_state("networkidle")
        load_time = time.time() - start_time

        perf_score = 100 if load_time < 1 else (80 if load_time < 2 else (60 if load_time < 3 else 40))
        results["categories"]["performance"] = {
            "score": perf_score,
            "load_time": f"{load_time:.2f}s",
            "status": "Good" if load_time < 2 else "Needs Improvement"
        }
        print(f"   로드 시간: {load_time:.2f}s - {'✅' if load_time < 2 else '⚠️'}")

        # 2. 콘텐츠 구조 검사
        print("\n[2/7] 콘텐츠 구조 검사...")
        title = page.title()
        h1_count = len(page.locator("h1").all())
        h2_count = len(page.locator("h2").all())
        nav_links = len(page.locator("nav a").all())
        cafe_cards = len(page.locator(".cafe-card").all())

        structure_score = 100
        if h1_count != 1:
            structure_score -= 20
            results["issues"].append(f"H1 태그가 {h1_count}개 (권장: 1개)")
        if nav_links < 3:
            structure_score -= 10
            results["issues"].append("네비게이션 링크 부족")

        results["categories"]["structure"] = {
            "score": structure_score,
            "title": title,
            "h1_count": h1_count,
            "h2_count": h2_count,
            "cafe_cards": cafe_cards
        }
        print(f"   페이지 타이틀: {title}")
        print(f"   H1: {h1_count}개, H2: {h2_count}개")
        print(f"   카페 카드: {cafe_cards}개 - {'✅' if cafe_cards >= 10 else '⚠️'}")

        # 3. 이미지 로딩 검사
        print("\n[3/7] 이미지 로딩 검사...")
        images = page.locator(".cafe-image img").all()
        image_count = len(images)
        broken_images = 0

        for img in images:
            natural_width = img.evaluate("el => el.naturalWidth")
            if natural_width == 0:
                broken_images += 1

        image_score = 100 - (broken_images * 10)
        results["categories"]["images"] = {
            "score": max(0, image_score),
            "total_images": image_count,
            "broken_images": broken_images,
            "status": "Good" if broken_images == 0 else f"{broken_images}개 이미지 로드 실패"
        }
        print(f"   총 이미지: {image_count}개")
        print(f"   깨진 이미지: {broken_images}개 - {'✅' if broken_images == 0 else '⚠️'}")

        # 4. JavaScript 기능 테스트
        print("\n[4/7] JavaScript 기능 테스트...")
        js_score = 100

        # 필터 테스트
        filter_btn = page.locator('button[data-filter="ocean"]')
        filter_btn.click()
        page.wait_for_timeout(300)
        filtered_cards = len(page.locator(".cafe-card").all())
        filter_works = filtered_cards < cafe_cards
        if not filter_works:
            js_score -= 30
            results["issues"].append("필터 기능 작동 안함")

        # 전체 버튼으로 복원
        page.locator('button[data-filter="all"]').click()
        page.wait_for_timeout(300)

        # 정렬 테스트
        page.locator("#sortSelect").select_option("rating")
        page.wait_for_timeout(300)
        first_card_name = page.locator(".cafe-card .cafe-name").first.text_content()
        sort_works = "하슬라가배" in first_card_name  # 평점 최고
        if not sort_works:
            js_score -= 30
            results["issues"].append("정렬 기능 작동 안함")

        results["categories"]["javascript"] = {
            "score": js_score,
            "filter_works": filter_works,
            "sort_works": sort_works
        }
        print(f"   필터 기능: {'✅ 정상' if filter_works else '❌ 오류'}")
        print(f"   정렬 기능: {'✅ 정상' if sort_works else '❌ 오류'}")

        # 5. 반응형 디자인 테스트
        print("\n[5/7] 반응형 디자인 테스트...")
        responsive_score = 100

        # 모바일 뷰포트
        page.set_viewport_size({"width": 375, "height": 812})
        page.wait_for_timeout(300)

        mobile_menu = page.locator(".mobile-menu-btn")
        mobile_menu_visible = mobile_menu.is_visible()

        nav_links_mobile = page.locator(".nav-links")
        nav_hidden = not nav_links_mobile.is_visible()

        if not mobile_menu_visible:
            responsive_score -= 30
            results["issues"].append("모바일 메뉴 버튼 없음")
        if not nav_hidden:
            responsive_score -= 20
            results["issues"].append("모바일에서 네비게이션 숨김 처리 안됨")

        # 데스크탑으로 복원
        page.set_viewport_size({"width": 1280, "height": 800})

        results["categories"]["responsive"] = {
            "score": responsive_score,
            "mobile_menu_visible": mobile_menu_visible,
            "nav_hidden_on_mobile": nav_hidden
        }
        print(f"   모바일 메뉴: {'✅ 표시됨' if mobile_menu_visible else '❌ 없음'}")
        print(f"   모바일 네비게이션: {'✅ 숨김처리' if nav_hidden else '⚠️ 개선 필요'}")

        # 6. 접근성 검사
        print("\n[6/7] 접근성 검사...")
        a11y_score = 100

        # 이미지 alt 속성
        images_without_alt = page.locator("img:not([alt])").count()
        if images_without_alt > 0:
            a11y_score -= images_without_alt * 5
            results["issues"].append(f"alt 속성 없는 이미지: {images_without_alt}개")

        # 버튼 aria-label
        buttons = page.locator("button").all()
        buttons_without_text = 0
        for btn in buttons:
            text = btn.text_content().strip()
            aria = btn.get_attribute("aria-label")
            if not text and not aria:
                buttons_without_text += 1

        if buttons_without_text > 0:
            a11y_score -= buttons_without_text * 10
            results["issues"].append(f"레이블 없는 버튼: {buttons_without_text}개")

        # 링크 텍스트
        empty_links = page.locator("a:not([aria-label])").all()
        links_without_text = sum(1 for link in empty_links if not link.text_content().strip())

        results["categories"]["accessibility"] = {
            "score": max(0, a11y_score),
            "images_without_alt": images_without_alt,
            "buttons_without_label": buttons_without_text
        }
        print(f"   이미지 alt 속성: {'✅ 모두 있음' if images_without_alt == 0 else f'⚠️ {images_without_alt}개 없음'}")
        print(f"   버튼 레이블: {'✅ 모두 있음' if buttons_without_text == 0 else f'⚠️ {buttons_without_text}개 없음'}")

        # 7. 콘솔 에러 검사
        print("\n[7/7] 콘솔 에러 검사...")
        error_count = len(console_errors)
        error_score = 100 - (error_count * 10)

        # favicon 에러는 무시
        real_errors = [e for e in console_errors if "favicon" not in e.lower()]

        results["categories"]["errors"] = {
            "score": max(0, 100 - len(real_errors) * 10),
            "error_count": len(real_errors),
            "errors": real_errors[:5]  # 최대 5개만
        }
        print(f"   JavaScript 에러: {len(real_errors)}개 - {'✅' if len(real_errors) == 0 else '❌'}")

        browser.close()

        # 종합 점수 계산
        scores = [cat["score"] for cat in results["categories"].values()]
        results["overall_score"] = sum(scores) / len(scores)

        # 권장사항 생성
        if results["categories"]["images"]["broken_images"] > 0:
            results["recommendations"].append("실제 카페 이미지를 추가하세요 (현재 기본 플레이스홀더 사용)")
        if results["categories"]["responsive"]["score"] < 100:
            results["recommendations"].append("모바일 메뉴 기능을 완성하세요")
        if results["categories"]["performance"]["score"] < 80:
            results["recommendations"].append("이미지 최적화 및 lazy loading 확인")

        # 결과 출력
        print("\n" + "=" * 60)
        print("평가 결과 요약")
        print("=" * 60)

        print(f"\n{'카테고리':<20} {'점수':>10}")
        print("-" * 35)
        for cat_name, cat_data in results["categories"].items():
            cat_display = {
                "performance": "성능",
                "structure": "콘텐츠 구조",
                "images": "이미지",
                "javascript": "JavaScript",
                "responsive": "반응형 디자인",
                "accessibility": "접근성",
                "errors": "에러"
            }.get(cat_name, cat_name)
            score = cat_data["score"]
            emoji = "🟢" if score >= 80 else ("🟡" if score >= 60 else "🔴")
            print(f"{cat_display:<20} {emoji} {score:>6.0f}점")

        print("-" * 35)
        overall = results["overall_score"]
        grade = "A+" if overall >= 95 else ("A" if overall >= 90 else ("B+" if overall >= 85 else ("B" if overall >= 80 else ("C" if overall >= 70 else "D"))))
        print(f"{'종합 점수':<20} {'⭐':>3} {overall:>5.1f}점 ({grade})")

        if results["issues"]:
            print(f"\n발견된 이슈 ({len(results['issues'])}개):")
            for issue in results["issues"]:
                print(f"  - {issue}")

        if results["recommendations"]:
            print(f"\n권장사항:")
            for rec in results["recommendations"]:
                print(f"  💡 {rec}")

        print("\n" + "=" * 60)

        return results

if __name__ == "__main__":
    evaluate_website()
