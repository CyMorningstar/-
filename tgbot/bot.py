from telegram import Update
from telegram.ext import Application, CommandHandler, MessageHandler, filters, ContextTypes
import asyncio
from flask import Flask, request, jsonify # Используем Flask для приема запросов от сайта
import threading

# --- Настройки Telegram ---
TELEGRAM_BOT_TOKEN = '8508784654:AAGEjVr9txUd425QZvLQxHaKgEP4_P8RVkE'  # !!! ЗАМЕНИТЕ НА ВАШ API ТОКЕН !!!
OWNER_ID = '1280916980'              # !!! ЗАМЕНИТЕ НА ВАШ CHAT ID !!!

# --- Настройки Flask (для приема данных от сайта) ---
APP_HOST = '0.0.0.0'
APP_PORT = 5000 # Порт, на котором будет работать ваш веб-сервер

app = Flask(__name__)

# --- Глобальный объект бота для удобства ---
bot_instance = None

async def send_telegram_message(chat_id: str, text: str) -> None:
    """Отправляет сообщение в Telegram."""
    global bot_instance
    if bot_instance:
        try:
            await bot_instance.send_message(chat_id=chat_id, text=text)
            print(f"Сообщение отправлено в Telegram (ID: {chat_id}): {text[:50]}...")
        except Exception as e:
            print(f"Ошибка отправки сообщения в Telegram (ID: {chat_id}): {e}")
    else:
        print("Ошибка: Telegram бот не инициализирован.")

# --- Обработчик команды /start ---
async def start(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    """Приветствие при команде /start. Отправляет информацию и просит ответить."""
    user = update.effective_user
    chat_id = update.effective_chat.id

    if str(chat_id) == OWNER_ID:
        await update.message.reply_html(
            f"Привет, хозяин! Я готов отправлять приглашения.\n"
            f"Чтобы отправить приглашение конкретному пользователю, используйте команду:\n"
            f"/invite @username Текст_приглашения\n"
            f"Например: /invite @testuser Привет! Приходи на нашу свадьбу!"
        )
    else:
        await update.message.reply_html(
            f"Привет, {user.mention_html()}! Я бот для приглашений на свадьбу. "
            f"На данный момент я работаю только с хозяином."
        )

# --- Обработчик команды /invite ---
async def invite(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    """Отправляет приглашение конкретному пользователю."""
    chat_id = update.effective_chat.id
    if str(chat_id) != OWNER_ID:
        await update.message.reply_text("Эта команда доступна только хозяину.")
        return

    args = context.args
    if len(args) < 2:
        await update.message.reply_text("Используйте команду в формате: /invite @username Текст_приглашения")
        return

    # Получаем username (первый аргумент, начинающийся с @)
    invitee_username = args[0]
    if not invitee_username.startswith('@'):
        await update.message.reply_text("Имя пользователя должно начинаться с '@'.")
        return
    invitee_username = invitee_username[1:] # Убираем @

    # Собираем текст приглашения
    invite_text = " ".join(args[1:])

    if not invite_text:
        await update.message.reply_text("Необходимо указать текст приглашения.")
        return

    # В реальном приложении вам нужно было бы найти chat_id пользователя по его username.
    # Это можно сделать, например, если пользователь уже взаимодействовал с ботом.
    # Для простоты, мы просто отправим пользователю сообщение (если он есть в контактах бота или бот в группе с ним)
    # Или вам придется просить пользователя написать боту первому, чтобы получить его chat_id.

    # Для примера, будем считать, что бот может отправлять сообщения по username
    # В реальном сценарии, вам нужно будет получить chat_id пользователя.
    # Пример: Можно хранить пары username: chat_id в базе данных.
    # Тут мы просто предположим, что сможем отправить, или попросим пользователя написать боту.

    # --- Пример: Как получить chat_id пользователя по username (требуется, чтобы пользователь уже писал боту) ---
    # Вам нужно будет реализовать механизм хранения chat_id пользователей, которые вам отвечают.
    # Например, когда пользователь пишет боту, вы можете сохранить его chat_id.
    # Для этой демонстрации, мы просто отправим сообщение, если знаем chat_id.
# !!! IMPORTANT: Для реальной отправки, вам нужен chat_id конкретного пользователя.
    # Если вы не знаете chat_id, то бот не сможет ему отправить сообщение напрямую.
    # Возможно, вам придется попросить всех 20 гостей сначала написать вашему боту,
    # чтобы вы смогли собрать их chat_id.

    # Для демонстрации, предположим, что у нас есть словарь с chat_id гостей
    guest_chat_ids = {
        'testuser': '123456789',  # Замените на реальные chat_id гостей
        'anotherguest': '987654321'
        # ... и так далее для всех 20 гостей
    }

    target_chat_id = guest_chat_ids.get(invitee_username)

    if target_chat_id:
        full_invite_message = f"Уважаемый(ая) {invitee_username},\n\n{invite_text}"
        await send_telegram_message(target_chat_id, full_invite_message)
        await update.message.reply_text(f"Приглашение для @{invitee_username} отправлено!")
    else:
        await update.message.reply_text(f"Не удалось найти chat_id для пользователя @{invitee_username}. Пожалуйста, убедитесь, что он/она уже писал(а) этому боту, и его/ее chat_id был сохранен.")


# --- Flask обработчик для приема ответов от сайта ---
@app.route('/webhook/wedding_response', methods=['POST'])
def wedding_response_webhook():
    """Обрабатывает POST-запросы от сайта с ответами гостей."""
    data = request.get_json()

    if not data:
        return jsonify({"status": "error", "message": "No JSON data received"}), 400

    guest_username = data.get('username')
    response_text = data.get('response') # Например: "Буду", "Не смогу"

    if not guest_username or not response_text:
        return jsonify({"status": "error", "message": "Missing 'username' or 'response' in JSON"}), 400

    print(f"Получен ответ от @{guest_username}: {response_text}")

    # --- Отправляем уведомление владельцу ---
    notification_message = f"Ответ от гостя @{guest_username}: **{response_text}**"
    # Запускаем отправку в Telegram в отдельном потоке, чтобы не блокировать Flask
    threading.Thread(target=lambda: asyncio.run(send_telegram_message(OWNER_ID, notification_message))).start()

    return jsonify({"status": "success", "message": "Response received and logged"}), 200

def run_flask_app():
    print(f"Flask веб-сервер запущен на {APP_HOST}:{APP_PORT}")
    app.run(host=APP_HOST, port=APP_PORT, debug=False) # debug=False для продакшена

async def main() -> None:
    """Основная функция для запуска бота и веб-сервера."""
    global bot_instance
    application = Application.builder().token(TELEGRAM_BOT_TOKEN).build()
    bot_instance = application # Сохраняем экземпляр бота

    # Добавляем обработчики Telegram
    application.add_handler(CommandHandler("start", start))
    application.add_handler(CommandHandler("invite", invite))

    # Запускаем Flask веб-сервер в отдельном потоке
    loop = asyncio.get_running_loop()
    flask_futyure = loop.run_in_executor(None, run_flask_app)

    # Запускаем Telegram бота
    print("Telegram бот запущен. Нажмите Ctrl+C для остановки.")
    try:
        await application.run_polling(poll_interval=0.5)
    except asyncio.CancelledError:
        print("Telegram бот отсановлен.")
    finally:
        pass

if __name__ == '__main__':
    asyncio.run(main())

def run_flask_app():
    print(f"Flask веб-сервер запущен на {APP_HOST}:{APP_PORT}")
    app.run(host=APP_HOST, port=APP_PORT, debug=False)
