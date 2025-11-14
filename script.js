document.addEventListener('DOMContentLoaded', () => {

    // --- Прелоадер ---
    const preloader = document.getElementById('preloader');
    const preloaderVideo = document.getElementById('preloader-video');
    const mainContent = document.getElementById('main-content');
    const decorativeImages = document.querySelectorAll('.decorative-image');
    const preloaderContentWrapper = document.querySelector('.preloader-content-wrapper');
    const loveSong = new Audio('musicLove.mp3');

    const slider = document.getElementById('slider');
    const sliderTrackContainer = document.querySelector('.slider-track-container');
    // Проверяем, существует ли sliderTrackContainer
    const endCircle = sliderTrackContainer ? sliderTrackContainer.querySelector('.end-circle') : null;

    let sliderProgress;
    if (sliderTrackContainer) { // Создаем только если контейнер трека существует
        if (!document.querySelector('.slider-progress')) {
            sliderProgress = document.createElement('div');
            sliderProgress.classList.add('slider-progress');
            sliderTrackContainer.insertBefore(sliderProgress, endCircle);
        } else {
            sliderProgress = document.querySelector('.slider-progress');
        }
    } else {
        // Если sliderTrackContainer не существует, то и ползунка нет
        console.warn("Slider track container not found. Slider functionality will be disabled.");
        sliderProgress = null; // Устанавливаем в null, если нет контейнера
    }

    let isDraggingSlider = false;
    let isDraggingEndCircle = false;
    let initialX;
    let currentSliderX = 0;
    let currentEndCircleX = 0;

    // Переменные для определения точки разблокировки и максимального смещения
    let sliderUnlockPoint = 0;
    let endCircleMaxMove = 0;

    // --- Функции для обработки событий мыши и касаний ---

    function getClientX(event) {
        // Возвращает X-координату для событий мыши и касаний
        if (event.touches && event.touches.length > 0) {
            return event.touches[0].clientX;
        }
        return event.clientX;
    }

    function startDrag(event, element, type) {
        if (type === 'slider') {
            isDraggingSlider = true;
            slider.classList.add('dragging');
        } else if (type === 'endCircle' && endCircle) {
            isDraggingEndCircle = true;
            endCircle.classList.add('grabbing');
        }
        initialX = getClientX(event);
        // Предотвращаем стандартное поведение браузера (например, выделение текста)
        event.preventDefault();
    }

    function drag(event) {
        if (!isDraggingSlider && !isDraggingEndCircle) return;

        const clientX = getClientX(event);
        const deltaX = clientX - initialX;
        let newPos;

        if (isDraggingSlider) {
            newPos = currentSliderX + deltaX;
            // Ограничиваем движение ползунка
            if (newPos < 0) newPos = 0;
            if (newPos > sliderTrackContainer.offsetWidth - slider.offsetWidth) newPos = sliderTrackContainer.offsetWidth - slider.offsetWidth;

            slider.style.left = `${newPos}px`;
            currentSliderX = newPos;

            // Обновляем прогресс-полосу
            if (sliderProgress) {
                const progressWidth = (currentSliderX / (sliderTrackContainer.offsetWidth - slider.offsetWidth)) * 100;
                sliderProgress.style.width = `${progressWidth}%`;
            }

            // Проверяем, достиг ли ползунок точки разблокировки
            if (currentSliderX >= sliderUnlockPoint) {
                unlockContent();
            }

        } else if (isDraggingEndCircle && endCircle) {
            newPos = currentEndCircleX + deltaX;
            // Ограничиваем движение конечного круга
            if (newPos < 0) newPos = 0;
            if (newPos > endCircleMaxMove) newPos = endCircleMaxMove;

            endCircle.style.left = `${newPos}px`;
            currentEndCircleX = newPos;
        }
        // Обновляем initialX для следующего движения
        initialX = clientX;
    }

    function stopDrag() {
        if (isDraggingSlider) {
            isDraggingSlider = false;
            slider.classList.remove('dragging');
            // Если ползунок не доехал до конца, возвращаем его на место
            if (currentSliderX < sliderUnlockPoint) {
                currentSliderX = 0;
                slider.style.left = `${currentSliderX}px`;
                if (sliderProgress) sliderProgress.style.width = '0%';
            }
        }
        if (isDraggingEndCircle && endCircle) {
            isDraggingEndCircle = false;
            endCircle.classList.remove('grabbing');
        }
    }

    // --- Инициализация ползунков ---
    function initializeSlider() {
        if (!sliderTrackContainer || !slider || !endCircle) {
            console.warn("Не удалось инициализировать слайдер: отсутствуют необходимые элементы.");
            return; // Выходим, если нет контейнера трека
        }

        // Рассчитываем позиции после загрузки или изменения размера
        sliderUnlockPoint = sliderTrackContainer.offsetWidth / 2 - slider.offsetWidth / 2;
        endCircleMaxMove = sliderTrackContainer.offsetWidth - endCircle.offsetWidth;

        currentSliderX = 0;
        slider.style.left = `${currentSliderX}px`;
        if (sliderProgress) sliderProgress.style.width = '0%';

        currentEndCircleX = sliderTrackContainer.offsetWidth - endCircle.offsetWidth;
        endCircle.style.left = `${currentEndCircleX}px`;
    }

    // --- Привязка событий мыши ---
    if (slider) slider.addEventListener('mousedown', (e) => startDrag(e, slider, 'slider'));
    if (endCircle) endCircle.addEventListener('mousedown', (e) => startDrag(e, endCircle, 'endCircle'));
    document.addEventListener('mousemove', drag);
    document.addEventListener('mouseup', stopDrag);

    // --- Привязка событий касания ---
    if (slider) slider.addEventListener('touchstart', (e) => startDrag(e, slider, 'slider'));
    if (endCircle) endCircle.addEventListener('touchstart', (e) => startDrag(e, endCircle, 'endCircle'));
    document.addEventListener('touchmove', drag);
    document.addEventListener('touchend', stopDrag);

    // --- Позиционирование контента прелоадера ---
    function setPreloaderContentPosition() {
        if (window.innerWidth <= 768) {
            preloaderContentWrapper.classList.remove('center-on-desktop');
            preloaderContentWrapper.style.position = 'absolute';
            preloaderContentWrapper.style.bottom = '20px';
            preloaderContentWrapper.style.top = 'auto';
        } else {
            preloaderContentWrapper.classList.add('center-on-desktop');
            preloaderContentWrapper.style.position = 'absolute';
            preloaderContentWrapper.style.bottom = 'auto';
            preloaderContentWrapper.style.top = '50%';
        }
        initializeSlider(); // Пересчитываем позиции ползунков после изменения размера
    }

    // --- Анимация появления декоративных изображений ---
    function showDecorativeImages() {
        decorativeImages.forEach((img, index) => {
            setTimeout(() => {
                img.classList.add('visible');
            }, index * 300);
        });
    }

    // --- Функция разблокировки контента ---
    function unlockContent() {
        console.log("Разблокировка выполнена!");
        preloader.style.opacity = '0';
        mainContent.style.opacity = '1';
        preloaderVideo.pause();
        preloaderVideo.currentTime = 0;

        
        setTimeout(() => {
            preloader.style.display = 'none';
            mainContent.style.display = 'flex';
            showDecorativeImages();
            startMusic();
            startCountdown();
        }, 1000);

        if (!isMusicPlaying) {
        loveSong.play().catch(error => console.log("Воспроизведение музыки:", error));
        isMusicPlaying = true;
        playPauseButton.classList.remove('fa-play');
        playPauseButton.classList.add('fa-pause');
        }
    }

    // --- Таймер обратного отсчета ---
    const weddingDate = new Date("June 12, 2026 16:00:00").getTime(); // !!! Дата свадьбы !!!

    function startCountdown() {
        const interval = setInterval(() => {
            const now = new Date().getTime();
            const distance = weddingDate - now;

            const days = Math.floor(distance / (1000 * 60 * 60 * 24));
            const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((distance % (1000 * 60)) / 1000);

            document.getElementById('days').textContent = days < 10 ? '0' + days : days;
            document.getElementById('hours').textContent = hours < 10 ? '0' + hours : hours;
            document.getElementById('minutes').textContent = minutes < 10 ? '0' + minutes : minutes;
            document.getElementById('seconds').textContent = seconds < 10 ? '0' + seconds : seconds;

            if (distance < 0) {
                clearInterval(interval);
                document.querySelector('.countdown').innerHTML = "<span>Свадьба уже наступила!</span>";
            }
        }, 1000);
    }

    // --- Аудио ---
    
    playPauseButton.addEventListener('click', () => {
        if (isMusicPlaying) {
            loveSong.pause();
            playPauseButton.classList.remove('fa-pause');
            playPauseButton.classList.add('fa-play');
        } else {
            loveSong.play().catch(error => console.log("Воспроизведение музыки:", error));
            playPauseButton.classList.remove('fa-play');
            playPauseButton.classList.add('fa-pause');
        }
        isMusicPlaying = !isMusicPlaying;
    });

    loveSong.onerror = () => {
        console.error("Ошибка загрузки аудиофайла:", loveSong.src);
        audioControls.style.display = 'none';
        alert(`Ошибка загрузки аудиофайла: ${loveSong.src}. Проверьте путь и файл!`);
    };
    
    // --- ScrollReveal ---
    if (typeof ScrollReveal !== 'undefined') {
        const sr = ScrollReveal({
            origin: 'bottom', distance: '60px', duration: 1200, delay: 200,
            reset: false, useDelay: 'always', enter: 'slide up',
            easing: 'cubic-bezier(.36,.05,.57,.99)'
        });
        sr.reveal('.section', { interval: 200 });
    } else {
        console.warn("ScrollReveal library not found. Please ensure scrollreveal.min.js is linked correctly.");
    }

    // --- Начальная настройка ---
    if (mainContent) mainContent.style.display = 'none';
    preloader.style.opacity = '1';
    preloader.style.display = 'flex';
    if (mainContent) mainContent.style.opacity = '0';

    // --- Обработка первого взаимодействия пользователя для запуска музыки ---
    let userInteracted = false;
    document.addEventListener('click', () => {
        if (!userInteracted) {
            userInteracted = true;
            if (!isMusicPlaying) {
                startMusic();
            }
        }
    });

// --- Обработка клика по треку для сброса ползунка ---
// Убрал эту функцию, так как возвращение ползунка в начало, может ввести в заблуждение пользователя
    // --- Инициализация позиций и обработчиков ---
    setPreloaderContentPosition();
    // Инициализируем слайдер один раз при загрузке
    initializeSlider();
});
