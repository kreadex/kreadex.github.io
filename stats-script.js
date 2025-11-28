// Система подсчета просмотров сайта
class ViewCounter {
    constructor() {
        this.storageKey = 'kreadex_site_views';
        this.sessionKey = 'kreadex_session_views';
        this.currentDate = new Date().toDateString();
        this.initialized = false; // Флаг инициализации
    }

    // Получить текущую статистику
    getStats() {
        const stats = localStorage.getItem(this.storageKey);
        return stats ? JSON.parse(stats) : {
            totalViews: 0,
            uniqueViews: 0,
            dailyViews: {},
            lastVisit: null
        };
    }

    // Сохранить статистику
    saveStats(stats) {
        localStorage.setItem(this.storageKey, JSON.stringify(stats));
    }

    // Проверить новую сессию
    isNewSession() {
        const sessionViewed = sessionStorage.getItem(this.sessionKey);
        return !sessionViewed;
    }

    // Обновить счетчик просмотров (только один раз за сессию)
    updateViewCount() {
        // Проверяем, не был ли уже обновлен счетчик в этой сессии
        if (this.initialized) {
            return this.getStats();
        }

        const stats = this.getStats();
        const isNewSession = this.isNewSession();

        // Общее количество просмотров
        stats.totalViews++;

        // Уникальные просмотры (только новые сессии)
        if (isNewSession) {
            stats.uniqueViews++;
            sessionStorage.setItem(this.sessionKey, 'true');
        }

        // Ежедневная статистика
        if (!stats.dailyViews[this.currentDate]) {
            stats.dailyViews[this.currentDate] = 0;
        }
        stats.dailyViews[this.currentDate]++;

        // Дата последнего посещения
        stats.lastVisit = new Date().toISOString();

        this.saveStats(stats);
        this.initialized = true; // Помечаем как инициализированное

        return stats;
    }

    // Получить количество просмотров для отображения
    getViewCount() {
        const stats = this.getStats();
        return {
            total: stats.totalViews,
            unique: stats.uniqueViews,
            today: stats.dailyViews[this.currentDate] || 0
        };
    }

    // Показать статистику в элементе
    displayViewCount(elementId = 'siteViews') {
        const views = this.getViewCount();
        const element = document.getElementById(elementId);
        
        if (element) {
            // Красивая анимация числа
            this.animateNumber(element, views.total);
        }

        return views;
    }

    // Анимация числа
    animateNumber(element, targetNumber, duration = 1000) {
        const startNumber = 0;
        const startTime = performance.now();

        function updateNumber(currentTime) {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            // easing function
            const easeOutQuart = 1 - Math.pow(1 - progress, 4);
            const currentValue = Math.floor(startNumber + (targetNumber - startNumber) * easeOutQuart);

            element.textContent = currentValue.toLocaleString();

            if (progress < 1) {
                requestAnimationFrame(updateNumber);
            }
        }

        requestAnimationFrame(updateNumber);
    }

    // Сброс статистики (для тестирования)
    resetStats() {
        localStorage.removeItem(this.storageKey);
        sessionStorage.removeItem(this.sessionKey);
        this.initialized = false;
        console.log('📊 Статистика сброшена');
    }
}

// Создаем глобальный экземпляр
const viewCounter = new ViewCounter();

// Функции для глобального использования
function updateViewCount() {
    return viewCounter.updateViewCount();
}

function getViewCount() {
    return viewCounter.getViewCount();
}

function displayViewCount(elementId = 'siteViews') {
    return viewCounter.displayViewCount(elementId);
}

// Единый обработчик для инициализации
let statsInitialized = false;

function initializeStats() {
    if (statsInitialized) {
        return;
    }
    
    updateViewCount();
    
    // Небольшая задержка для плавного отображения
    setTimeout(() => {
        displayViewCount();
    }, 500);
    
    statsInitialized = true;
}

// Инициализируем статистику только один раз при полной загрузке DOM
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeStats);
} else {
    initializeStats();
}

// Экспорт для использования в других модулях
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { viewCounter, updateViewCount, getViewCount, displayViewCount };
}