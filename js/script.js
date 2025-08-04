/**
 * DOMContentLoaded 이벤트 리스너: 문서 로드 후 모든 초기화 함수를 호출합니다.
 */
document.addEventListener('DOMContentLoaded', function () {
    initializeSidenav();
    setupSearchButtonAlert();
    loadAndRenderDynamicData();
    setupStickyHeader();
    setupSmoothScrollLinks();
});

/**
 * 사이드바(서랍 메뉴) 기능을 초기화하고 이벤트를 설정합니다.
 */
function initializeSidenav() {
    const openButton = document.getElementById('open-btn');
    const closeButton = document.getElementById('close-btn');
    const sideNavigation = document.getElementById('sidenav');
    const overlay = document.getElementById('sidenav-overlay');

    if (!openButton || !closeButton || !sideNavigation || !overlay) return;

    const openNav = () => {
        sideNavigation.style.left = '0';
        overlay.classList.add('active');
    };

    const closeNav = () => {
        sideNavigation.style.left = '-280px';
        overlay.classList.remove('active');
    };

    openButton.addEventListener('click', openNav);
    closeButton.addEventListener('click', closeNav);
    overlay.addEventListener('click', closeNav);
}

/**
 * 검색 버튼에 간단한 알림 기능을 설정합니다.
 */
function setupSearchButtonAlert() {
    const searchButton = document.querySelector('.search-box button');
    if (searchButton) {
        searchButton.addEventListener('click', () => alert('검색 기능은 구현되지 않았습니다. 백엔드 연동이 필요합니다.'));
    }
}

/**
 * 동적 데이터를 로드하고 각 슬라이더를 설정합니다.
 */
function loadAndRenderDynamicData() {
    fetch('data.json')
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            if (data.recommendItems) setupItemSlider('recommend-slider', data.recommendItems);
            if (data.trendingDestinations) setupItemSlider('trending-slider', data.trendingDestinations);
            if (data.amazingDeals) setupItemSlider('deal-slider', data.amazingDeals);
            if (data.hotLeisure) setupItemSlider('leisure-slider', data.hotLeisure);
            if (data.hotPerformances) setupItemSlider('performance-slider', data.hotPerformances);
            if (data.neighborhoodHotels) setupItemSlider('neighborhood-slider', data.neighborhoodHotels);
            if (data.monthlyLeisure) setupItemSlider('monthly-leisure-slider', data.monthlyLeisure);
        })
        .catch(error => {
            console.error('데이터 로드 및 렌더링 중 오류 발생:', error);
        });
}

/**
 * 반응형 슬라이더 기능을 설정하는 새로운 함수입니다.
 * @param {string} containerId - 슬라이더 컨테이너의 ID
 * @param {Array<Object>} items - 슬라이더에 표시할 아이템 데이터 배열
 */
function setupItemSlider(containerId, items) {
    const container = document.getElementById(containerId);
    if (!container || !items || items.length === 0) return;

    // 슬라이더의 기본 HTML 구조를 생성합니다.
    container.innerHTML = `
        <div class="item-slider-viewport">
            <div class="item-slider-track">
                ${items.map(item => `
                    <div class="item">
                        <div class="item-inner-wrapper">
                            <div class="item-inner">
                                <div class="item-img" style="background-image: url('${item.img}')"></div>
                                <h3>${item.title}</h3>
                                <p>${item.description}</p>
                            </div>
                        </div>
                    </div>
                `).join('')}
            </div>
        </div>
        <button class="slider-btn prev" disabled>&#10094;</button>
        <button class="slider-btn next">&#10095;</button>
    `;

    const track = container.querySelector('.item-slider-track');
    const prevBtn = container.querySelector('.prev');
    const nextBtn = container.querySelector('.next'); // 오타 수정: 'next' -> '.next'
    const allItems = container.querySelectorAll('.item');
    
    let currentIndex = 0;

    function updateSliderState() {
        const firstItem = allItems[0];
        if (!firstItem) return;

        const itemWidth = firstItem.offsetWidth;
        if (itemWidth === 0) return; // 너비가 0이면 계산하지 않음

        const containerWidth = container.offsetWidth;
        const itemsPerPage = Math.round(containerWidth / itemWidth);
        const maxIndex = Math.max(0, items.length - itemsPerPage);

        // 현재 인덱스가 최대치를 넘지 않도록 조정
        if (currentIndex > maxIndex) {
            currentIndex = maxIndex;
        }

        // 픽셀 기반으로 정확한 이동 거리 계산
        const offset = currentIndex * itemWidth;
        track.style.transform = `translateX(-${offset}px)`;

        // 버튼 활성화/비활성화 상태 업데이트
        prevBtn.disabled = currentIndex === 0;
        nextBtn.disabled = currentIndex >= maxIndex;
    }

    nextBtn.addEventListener('click', () => {
        const itemWidth = allItems[0].offsetWidth;
        const itemsPerPage = Math.round(container.offsetWidth / itemWidth);
        const maxIndex = Math.max(0, items.length - itemsPerPage);

        // 한 칸씩 이동
        if (currentIndex < maxIndex) {
            currentIndex++;
        }
        updateSliderState();
    });

    prevBtn.addEventListener('click', () => {
        // 한 칸씩 이동
        if (currentIndex > 0) {
            currentIndex--;
        }
        updateSliderState();
    });

    // 창 크기가 변경될 때 슬라이더 상태를 다시 계산
    window.addEventListener('resize', updateSliderState);

    // 이미지가 모두 로드된 후 정확한 계산을 위해, load 이벤트 사용
    window.addEventListener('load', () => {
        setTimeout(updateSliderState, 100); // 약간의 지연 후 최종 계산
    });
    
    // 초기 로드 시에도 한 번 실행
    setTimeout(updateSliderState, 100);
}

/**
 * 스크롤 시 헤더를 상단에 고정하는 기능을 설정합니다.
 */
function setupStickyHeader() {
    const headerElement = document.querySelector('header');
    if (!headerElement) return;
    const scrollActivationThreshold = 100;

    window.addEventListener('scroll', () => {
        if (window.pageYOffset > scrollActivationThreshold) {
            headerElement.classList.add('sticky');
        } else {
            headerElement.classList.remove('sticky');
        }
    });
}

/**
 * 내부 링크(#)에 부드러운 스크롤 기능을 설정합니다.
 */
function setupSmoothScrollLinks() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const href = this.getAttribute('href');
            // href가 #뿐이거나 비어있으면 아무것도 하지 않음
            if (!href || href.length <= 1) return;

            e.preventDefault();
            const targetElement = document.getElementById(href.substring(1));

            if (targetElement) {
                targetElement.scrollIntoView({ behavior: 'smooth' });

                // 링크가 사이드바 내부에 있다면, 사이드바를 닫음
                if (this.closest('#sidenav')) {
                    document.getElementById('sidenav').style.left = '-280px';
                    document.getElementById('sidenav-overlay').classList.remove('active');
                }
            }
        });
    });
}