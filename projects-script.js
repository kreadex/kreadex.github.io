// Данные проектов
const projectsData = [
    {
        id: 1,
        title: "Kuber",
        description: "Приватный сервер Minecraft Java Edition.",
        tags: ["minecraft", "big"],
        status: "active",
        date: "2023",
        link: "#",
        icon: "fas fa-gamepad"
    },
    {
        id: 2,
        title: "MCMotion Studio",
        description: "Студия по созданию проектов.",
        tags: ["big", "studio", "frozen"],
        status: "frozen",
        date: "2024",
        link: "https://discord.com/invite/4r2eFmAdKA",
        icon: "fas fa-cube"
    },
    {
        id: 3,
        title: "Мобильное приложение X",
        description: "Хз какое то там ну в разработке",
        tags: ["programming", "android", "source"],
        status: "planned",
        date: "2025",
        link: "https://youtu.be/dQw4w9WgXcQ",
        icon: "fa-brands fa-android"
    },
    {
        id: 4,
        title: "Minecraft СНГ платформа",
        description: "Платформа объединения СНГ сообщества, каталог сообществ.",
        tags: ["minecraft", "community"],
        status: "planned",
        date: "2025",
        link: "https://youtu.be/dQw4w9WgXcQ",
        icon: "fas fa-cubes"
    }
];

// Инициализация проектов
function initProjects() {
    const grid = document.getElementById('projectsGrid');
    grid.innerHTML = '';
    
    projectsData.forEach(project => {
        const card = createProjectCard(project);
        grid.appendChild(card);
    });
}

// Создание карточки проекта
function createProjectCard(project) {
    const card = document.createElement('div');
    card.className = 'project-card';
    card.setAttribute('data-tags', project.tags.join(' '));
    card.setAttribute('data-status', project.status);
    
    card.innerHTML = `
        <div class="project-image">
            <i class="${project.icon}"></i>
        </div>
        <h3 class="project-title">${project.title}</h3>
        <p class="project-description">${project.description}</p>
        <div class="project-tags">
            ${project.tags.map(tag => `<span class="project-tag">#${tag}</span>`).join('')}
        </div>
        <div class="project-meta">
            <span class="project-status status-${project.status}">
                ${getStatusText(project.status)}
            </span>
            <span class="project-date">${project.date}</span>
        </div>
    `;
    
    // Клик по карточке
    card.addEventListener('click', () => {
        window.location.href = `project.html?id=${project.id}`;
    });
    
    return card;
}

// Текст статуса
function getStatusText(status) {
    const statusMap = {
        'completed': 'Завершён',
        'active': 'Активен',
        'in-progress': 'В разработке', 
        'frozen': 'Заморожен', 
        'planned': 'Планируется'
    };
    return statusMap[status] || status;
}

// Фильтрация проектов
function initFilters() {
    const filterTags = document.querySelectorAll('.filter-tag[data-filter]');
    const statusTags = document.querySelectorAll('.filter-tag[data-status]');
    
    let currentFilter = 'all';
    let currentStatus = 'all';
    
    // Фильтры по категориям
    filterTags.forEach(tag => {
        tag.addEventListener('click', () => {
            filterTags.forEach(t => t.classList.remove('active'));
            tag.classList.add('active');
            currentFilter = tag.getAttribute('data-filter');
            applyFilters();
        });
    });
    
    // Фильтры по статусу
    statusTags.forEach(tag => {
        tag.addEventListener('click', () => {
            statusTags.forEach(t => t.classList.remove('active'));
            tag.classList.add('active');
            currentStatus = tag.getAttribute('data-status');
            applyFilters();
        });
    });
    
    function applyFilters() {
        const cards = document.querySelectorAll('.project-card');
        
        cards.forEach(card => {
            const cardTags = card.getAttribute('data-tags').split(' ');
            const cardStatus = card.getAttribute('data-status');
            
            const categoryMatch = currentFilter === 'all' || cardTags.includes(currentFilter);
            const statusMatch = currentStatus === 'all' || cardStatus === currentStatus;
            
            if (categoryMatch && statusMatch) {
                card.style.display = 'block';
            } else {
                card.style.display = 'none';
            }
        });
    }
}

// Инициализация при загрузке
document.addEventListener('DOMContentLoaded', () => {
    initProjects();
    initFilters();
});