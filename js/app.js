/**
 * 안목 카페거리 완벽가이드 - JavaScript
 */

// Cafe Data (loaded from JSON)
let cafesData = [];

// DOM Elements
const cafeGrid = document.getElementById('cafeGrid');
const sortSelect = document.getElementById('sortSelect');
const filterButtons = document.querySelectorAll('.filter-btn');
const modal = document.getElementById('cafeModal');
const modalBody = document.getElementById('modalBody');
const modalClose = document.querySelector('.modal-close');
const modalOverlay = document.querySelector('.modal-overlay');

// Current filter state
let currentFilter = 'all';

// Initialize
document.addEventListener('DOMContentLoaded', async () => {
  await loadCafesData();
  renderCafes();
  setupEventListeners();
});

// Load cafes data from JSON
async function loadCafesData() {
  try {
    const response = await fetch('data/cafes.json');
    const data = await response.json();
    cafesData = data.cafes;
    document.getElementById('totalCafes').textContent = cafesData.length;
  } catch (error) {
    console.error('Failed to load cafes data:', error);
    // Fallback: use embedded data
    cafesData = getEmbeddedCafesData();
  }
}

// Embedded cafes data as fallback
function getEmbeddedCafesData() {
  return [
    {
      id: 1,
      name: "미르마르",
      category: "카페,디저트",
      address: "강원 강릉시 창해로14번길 22",
      phone: "033-653-3130",
      hours: { daily: "09:30 - 21:30" },
      view_type: ["오션뷰", "루프탑"],
      signature_menu: [
        { name: "황치즈 돌체슈페너", price: 6900 },
        { name: "막걸리크림 라떼", price: 6900 },
        { name: "수제 냥들렌", price: 4000 }
      ],
      price_range: "₩₩",
      features: ["오션뷰", "루프탑", "4층 건물", "포토존", "주차"],
      naver_reviews: 4001,
      naver_rating: null,
      naver_link: "https://map.naver.com/p/entry/place/1933690279",
      tv_appearance: "2TV생생정보 614회",
      highlights: [
        "강릉 안목해변에 위치한 오션뷰 카페",
        "4층 루프탑과 통창이 있는 좌석 인기",
        "시그니처 음료: 핑크소금 라떼"
      ]
    },
    {
      id: 2,
      name: "보사노바 커피로스터스 강릉점",
      category: "카페,디저트",
      address: "강원 강릉시 창해로14번길 28",
      phone: "033-653-0038",
      hours: { weekdays: "07:30-22:00", saturday: "07:00-22:00", sunday: "07:00-22:00" },
      view_type: ["오션뷰"],
      signature_menu: [
        { name: "핸드드립 커피", price: 6500 },
        { name: "아메리카노", price: 5500 },
        { name: "피넛버터라떼", price: 6500 }
      ],
      price_range: "₩₩",
      features: ["오션뷰", "자체로스팅", "베이커리", "반려동물동반"],
      naver_reviews: 9146,
      naver_rating: 4.38,
      naver_link: "https://map.naver.com/p/entry/place/37093035",
      tv_appearance: "6시내고향 7492회",
      highlights: [
        "커피골목에서 가장 큰 규모의 매장",
        "자체 로스팅 원두 사용",
        "당일 생산 베이커리"
      ]
    },
    {
      id: 3,
      name: "스타벅스 강릉안목해변점",
      category: "카페",
      address: "강원 강릉시 창해로14번길 40",
      phone: "1522-3232",
      hours: { weekdays: "08:00-22:00", saturday: "07:00-22:00", sunday: "07:00-22:00" },
      view_type: ["오션뷰"],
      signature_menu: [
        { name: "아메리카노", price: 4500 },
        { name: "카페라떼", price: 5000 }
      ],
      price_range: "₩₩",
      features: ["오션뷰", "네이버주문"],
      naver_reviews: 8240,
      naver_rating: 4.43,
      naver_link: "https://map.naver.com/p/entry/place/33021650",
      highlights: [
        "안목해변 커피거리의 랜드마크",
        "바다를 바라보며 마시는 스타벅스"
      ]
    },
    {
      id: 4,
      name: "카페 뤼미에르",
      category: "카페,디저트",
      address: "강원 강릉시 창해로14번길 18",
      phone: "0507-1447-0225",
      hours: { weekdays: "08:30-23:00", sunday: "08:30-22:00" },
      view_type: ["오션뷰"],
      signature_menu: [
        { name: "딸기라떼", price: 7500 },
        { name: "안목바다에이드", price: 6800 },
        { name: "아몬드크림라떼", price: 6300 }
      ],
      price_range: "₩₩",
      features: ["오션뷰", "통창", "3층 건물", "브런치"],
      naver_reviews: 5469,
      naver_rating: 4.41,
      naver_link: "https://map.naver.com/p/entry/place/499938650",
      highlights: [
        "3층 건물 전체에서 바다 조망 가능",
        "딸기라떼가 대표 메뉴",
        "수제 디저트와 브런치 메뉴"
      ]
    },
    {
      id: 5,
      name: "순두부젤라또 2호점",
      category: "아이스크림",
      address: "강원 강릉시 경강로 2642 1~4층",
      phone: "0507-1483-5537",
      hours: { daily: "09:30-21:00" },
      view_type: null,
      signature_menu: [
        { name: "순두부젤라또", price: 5000 },
        { name: "흑임자젤라또", price: 5000 },
        { name: "인절미젤라또", price: 5000 }
      ],
      price_range: "₩",
      features: ["단체이용가능", "반려동물동반", "야외테라스"],
      naver_reviews: 9220,
      naver_rating: null,
      naver_link: "https://map.naver.com/p/entry/place/1838483274",
      tv_appearance: "THE맛있는녀석들 524회",
      highlights: [
        "강릉 명물 순두부젤라또 원조",
        "TV 맛있는녀석들 출연",
        "반려견 동반 시 야외 테라스 이용 가능"
      ]
    },
    {
      id: 6,
      name: "키크러스 강릉점",
      category: "카페,디저트",
      address: "강원 강릉시 견소동",
      view_type: ["오션뷰"],
      signature_menu: [
        { name: "키크러스 커피" },
        { name: "자몽타르트" },
        { name: "연탄빵" }
      ],
      price_range: "₩₩",
      features: ["오션뷰", "베이커리", "데이트"],
      naver_reviews: 6708,
      naver_rating: 4.23,
      naver_link: "https://map.naver.com/p/search/키크러스%20강릉점",
      tv_appearance: "생방송오늘저녁",
      highlights: [
        "안목해변 인기 카페",
        "자몽타르트와 연탄빵이 인기"
      ]
    },
    {
      id: 7,
      name: "커피 아메리카 강릉점",
      category: "카페",
      address: "강원 강릉시 견소동",
      view_type: ["오션뷰", "통창"],
      signature_menu: [
        { name: "진저라떼" },
        { name: "콩크림라떼" },
        { name: "크로플" }
      ],
      price_range: "₩₩",
      features: ["오션뷰", "통창뷰", "반려동물동반", "크로플"],
      naver_reviews: 3936,
      naver_rating: 4.34,
      naver_link: "https://map.naver.com/p/search/커피아메리카%20강릉점",
      highlights: [
        "통창뷰가 아름다운 오션뷰 카페",
        "반려견 동반 가능, 강아지 머핀 판매"
      ]
    },
    {
      id: 8,
      name: "커피커퍼 안목점",
      category: "카페",
      address: "강원 강릉시 견소동",
      view_type: ["오션뷰"],
      signature_menu: [
        { name: "특별한 커피" }
      ],
      price_range: "₩₩",
      features: ["오션뷰", "특별한 커피 추출"],
      naver_reviews: 1709,
      naver_rating: null,
      naver_link: "https://map.naver.com/p/search/커피커퍼%20안목점",
      tv_appearance: "모닝와이드",
      highlights: [
        "독특한 커피 추출 방식이 신기한 카페"
      ]
    },
    {
      id: 9,
      name: "커피씨엘",
      category: "카페",
      address: "강원 강릉시 견소동",
      view_type: ["오션뷰", "테라스"],
      signature_menu: [
        { name: "쑥라떼" },
        { name: "망고 스무디" },
        { name: "젤라또" }
      ],
      price_range: "₩₩",
      features: ["오션뷰", "테라스뷰", "젤라또"],
      naver_reviews: 2911,
      naver_rating: null,
      naver_link: "https://map.naver.com/p/search/커피씨엘",
      highlights: [
        "쑥라떼가 인기 메뉴",
        "2층 테라스에서 멋진 뷰"
      ]
    },
    {
      id: 10,
      name: "하슬라가배",
      category: "카페,디저트",
      address: "강원 강릉시 견소동",
      view_type: ["오션뷰"],
      signature_menu: [
        { name: "사이폰 커피" },
        { name: "두쫀쿠" }
      ],
      price_range: "₩₩",
      features: ["오션뷰", "사이폰커피", "예약가능"],
      naver_reviews: 1693,
      naver_rating: 4.52,
      naver_link: "https://map.naver.com/p/search/하슬라가배",
      highlights: [
        "사이폰 커피를 맛볼 수 있는 카페",
        "네이버 평점 4.52로 높은 평가"
      ]
    }
  ];
}

// Setup event listeners
function setupEventListeners() {
  // Filter buttons
  filterButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      filterButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentFilter = btn.dataset.filter;
      renderCafes();
    });
  });

  // Sort select
  sortSelect.addEventListener('change', renderCafes);

  // Modal close
  modalClose.addEventListener('click', closeModal);
  modalOverlay.addEventListener('click', closeModal);

  // Escape key to close modal
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.classList.contains('active')) {
      closeModal();
    }
  });

  // Mobile menu (placeholder)
  const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
  if (mobileMenuBtn) {
    mobileMenuBtn.addEventListener('click', () => {
      // TODO: Implement mobile menu toggle
      alert('모바일 메뉴 기능은 추후 업데이트됩니다.');
    });
  }
}

// Filter cafes based on current filter
function filterCafes(cafes) {
  if (currentFilter === 'all') return cafes;

  return cafes.filter(cafe => {
    const features = cafe.features || [];
    const viewTypes = cafe.view_type || [];
    const category = cafe.category || '';

    switch (currentFilter) {
      case 'ocean':
        return viewTypes.includes('오션뷰') || features.includes('오션뷰');
      case 'rooftop':
        return viewTypes.includes('루프탑') || features.includes('루프탑');
      case 'dessert':
        return category.includes('디저트') || category.includes('아이스크림') || features.includes('베이커리');
      case 'pet':
        return features.includes('반려동물동반') || cafe.pet_friendly;
      default:
        return true;
    }
  });
}

// Sort cafes based on selected option
function sortCafes(cafes) {
  const sortBy = sortSelect.value;

  return [...cafes].sort((a, b) => {
    switch (sortBy) {
      case 'reviews':
        return (b.naver_reviews || 0) - (a.naver_reviews || 0);
      case 'rating':
        return (b.naver_rating || 0) - (a.naver_rating || 0);
      case 'name':
        return a.name.localeCompare(b.name, 'ko');
      default:
        return 0;
    }
  });
}

// Render cafe cards
function renderCafes() {
  let cafes = filterCafes(cafesData);
  cafes = sortCafes(cafes);

  cafeGrid.innerHTML = cafes.map(cafe => createCafeCard(cafe)).join('');

  // Add click handlers to cards
  document.querySelectorAll('.cafe-card').forEach(card => {
    card.addEventListener('click', () => {
      const cafeId = parseInt(card.dataset.id);
      const cafe = cafesData.find(c => c.id === cafeId);
      if (cafe) openModal(cafe);
    });
  });
}

// Create cafe card HTML
function createCafeCard(cafe) {
  const hours = formatHours(cafe.hours);
  const rating = cafe.naver_rating ? `⭐ ${cafe.naver_rating}` : '-';
  const reviews = cafe.naver_reviews ? `리뷰 ${cafe.naver_reviews.toLocaleString()}개` : '';
  const tags = createTags(cafe);

  return `
    <article class="cafe-card" data-id="${cafe.id}">
      <div class="cafe-header">
        <h3 class="cafe-name">${cafe.name}</h3>
        <p class="cafe-category">${cafe.category}</p>
      </div>
      <div class="cafe-body">
        <p class="cafe-address">${cafe.address}</p>
        <p class="cafe-hours">${hours}</p>
        <div class="cafe-tags">${tags}</div>
      </div>
      <div class="cafe-footer">
        <span class="cafe-rating">${rating}</span>
        <span class="cafe-reviews">${reviews}</span>
      </div>
    </article>
  `;
}

// Format hours for display
function formatHours(hours) {
  if (!hours) return '영업시간 확인 필요';
  if (hours.daily) return hours.daily;
  if (hours.weekdays) return `평일 ${hours.weekdays}`;
  return '영업시간 확인 필요';
}

// Create tags HTML
function createTags(cafe) {
  const tags = [];
  const viewTypes = cafe.view_type || [];
  const features = cafe.features || [];

  if (viewTypes.includes('오션뷰') || features.includes('오션뷰')) {
    tags.push('<span class="cafe-tag ocean">오션뷰</span>');
  }
  if (viewTypes.includes('루프탑') || features.includes('루프탑')) {
    tags.push('<span class="cafe-tag rooftop">루프탑</span>');
  }
  if (features.includes('반려동물동반') || cafe.pet_friendly) {
    tags.push('<span class="cafe-tag pet">반려동물</span>');
  }
  if (cafe.category?.includes('디저트') || cafe.category?.includes('아이스크림')) {
    tags.push('<span class="cafe-tag dessert">디저트</span>');
  }

  return tags.slice(0, 4).join('');
}

// Open modal with cafe details
function openModal(cafe) {
  const menuItems = (cafe.signature_menu || []).map(item => `
    <div class="modal-menu-item">
      <span class="modal-menu-name">${item.name}</span>
      <span class="modal-menu-price">${item.price ? item.price.toLocaleString() + '원' : '-'}</span>
    </div>
  `).join('');

  const highlights = (cafe.highlights || []).map(h => `<li>${h}</li>`).join('');

  const tags = (cafe.features || []).map(f => `<span class="cafe-tag">${f}</span>`).join('');

  const hours = cafe.hours ? Object.entries(cafe.hours).map(([key, val]) => `
    <div class="modal-info-row">
      <span class="modal-info-label">${formatHoursKey(key)}</span>
      <span>${val}</span>
    </div>
  `).join('') : '<div class="modal-info-row"><span>영업시간 확인 필요</span></div>';

  modalBody.innerHTML = `
    <div class="modal-header">
      <h2 class="modal-title">${cafe.name}</h2>
      <p class="modal-category">${cafe.category}</p>
    </div>

    <div class="modal-section">
      <h4>기본 정보</h4>
      <div class="modal-info-row">
        <span class="modal-info-label">📍 주소</span>
        <span>${cafe.address}</span>
      </div>
      ${cafe.phone ? `
      <div class="modal-info-row">
        <span class="modal-info-label">📞 전화</span>
        <span>${cafe.phone}</span>
      </div>` : ''}
      ${hours}
      ${cafe.tv_appearance ? `
      <div class="modal-info-row">
        <span class="modal-info-label">📺 방송</span>
        <span>${cafe.tv_appearance}</span>
      </div>` : ''}
    </div>

    ${menuItems ? `
    <div class="modal-section">
      <h4>시그니처 메뉴</h4>
      ${menuItems}
    </div>` : ''}

    <div class="modal-section">
      <h4>특징</h4>
      <div class="modal-tags">${tags}</div>
    </div>

    ${highlights ? `
    <div class="modal-section">
      <h4>추천 포인트</h4>
      <ul class="modal-highlights">${highlights}</ul>
    </div>` : ''}

    <div class="modal-section">
      <h4>리뷰</h4>
      <div class="modal-info-row">
        ${cafe.naver_rating ? `<span>⭐ ${cafe.naver_rating}</span>` : ''}
        ${cafe.naver_reviews ? `<span>리뷰 ${cafe.naver_reviews.toLocaleString()}개</span>` : ''}
      </div>
    </div>

    <a href="${cafe.naver_link}" target="_blank" rel="noopener" class="modal-cta">
      네이버 지도에서 보기 →
    </a>
  `;

  modal.classList.add('active');
  document.body.style.overflow = 'hidden';
}

// Format hours key
function formatHoursKey(key) {
  const map = {
    daily: '매일',
    weekdays: '평일',
    saturday: '토요일',
    sunday: '일요일',
    last_order: '라스트오더'
  };
  return map[key] || key;
}

// Close modal
function closeModal() {
  modal.classList.remove('active');
  document.body.style.overflow = '';
}

// Smooth scroll for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function(e) {
    e.preventDefault();
    const target = document.querySelector(this.getAttribute('href'));
    if (target) {
      const headerOffset = 80;
      const elementPosition = target.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  });
});
