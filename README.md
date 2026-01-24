# 안목 카페거리 완벽가이드

강릉 안목해변의 검증된 카페 정보를 제공하는 웹사이트입니다.

## 특징

- 10개 카페 정보 (네이버 지도 기반 검증)
- 필터링 기능 (오션뷰, 루프탑, 디저트, 반려동물)
- 정렬 기능 (리뷰순, 평점순, 이름순)
- 추천 코스 안내
- 반응형 디자인

## 기술 스택

- HTML5
- CSS3 (CSS Variables, Flexbox, Grid)
- Vanilla JavaScript (ES6+)
- Google Fonts (Noto Sans KR)

## 파일 구조

```
/
├── index.html          # 메인 페이지
├── css/
│   └── style.css       # 스타일시트
├── js/
│   └── app.js          # JavaScript 앱
├── data/
│   └── cafes.json      # 카페 데이터
├── docs/
│   ├── WEBSITE_PLAN.md # 기획서
│   └── cafes/          # 카페별 MD 파일
└── README.md
```

## 로컬 실행

```bash
# Python 3
python -m http.server 8000

# Node.js
npx serve
```

브라우저에서 `http://localhost:8000` 접속

## GitHub Pages 배포

1. GitHub에 저장소 생성
2. 코드 푸시
3. Settings > Pages에서 Source를 main branch의 root로 설정

## 카페 목록

1. 미르마르 - 오션뷰 루프탑 카페
2. 보사노바 커피로스터스 - 자체 로스팅
3. 스타벅스 강릉안목해변점 - 랜드마크
4. 카페 뤼미에르 - 딸기라떼 맛집
5. 순두부젤라또 2호점 - 강릉 명물
6. 키크러스 강릉점 - 자몽타르트
7. 커피 아메리카 강릉점 - 반려동물 동반
8. 커피커퍼 안목점 - 독특한 추출
9. 커피씨엘 - 쑥라떼 인기
10. 하슬라가배 - 사이폰 커피

## 업데이트

- 2026.01.25: 최초 버전 배포

## 라이선스

MIT License
