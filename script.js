// Персональный сайт Александра Болотова
// Чистый vanilla JavaScript без внешних зависимостей

document.addEventListener('DOMContentLoaded', () => {
    initStarfield();
    initParallax();
    initScrollAnimations();
    initCounters();
    initMobileNav();
    initCustomCursor();
    initSubscribeForm();
    initTypewriter();
});

// Инициализация звёздного поля на canvas
function initStarfield() {
    const canvas = document.getElementById('starfield');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    let stars = [];
    let animationId;
    
    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        createStars();
    }
    
    function createStars() {
        stars = [];
        const starCount = Math.floor((canvas.width * canvas.height) / 8000);
        
        for (let i = 0; i < starCount; i++) {
            stars.push({
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height,
                radius: Math.random() * 1.5,
                opacity: Math.random() * 0.8 + 0.2,
                twinkleSpeed: Math.random() * 0.02 + 0.01,
                twinklePhase: Math.random() * Math.PI * 2
            });
        }
    }
    
    function drawStars() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        const time = Date.now() * 0.001;
        
        for (let i = 0; i < stars.length; i++) {
            const star = stars[i];
            const twinkle = Math.sin(time * star.twinkleSpeed + star.twinklePhase) * 0.3 + 0.7;
            const opacity = star.opacity * twinkle;
            
            ctx.beginPath();
            ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(255, 255, 255, ${opacity})`;
            ctx.fill();
            
            // Небольшое свечение для ярких звёзд
            if (star.radius > 1) {
                ctx.beginPath();
                ctx.arc(star.x, star.y, star.radius * 2, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(0, 229, 255, ${opacity * 0.3})`;
                ctx.fill();
            }
        }
    }
    
    function animate() {
        // Проверка prefers-reduced-motion
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            return;
        }
        
        // Проверка видимости вкладки
        if (document.hidden) {
            animationId = requestAnimationFrame(animate);
            return;
        }
        
        drawStars();
        animationId = requestAnimationFrame(animate);
    }
    
    resizeCanvas();
    animate();
    
    window.addEventListener('resize', () => {
        resizeCanvas();
    });
    
    document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
            cancelAnimationFrame(animationId);
        } else {
            animate();
        }
    });
}

// Параллакс-эффект
function initParallax() {
    const parallaxStars = document.querySelector('.hero-parallax-stars');
    const parallaxParticles = document.querySelector('.hero-parallax-particles');
    const heroContent = document.querySelector('.hero-content');
    
    if (!parallaxStars || !parallaxParticles) return;
    
    // Проверка prefers-reduced-motion
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        parallaxStars.style.transform = 'none';
        parallaxParticles.style.transform = 'none';
        if (heroContent) heroContent.style.transform = 'none';
        return;
    }
    
    let mouseX = 0;
    let mouseY = 0;
    let scrollY = 0;
    
    function updateParallax() {
        const moveX = (mouseX - window.innerWidth / 2) * 0.01;
        const moveY = (mouseY - window.innerHeight / 2) * 0.01;
        const scrollMove = scrollY * 0.3;
        
        parallaxStars.style.transform = `translate(${moveX * 0.5}px, ${moveY * 0.5 + scrollMove * 0.3}px)`;
        parallaxParticles.style.transform = `translate(${moveX * 0.3}px, ${moveY * 0.3 + scrollMove * 0.5}px)`;
        
        if (heroContent) {
            heroContent.style.transform = `translate(${moveX * 0.2}px, ${moveY * 0.2 + scrollMove * 0.2}px)`;
        }
    }
    
    // Throttle для mousemove
    let mouseThrottle = false;
    document.addEventListener('mousemove', (e) => {
        if (mouseThrottle) return;
        mouseThrottle = true;
        
        mouseX = e.clientX;
        mouseY = e.clientY;
        updateParallax();
        
        setTimeout(() => {
            mouseThrottle = false;
        }, 16); // ~60fps
    });
    
    // Throttle для scroll
    let scrollThrottle = false;
    window.addEventListener('scroll', () => {
        if (scrollThrottle) return;
        scrollThrottle = true;
        
        scrollY = window.scrollY;
        updateParallax();
        
        setTimeout(() => {
            scrollThrottle = false;
        }, 16);
    });
    
    updateParallax();
}

// Анимации при скролле
function initScrollAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);
    
    const elements = document.querySelectorAll('.fade-in-on-scroll');
    elements.forEach(el => {
        observer.observe(el);
    });
}

// Анимированные счётчики
function initCounters() {
    const counterOptions = {
        threshold: 0.5
    };
    
    const counterObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const counter = entry.target.querySelector('.stat-number');
                if (!counter) return;
                
                const target = parseInt(counter.getAttribute('data-count'));
                const duration = 2000;
                const startTime = Date.now();
                
                function updateCounter() {
                    const currentTime = Date.now();
                    const progress = Math.min((currentTime - startTime) / duration, 1);
                    
                    // Easing function
                    const easeOutQuart = 1 - Math.pow(1 - progress, 4);
                    const current = Math.floor(easeOutQuart * target);
                    
                    counter.textContent = current.toLocaleString('ru-RU');
                    
                    if (progress < 1) {
                        requestAnimationFrame(updateCounter);
                    } else {
                        counter.textContent = target.toLocaleString('ru-RU');
                    }
                }
                
                updateCounter();
                counterObserver.unobserve(entry.target);
            }
        });
    }, counterOptions);
    
    const statCards = document.querySelectorAll('.stat-card');
    statCards.forEach(card => {
        counterObserver.observe(card);
    });
}

// Мобильное меню
function initMobileNav() {
    const navToggle = document.querySelector('.nav-toggle');
    const navMenu = document.querySelector('.nav-menu');
    const navLinks = document.querySelectorAll('.nav-link');
    
    if (!navToggle || !navMenu) return;
    
    navToggle.addEventListener('click', () => {
        const isActive = navMenu.classList.contains('active');
        
        if (isActive) {
            navMenu.classList.remove('active');
            navToggle.setAttribute('aria-expanded', 'false');
        } else {
            navMenu.classList.add('active');
            navToggle.setAttribute('aria-expanded', 'true');
        }
    });
    
    // Закрытие меню при клике на ссылку
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            navMenu.classList.remove('active');
            navToggle.setAttribute('aria-expanded', 'false');
        });
    });
    
    // Закрытие меню при клике вне
    document.addEventListener('click', (e) => {
        if (!navToggle.contains(e.target) && !navMenu.contains(e.target)) {
            navMenu.classList.remove('active');
            navToggle.setAttribute('aria-expanded', 'false');
        }
    });
}

// Кастомный курсор
function initCustomCursor() {
    const cursor = document.querySelector('.custom-cursor');
    const cursorTrail = document.querySelector('.custom-cursor-trail');
    
    if (!cursor || !cursorTrail) return;
    
    // Проверка мобильных устройств
    if (window.matchMedia('(max-width: 768px)').matches) {
        return;
    }
    
    // Проверка prefers-reduced-motion
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        return;
    }
    
    let mouseX = 0;
    let mouseY = 0;
    let trailX = 0;
    let trailY = 0;
    
    document.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
        
        cursor.style.left = mouseX + 'px';
        cursor.style.top = mouseY + 'px';
    });
    
    function animateTrail() {
        trailX += (mouseX - trailX) * 0.1;
        trailY += (mouseY - trailY) * 0.1;
        
        cursorTrail.style.left = trailX + 'px';
        cursorTrail.style.top = trailY + 'px';
        
        requestAnimationFrame(animateTrail);
    }
    
    animateTrail();
    
    // Эффект при наведении на интерактивные элементы
    const interactiveElements = document.querySelectorAll('a, button, .book-card');
    
    interactiveElements.forEach(el => {
        el.addEventListener('mouseenter', () => {
            cursorTrail.style.width = '40px';
            cursorTrail.style.height = '40px';
            cursorTrail.style.borderColor = 'rgba(139, 92, 246, 0.8)';
        });
        
        el.addEventListener('mouseleave', () => {
            cursorTrail.style.width = '24px';
            cursorTrail.style.height = '24px';
            cursorTrail.style.borderColor = 'rgba(0, 229, 255, 0.5)';
        });
    });
    
    // Показ курсора
    document.body.style.cursor = 'none';
    cursor.style.display = 'block';
    cursorTrail.style.display = 'block';
}

// Форма подписки
function initSubscribeForm() {
    const form = document.querySelector('.subscribe-form');
    if (!form) return;
    
    const emailInput = form.querySelector('#subscribe-email');
    const errorSpan = form.querySelector('.form-error');
    const successP = form.querySelector('.form-success');
    
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        
        // Очистка предыдущих сообщений
        if (errorSpan) errorSpan.textContent = '';
        if (successP) successP.textContent = '';
        
        const email = emailInput.value.trim();
        
        // Простая валидация email
        const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
        
        if (!email) {
            if (errorSpan) errorSpan.textContent = 'Пожалуйста, введите email';
            emailInput.focus();
            return;
        }
        
        if (!emailRegex.test(email)) {
            if (errorSpan) errorSpan.textContent = 'Пожалуйста, введите корректный email';
            emailInput.focus();
            return;
        }
        
        // Успешная валидация (визуальная, без бэкенда)
        if (successP) {
            successP.textContent = 'Спасибо за подписку! (форма работает только визуально)';
        }
        emailInput.value = '';
        
        // Убрать сообщение через 5 секунд
        setTimeout(() => {
            if (successP) successP.textContent = '';
        }, 5000);
    });
}

// Эффект печатной машинки для заголовка
function initTypewriter() {
    const title = document.querySelector('.hero-title');
    if (!title) return;
    
    // Проверка prefers-reduced-motion
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        return;
    }
    
    const text = title.getAttribute('data-typewriter') || title.textContent;
    title.textContent = '';
    
    let i = 0;
    const speed = 100;
    
    function typeWriter() {
        if (i < text.length) {
            title.textContent += text.charAt(i);
            i++;
            setTimeout(typeWriter, speed);
        } else {
            // Добавляем курсор мигания
            title.style.borderRight = '2px solid var(--accent-cyan)';
            title.style.paddingRight = '4px';
            title.style.animation = 'cursor-blink 1s step-end infinite';
        }
    }
    
    // Небольшая задержка перед началом
    setTimeout(typeWriter, 500);
}

// Добавляем CSS для курсора мигания
const style = document.createElement('style');
style.textContent = `
    @keyframes cursor-blink {
        from, to { border-color: transparent; }
        50% { border-color: var(--accent-cyan); }
    }
`;
document.head.appendChild(style);
