// Переключатель языка
function setLang(lang) {
    const name = document.getElementById("name");
    const desc = document.getElementById("desc");

    name.style.opacity = 0;
    desc.style.opacity = 0;

    setTimeout(() => {
        if (lang === "ru") {
            name.innerText = "KreaDex";
            desc.innerHTML = "Меня зовут Паша, иногда я известен под прозвищами Пахан или Паханко. Мне 15 лет.<br><br>Изучаю программирование. Частично знаю Python. Работал в Blender 3D. Художник, дизайнер, монтажёр, моделлер. Больше всего интересует игра Minecraft. В последнее время очень интересует программирование.<br><br>Пытаюсь сделать интересные проекты.";
        } else {
            name.innerText = "KreaDex";
            desc.innerHTML = "My name is Pasha, sometimes known by the nicknames Pahan or Pahanko. I am 15 years old.<br><br>I study programming and have some knowledge of Python. I have worked in Blender 3D and am an artist, designer, video editor, and 3D modeler. My main interest is Minecraft. Lately, I've become very interested in programming. <br><br>I enjoy making interesting projects.";
        }
        name.style.opacity = 1;
        desc.style.opacity = 1;
    }, 300);
}

// Троеточие
function toggleMore() {
    const more = document.getElementById("moreContent");
    more.classList.toggle("show");
    
    // Обновляем статистику при открытии (только отображение, не счетчик)
    if (more.classList.contains('show')) {
        updateMoreStats();
    }
}

// Обновление статистики в more (только отображение)
function updateMoreStats() {
    const stats = getViewCount();
    const statsElement = document.getElementById('moreStats');
    
    // Обновляем существующую статистику
    const values = statsElement.querySelectorAll('.stat-value');
    values[0].textContent = stats.total;
}


// Закрытие выпадающего меню при клике вне его
document.addEventListener('click', function(event) {
    const moreContent = document.getElementById('moreContent');
    const moreButton = document.querySelector('.more button');
    
    if (moreContent && !moreContent.contains(event.target) && !moreButton.contains(event.target)) {
        moreContent.classList.remove('show');
    }
});

// УБИРАЕМ автоматическое обновление счетчика из этого файла
// Это будет делаться только в stats-script.js
