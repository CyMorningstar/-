  document.getElementById('rsvpForm').addEventListener('submit', function(event) {
    event.preventDefault(); // Предотвращаем стандартную отправку формы

    const phoneNumber = document.getElementById('phoneNumber').value;
    const messageElement = document.getElementById('message');

    // --- КОД ОТПРАВКИ ДАННЫХ НА БЭКЕНД ---
    // Этот код должен отправлять номер телефона на ваш серверный эндпоинт.
    // Ниже представлен пример с использованием fetch API.
    // Вам нужно будет заменить URL на тот, что предоставляет ваш хостинг для бэкенда.

    fetch('https://github.com/CyMorningstar/-.git', { // <<<---- ЗАМЕНИТЕ ЭТОТ URL!
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ phone: phoneNumber }),
    })
    .then(response => {
        // Проверяем, что ответ от сервера успешен (статус 2xx)
        if (!response.ok) {
            // Если сервер вернул ошибку (например, 400, 500), выбрасываем ее
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json(); // Парсим JSON из ответа сервера
    })
    .then(data => {
        // Обрабатываем ответ от сервера
        if (data.success) {
            messageElement.textContent = "Спасибо! Мы получили ваш номер.";
            messageElement.style.color = "green";
            document.getElementById('phoneNumber').value = ''; // Очищаем поле ввода
        } else {
            messageElement.textContent = data.message || "Не удалось отправить. Попробуйте позже.";
            messageElement.style.color = "red";
        }
    })
    .catch(error => {
        // Ловим любые ошибки, которые могли возникнуть (сетевые, ошибки парсинга, ошибки из then())
        console.error('Ошибка при отправке данных:', error);
        messageElement.textContent = "Произошла ошибка. Пожалуйста, проверьте ваш номер и попробуйте снова.";
        messageElement.style.color = "red";
    });

    // --- СТРОКА "ЗАГЛУШКИ ДЕМО-РЕЖИМА" ---
    // Вы должны удалить или закомментировать эту строку,
    // когда ваш реальный fetch-запрос будет работать.
    // console.log("Номер телефона для отправки:", phoneNumber); // <<<--- ЭТА СТРОКА - ЗАГЛУШКА
    // messageElement.textContent = "Спасибо! Мы получили ваш номер (в демо-режиме).";
    // messageElement.style.color = "green";
    // document.getElementById('phoneNumber').value = '';

});
