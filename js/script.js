/**
 * DOMContentLoaded 이벤트 리스너: 문서 로드 후 모든 초기화 함수를 호출합니다.
 */
document.addEventListener('DOMContentLoaded', function () {
    initializeSidenav();
    setupSearchButtonAlert();
    loadAndRenderDynamicData();
    setupStickyHeader();
    setupSmoothScrollLinks(); // 새로운 함수 호출 추가
});

/**
 * 사이드바(서랍 메뉴) 기능을 초기화하고 이벤트를 설정합니다.
 * 햄버거 버튼 클릭 시 사이드바를 열고, 닫기 버튼 또는 오버레이 클릭 시 닫습니다.
 */
function initializeSidenav() {
    const openButton = document.getElementById('open-btn');
    const closeButton = document.getElementById('close-btn');
    const sideNavigation = document.getElementById('sidenav');
    const overlay = document.getElementById('sidenav-overlay');

    // 필수 요소가 없으면 함수 실행 중단
    if (!openButton || !closeButton || !sideNavigation || !overlay) return;

    /**
     * 사이드바를 엽니다.
     */
    const openNav = () => {
        sideNavigation.style.left = '0';
        overlay.classList.add('active');
    };

    /**
     * 사이드바를 닫습니다.
     */
    const closeNav = () => {
        sideNavigation.style.left = '-280px';
        overlay.classList.remove('active');
    };

    // 이벤트 리스너 연결
    openButton.addEventListener('click', openNav);
    closeButton.addEventListener('click', closeNav);
    overlay.addEventListener('click', closeNav);
}

/**
 * 검색 버튼에 간단한 알림 기능을 설정합니다.
 * 실제 검색 기능은 백엔드 연동이 필요합니다.
 */
function setupSearchButtonAlert() {
    const searchButton = document.querySelector('.search-box button');
    if (searchButton) {
        searchButton.addEventListener('click', () => alert('검색 기능은 구현되지 않았습니다. 백엔드 연동이 필요합니다.'));
    }
}

/**
 * 페이지에 필요한 모든 동적 데이터를 로드하고 해당 섹션에 렌더링을 지시합니다.
 * 이 함수는 data.json 파일에서 데이터를 가져오지만, 실제 서비스에서는 백엔드 API를 통해 데이터를 받아와야 합니다.
 */
function loadAndRenderDynamicData() {
    // TODO: 백엔드 API 엔드포인트로 변경 필요
    // 예시: fetch('/api/data')
    fetch('data.json')
        .then(response => {
            if (!response.ok) {
                // HTTP 응답이 성공적이지 않을 경우 에러 발생
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            const itemsPerPage = 5; // 모든 슬라이더에 표시할 아이템 수 설정

            // 각 데이터 카테고리에 대해 슬라이더를 설정합니다.
            // 백엔드 개발자는 이 데이터 구조를 참고하여 API 응답을 구성할 수 있습니다.
            if (data.recommendItems) {
                setupItemSlider('recommend-slider', data.recommendItems, itemsPerPage);
            }
            if (data.trendingDestinations) {
                setupItemSlider('trending-slider', data.trendingDestinations, itemsPerPage);
            }
            if (data.amazingDeals) {
                setupItemSlider('deal-slider', data.amazingDeals, itemsPerPage);
            }
            if (data.hotLeisure) {
                setupItemSlider('leisure-slider', data.hotLeisure, itemsPerPage);
            }
            if (data.hotPerformances) {
                setupItemSlider('performance-slider', data.hotPerformances, itemsPerPage);
            }
            if (data.neighborhoodHotels) {
                setupItemSlider('neighborhood-slider', data.neighborhoodHotels, itemsPerPage);
            }
            if (data.monthlyLeisure) {
                setupItemSlider('monthly-leisure-slider', data.monthlyLeisure, itemsPerPage);
            }
        })
        .catch(error => {
            console.error('데이터 로드 및 렌더링 중 오류 발생:', error);
        });
}

/**
 * 지정된 컨테이너에 아이템 슬라이더를 생성하고 모든 기능을 설정합니다.
 * @param {string} containerId - 슬라이더가 렌더링될 부모 요소의 DOM ID.
 * @param {Array<Object>} items - 슬라이더에 표시할 아이템 데이터 배열. 각 아이템은 img, title, description 속성을 포함해야 합니다.
 * @param {number} itemsPerPage - 슬라이더에 한 번에 보여줄 아이템의 수.
 */
function setupItemSlider(containerId, items, itemsPerPage) {
    const containerElement = document.getElementById(containerId);
    // 컨테이너 요소가 없거나 아이템이 없으면 함수 실행 중단
    if (!containerElement || items.length === 0) return;

    // 슬라이더의 기본 HTML 구조를 생성합니다.
    containerElement.innerHTML = `
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
        <button class="slider-btn prev disabled">&#10094;</button>
        <button class="slider-btn next">&#10095;</button>
    `;

    const trackElement = containerElement.querySelector('.item-slider-track');
    const previousButton = containerElement.querySelector('.prev');
    const nextButton = containerElement.querySelector('.next');
    const totalItems = items.length;
    // 슬라이더가 이동할 수 있는 최대 인덱스 (마지막 페이지)
    const maxIndex = totalItems - itemsPerPage;
    let currentIndex = 0; // 현재 슬라이더의 시작 인덱스

    /**
     * 슬라이더의 위치를 업데이트하고 버튼의 활성화/비활성화 상태를 조절합니다.
     */
    function updateSliderPosition() {
        // 현재 인덱스에 따라 track 요소를 X축으로 이동시킵니다.
        const offset = currentIndex * (100 / itemsPerPage);
        trackElement.style.transform = `translateX(-${offset}%)`;
        updateNavigationButtons();
    }

    /**
     * 슬라이더 네비게이션 버튼(이전/다음)의 활성화/비활성화 상태를 업데이트합니다.
     */
    function updateNavigationButtons() {
        previousButton.classList.toggle('disabled', currentIndex === 0);
        nextButton.classList.toggle('disabled', currentIndex >= maxIndex);
    }

    // 다음 버튼 클릭 이벤트 리스너
    nextButton.addEventListener('click', () => {
        if (currentIndex < maxIndex) {
            currentIndex++;
            updateSliderPosition();
        }
    });

    // 이전 버튼 클릭 이벤트 리스너
    previousButton.addEventListener('click', () => {
        if (currentIndex > 0) {
            currentIndex--;
            updateSliderPosition();
        }
    });

    // 초기 슬라이더 위치 및 버튼 상태 설정
    updateSliderPosition();
}

/**
 * 스크롤 시 헤더를 고정하는 기능을 설정합니다.
 * 사용자가 일정량 스크롤하면 헤더가 상단에 고정됩니다.
 */
function setupStickyHeader() {
    const headerElement = document.querySelector('header');
    const scrollActivationThreshold = 100; // 헤더가 고정될 스크롤 임계값 (px)

    window.addEventListener('scroll', () => {
        if (window.pageYOffset > scrollActivationThreshold) {
            headerElement.classList.add('sticky');
        } else {
            headerElement.classList.remove('sticky');
        }
    });
}

/**
 * 사이드바 및 기타 내부 링크에 부드러운 스크롤 기능을 설정합니다.
 * #으로 시작하는 모든 링크에 대해 클릭 시 해당 섹션으로 부드럽게 스크롤 이동합니다.
 */
function setupSmoothScrollLinks() {
    const sidebarLinks = document.querySelectorAll('#sidenav a[href^="#"]');
    const allPageLinks = document.querySelectorAll('a[href^="#"]');

    // 사이드바 링크에 이벤트 리스너 추가
    sidebarLinks.forEach(link => {
        link.addEventListener('click', function(event) {
            console.log('Sidebar link clicked:', this.getAttribute('href')); // 디버깅을 위한 로그 추가
            event.preventDefault(); // 기본 앵커 동작 방지
            const targetId = this.getAttribute('href').substring(1); // # 제거
            const targetElement = document.getElementById(targetId);

            if (targetElement) {
                targetElement.scrollIntoView({ behavior: 'smooth' });
                // 사이드바 닫기
                document.getElementById('sidenav').style.left = '-280px';
                document.getElementById('sidenav-overlay').classList.remove('active');
            }
        });
    });

    // 페이지 내 다른 # 링크에도 부드러운 스크롤 적용 (선택 사항)
    allPageLinks.forEach(link => {
        // 사이드바 링크는 위에서 처리했으므로 제외
        if (!link.closest('#sidenav')) {
            link.addEventListener('click', function(event) {
                const href = this.getAttribute('href');
                if (href && href.startsWith('#') && href.length > 1) {
                    event.preventDefault();
                    const targetId = href.substring(1);
                    const targetElement = document.getElementById(targetId);
                    if (targetElement) {
                        targetElement.scrollIntoView({ behavior: 'smooth' });
                    }
                }
            });
        }
    });
}
