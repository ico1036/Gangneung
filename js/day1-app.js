/**
 * 속초 여행 가이드 - JavaScript
 * 속초 맛집 + 속초 카페
 */

// Data (loaded from JSON)
let cafesData = [];
let restaurantsData = [];

// DOM Elements
const cafeGrid = document.getElementById('cafeGrid');
const sortSelect = document.getElementById('sortSelect');
const filterButtons = document.querySelectorAll('.filter-btn[data-filter]');
const modal = document.getElementById('cafeModal');
const modalBody = document.getElementById('modalBody');
const modalClose = document.querySelector('.modal-close');
const modalOverlay = document.querySelector('.modal-overlay');

// Restaurant DOM Elements
const restaurantGrid = document.getElementById('restaurantGrid');
const restaurantSortSelect = document.getElementById('restaurantSortSelect');
const restaurantFilterButtons = document.querySelectorAll('.filter-btn[data-restaurant-filter]');

// Tab DOM Elements
const tabButtons = document.querySelectorAll('.tab-btn');
const tabContents = document.querySelectorAll('.tab-content');

// Current filter state
let currentFilter = 'all';
let currentRestaurantFilter = 'all';

// Initialize
document.addEventListener('DOMContentLoaded', async () => {
  setupIntroPage();
  await Promise.all([loadCafesData(), loadRestaurantsData()]);
  renderCafes();
  renderRestaurants();
  setupEventListeners();
  setupTabNavigation();
});

// Setup Intro Page
function setupIntroPage() {
  const introPage = document.getElementById('introPage');
  const mainSite = document.getElementById('mainSite');
  const enterBtn = document.getElementById('enterSite');

  if (!introPage || !mainSite || !enterBtn) return;

  enterBtn.addEventListener('click', () => {
    showMainSite();
  });

  const logo = document.querySelector('.logo');
  if (logo) {
    logo.addEventListener('click', (e) => {
      e.preventDefault();
      showIntroPage();
    });
  }

  function showMainSite() {
    introPage.style.opacity = '0';
    introPage.style.transform = 'translateY(-20px)';
    introPage.style.transition = 'all 0.5s ease';

    setTimeout(() => {
      introPage.classList.add('hidden');
      mainSite.classList.add('visible');
      mainSite.style.opacity = '0';
      mainSite.style.transform = 'translateY(20px)';

      requestAnimationFrame(() => {
        mainSite.style.transition = 'all 0.5s ease';
        mainSite.style.opacity = '1';
        mainSite.style.transform = 'translateY(0)';
      });

      window.scrollTo(0, 0);
    }, 500);
  }

  function showIntroPage() {
    mainSite.style.opacity = '0';
    mainSite.style.transform = 'translateY(20px)';
    mainSite.style.transition = 'all 0.5s ease';

    setTimeout(() => {
      mainSite.classList.remove('visible');
      introPage.classList.remove('hidden');
      introPage.style.opacity = '0';
      introPage.style.transform = 'translateY(-20px)';

      requestAnimationFrame(() => {
        introPage.style.transition = 'all 0.5s ease';
        introPage.style.opacity = '1';
        introPage.style.transform = 'translateY(0)';
      });

      window.scrollTo(0, 0);
    }, 500);
  }
}

// Load cafes data from JSON
async function loadCafesData() {
  try {
    const response = await fetch('data/sokcho-cafes.json');
    const data = await response.json();
    cafesData = data.cafes;
    const totalEl = document.getElementById('totalCafes');
    if (totalEl) totalEl.textContent = cafesData.length;
  } catch (error) {
    console.error('Failed to load cafes data:', error);
    cafesData = [];
  }
}

// Load restaurants data from JSON
async function loadRestaurantsData() {
  try {
    const response = await fetch('data/sokcho-restaurants.json');
    const data = await response.json();
    restaurantsData = data.restaurants;
    const totalEl = document.getElementById('totalRestaurants');
    if (totalEl) totalEl.textContent = restaurantsData.length;
  } catch (error) {
    console.error('Failed to load restaurants data:', error);
    restaurantsData = [];
  }
}

// Setup Tab Navigation
function setupTabNavigation() {
  tabButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const tabName = btn.dataset.tab;

      tabButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      tabContents.forEach(content => {
        if (content.dataset.tabContent === tabName) {
          content.classList.add('active');
        } else {
          content.classList.remove('active');
        }
      });

      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  });
}

// Setup event listeners
function setupEventListeners() {
  // Cafe Filter buttons
  filterButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      filterButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentFilter = btn.dataset.filter;
      renderCafes();
    });
  });

  // Cafe Sort select
  if (sortSelect) {
    sortSelect.addEventListener('change', renderCafes);
  }

  // Restaurant Filter buttons
  restaurantFilterButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      restaurantFilterButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentRestaurantFilter = btn.dataset.restaurantFilter;
      renderRestaurants();
    });
  });

  // Restaurant Sort select
  if (restaurantSortSelect) {
    restaurantSortSelect.addEventListener('change', renderRestaurants);
  }

  // Modal close
  if (modalClose) modalClose.addEventListener('click', closeModal);
  if (modalOverlay) modalOverlay.addEventListener('click', closeModal);

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal && modal.classList.contains('active')) {
      closeModal();
    }
  });

  // Mobile menu
  const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
  if (mobileMenuBtn) {
    mobileMenuBtn.addEventListener('click', () => {
      alert('모바일 메뉴 기능은 추후 업데이트됩니다.');
    });
  }
}

// Filter cafes
function filterCafes(cafes) {
  if (currentFilter === 'all') return cafes;

  return cafes.filter(cafe => {
    const features = cafe.features || [];
    const viewTypes = cafe.view_type || [];
    const category = cafe.category || '';

    switch (currentFilter) {
      case 'mountain':
        return viewTypes.includes('설악산뷰') || viewTypes.includes('울산바위뷰') || features.includes('설악산뷰') || features.includes('울산바위뷰');
      case 'dessert':
        return category.includes('디저트') || category.includes('베이커리') || features.includes('디저트') || features.includes('베이커리');
      default:
        return true;
    }
  });
}

// Sort cafes
function sortCafes(cafes) {
  if (!sortSelect) return cafes;
  const sortBy = sortSelect.value;

  return [...cafes].sort((a, b) => {
    switch (sortBy) {
      case 'reviews':
        return (b.naver_reviews || 0) - (a.naver_reviews || 0);
      case 'name':
        return a.name.localeCompare(b.name, 'ko');
      default:
        return 0;
    }
  });
}

// Render cafe cards
function renderCafes() {
  if (!cafeGrid) return;

  let cafes = filterCafes(cafesData);
  cafes = sortCafes(cafes);

  cafeGrid.innerHTML = cafes.map(cafe => createCafeCard(cafe)).join('');

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
  const reviews = cafe.naver_reviews ? `리뷰 ${cafe.naver_reviews.toLocaleString()}개` : '';
  const tags = createCafeTags(cafe);

  return `
    <article class="cafe-card" data-id="${cafe.id}">
      <div class="cafe-header">
        <h3 class="cafe-name">${cafe.name}</h3>
        <p class="cafe-category">${cafe.category}</p>
      </div>
      <div class="cafe-body">
        <p class="cafe-address">${cafe.address}</p>
        <p class="cafe-hours">${hours}</p>
        ${cafe.closed_days ? `<p class="cafe-closed">${cafe.closed_days} 휴무</p>` : ''}
        <div class="cafe-tags">${tags}</div>
      </div>
      <div class="cafe-footer">
        <span class="cafe-reviews">${reviews}</span>
        <a href="${cafe.naver_link}" target="_blank" rel="noopener" class="restaurant-link" onclick="event.stopPropagation();">
          네이버 지도 &rarr;
        </a>
      </div>
    </article>
  `;
}

// Create tags for cafe
function createCafeTags(cafe) {
  const tags = [];
  const viewTypes = cafe.view_type || [];
  const features = cafe.features || [];

  if (viewTypes.includes('설악산뷰') || features.includes('설악산뷰')) {
    tags.push('<span class="cafe-tag rooftop">설악산뷰</span>');
  }
  if (viewTypes.includes('울산바위뷰') || features.includes('울산바위뷰')) {
    tags.push('<span class="cafe-tag rooftop">울산바위뷰</span>');
  }
  if (cafe.category?.includes('디저트') || features.includes('디저트')) {
    tags.push('<span class="cafe-tag dessert">디저트</span>');
  }
  if (cafe.category?.includes('베이커리') || features.includes('베이커리')) {
    tags.push('<span class="cafe-tag dessert">베이커리</span>');
  }

  return tags.slice(0, 4).join('');
}

// Format hours for display
function formatHours(hours) {
  if (!hours) return '영업시간 확인 필요';
  if (hours.daily) return hours.daily;
  if (hours.weekdays && hours.weekend) return `평일 ${hours.weekdays} / 주말 ${hours.weekend}`;
  if (hours.weekdays) return `평일 ${hours.weekdays}`;
  return '영업시간 확인 필요';
}

// Format hours key
function formatHoursKey(key) {
  const map = {
    daily: '매일',
    weekdays: '평일',
    weekend: '주말',
    saturday: '토요일',
    sunday: '일요일',
    last_order: '라스트오더'
  };
  return map[key] || key;
}

// Open modal with cafe details
function openModal(cafe) {
  const menuItems = (cafe.signature_menu || []).map(item => `
    <div class="modal-menu-item">
      <span class="modal-menu-name">${item.name}</span>
      <span class="modal-menu-price">${item.price ? item.price.toLocaleString() + '원' : item.description || '-'}</span>
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
      ${cafe.closed_days ? `
      <div class="modal-info-row">
        <span class="modal-info-label">🚫 정기휴무</span>
        <span style="color: #EF4444;">${cafe.closed_days}</span>
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

    <a href="${cafe.naver_link}" target="_blank" rel="noopener" class="modal-cta">
      네이버 지도에서 보기 &rarr;
    </a>
  `;

  modal.classList.add('active');
  document.body.style.overflow = 'hidden';
}

// Close modal
function closeModal() {
  if (modal) modal.classList.remove('active');
  document.body.style.overflow = '';
}

// ========================================
// Restaurant Functions
// ========================================

// Filter restaurants
function filterRestaurants(restaurants) {
  if (currentRestaurantFilter === 'all') return restaurants;

  return restaurants.filter(restaurant => {
    switch (currentRestaurantFilter) {
      case 'sokcho-city':
        return restaurant.location === 'sokcho-city';
      case 'daepo':
        return restaurant.location === 'daepo';
      case 'hotplace':
        return restaurant.is_hotplace;
      case 'group':
        return restaurant.group_friendly;
      default:
        return true;
    }
  });
}

// Sort restaurants
function sortRestaurants(restaurants) {
  if (!restaurantSortSelect) return restaurants;
  const sortBy = restaurantSortSelect.value;

  return [...restaurants].sort((a, b) => {
    switch (sortBy) {
      case 'reviews':
        return (b.naver_reviews || 0) - (a.naver_reviews || 0);
      case 'name':
        return a.name.localeCompare(b.name, 'ko');
      default:
        return 0;
    }
  });
}

// Render restaurant cards
function renderRestaurants() {
  if (!restaurantGrid) return;

  let restaurants = filterRestaurants(restaurantsData);
  restaurants = sortRestaurants(restaurants);

  restaurantGrid.innerHTML = restaurants.map(restaurant => createRestaurantCard(restaurant)).join('');

  document.querySelectorAll('.restaurant-card').forEach(card => {
    card.addEventListener('click', () => {
      const restaurantId = parseInt(card.dataset.id);
      const restaurant = restaurantsData.find(r => r.id === restaurantId);
      if (restaurant) openRestaurantModal(restaurant);
    });
  });
}

// Create restaurant card HTML
function createRestaurantCard(restaurant) {
  const dailyHours = restaurant.hours?.daily || '영업시간 확인 필요';
  const reviews = restaurant.naver_reviews ? restaurant.naver_reviews.toLocaleString() : '-';
  const tags = createRestaurantTags(restaurant);
  const hotplaceBadge = restaurant.is_hotplace ? '<div class="hotplace-badge">HOT</div>' : '';
  const hotplaceClass = restaurant.is_hotplace ? 'hotplace' : '';

  let breakTimeHtml = '';
  if (restaurant.break_time) {
    breakTimeHtml = `<p class="restaurant-break">브레이크타임 ${restaurant.break_time}</p>`;
  }

  let closedDaysHtml = '';
  if (restaurant.closed_days) {
    closedDaysHtml = `<p class="restaurant-closed">${restaurant.closed_days} 휴무</p>`;
  }

  return `
    <article class="restaurant-card ${hotplaceClass}" data-id="${restaurant.id}">
      ${hotplaceBadge}
      <div class="restaurant-header">
        <h3 class="restaurant-name">${restaurant.name}</h3>
        <p class="restaurant-category">
          ${restaurant.category}
          <span class="restaurant-location-badge">${restaurant.location_name}</span>
        </p>
      </div>
      <div class="restaurant-body">
        <p class="restaurant-address">${restaurant.address}</p>
        <p class="restaurant-hours">${dailyHours}</p>
        ${breakTimeHtml}
        ${closedDaysHtml}
        <div class="restaurant-tags">${tags}</div>
      </div>
      <div class="restaurant-footer">
        <span class="restaurant-reviews">리뷰 <strong>${reviews}</strong>개</span>
        <a href="${restaurant.naver_link}" target="_blank" rel="noopener" class="restaurant-link" onclick="event.stopPropagation();">
          네이버 지도 &rarr;
        </a>
      </div>
    </article>
  `;
}

// Create tags HTML for restaurant
function createRestaurantTags(restaurant) {
  const tags = [];
  const features = restaurant.features || [];

  if (restaurant.group_friendly) {
    tags.push('<span class="restaurant-tag group">단체 가능</span>');
  }
  if (restaurant.is_hotplace) {
    tags.push('<span class="restaurant-tag hotplace">핫플</span>');
  }
  if (features.includes('예약')) {
    tags.push('<span class="restaurant-tag breakfast">예약 가능</span>');
  }

  return tags.slice(0, 4).join('');
}

// Open modal with restaurant details
function openRestaurantModal(restaurant) {
  const menuItems = (restaurant.signature_menu || []).map(item => `
    <div class="modal-menu-item">
      <span class="modal-menu-name">${item.name}</span>
      <span class="modal-menu-price">${item.description || ''}</span>
    </div>
  `).join('');

  const highlights = (restaurant.highlights || []).map(h => `<li>${h}</li>`).join('');
  const tags = (restaurant.features || []).map(f => `<span class="cafe-tag">${f}</span>`).join('');

  const dailyHours = restaurant.hours?.daily || '영업시간 확인 필요';

  let hoursHtml = `
    <div class="modal-info-row">
      <span class="modal-info-label">🕐 영업시간</span>
      <span style="color: #10B981; font-weight: 600;">${dailyHours}</span>
    </div>
  `;

  if (restaurant.break_time) {
    hoursHtml += `
      <div class="modal-info-row">
        <span class="modal-info-label">⏸️ 브레이크</span>
        <span style="color: #F59E0B;">${restaurant.break_time}</span>
      </div>
    `;
  }

  if (restaurant.closed_days) {
    hoursHtml += `
      <div class="modal-info-row">
        <span class="modal-info-label">🚫 정기휴무</span>
        <span style="color: #EF4444;">${restaurant.closed_days}</span>
      </div>
    `;
  }

  modalBody.innerHTML = `
    <div class="modal-header" style="background: linear-gradient(135deg, #065F46 0%, #10B981 100%);">
      <h2 class="modal-title">${restaurant.name}</h2>
      <p class="modal-category">${restaurant.category} · ${restaurant.location_name}</p>
    </div>

    <div class="modal-section">
      <h4>기본 정보</h4>
      <div class="modal-info-row">
        <span class="modal-info-label">📍 주소</span>
        <span>${restaurant.address}</span>
      </div>
      ${restaurant.phone ? `
      <div class="modal-info-row">
        <span class="modal-info-label">📞 전화</span>
        <span>${restaurant.phone}</span>
      </div>` : ''}
      ${hoursHtml}
    </div>

    ${menuItems ? `
    <div class="modal-section">
      <h4>대표 메뉴</h4>
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

    ${restaurant.naver_reviews ? `
    <div class="modal-section">
      <h4>리뷰</h4>
      <div class="modal-info-row">
        <span>리뷰 ${restaurant.naver_reviews.toLocaleString()}개</span>
        ${restaurant.is_hotplace ? `<span style="color: #EF4444; margin-left: 12px;">🔥 핫플레이스</span>` : ''}
      </div>
    </div>` : ''}

    <a href="${restaurant.naver_link}" target="_blank" rel="noopener" class="modal-cta" style="background: #10B981;">
      네이버 지도에서 보기 &rarr;
    </a>
  `;

  modal.classList.add('active');
  document.body.style.overflow = 'hidden';
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
