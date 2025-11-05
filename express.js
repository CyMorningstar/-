const express = require('express');
const axios = require('axios'); // для HTTP-запросов
const app = express();
app.use(express.json()); // для парсинга JSON тела запроса

const BOT_TOKEN = '8508784654: AAGEjVr9txUd425QZvLQxHaKgEP4_P8RVkE'; // Вставьте сюда токен вашего бота
const CHAT_ID = '1280916980';     // Вставьте сюда ваш chat_id

app.post('/api/send-to-telegram', async (req, res) => {
    const { phone } = req.body;

    if (!phone) {
        return res.status(400).json({ success: false, message: 'Номер телефона не предоставлен' });
    }

    try {
        const telegramUrl = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`;
        await axios.post(telegramUrl, {
            chat_id: CHAT_ID,
            text: `🎉 Новый номер гостя: ${phone}`
        });
        res.json({ success: true, message: 'Уведомление отправлено' });
    } catch (error) {
        console.error('Ошибка отправки в Telegram:', error.response ? error.response.data : error.message);
        res.status(500).json({ success: false, message: 'Ошибка при отправке уведомления' });
    }
});

// ... (другие части вашего сервера)
// Вам также нужно будет разместить ваш HTML, CSS, JS файлы на этом сервере
// или на хостинге статических файлов (например, Netlify, Vercel, GitHub Pages)
// и настроить связь между ними.