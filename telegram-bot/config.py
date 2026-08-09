import os
from pathlib import Path

from dotenv import load_dotenv

load_dotenv(Path(__file__).parent / ".env")

BOT_TOKEN = os.getenv("BOT_TOKEN")

# Адрес мини-приложения. Telegram открывает только публичный HTTPS —
# localhost работать не будет, поэтому страница живёт на GitHub Pages.
WEBAPP_URL = os.getenv("WEBAPP_URL", "https://tochkaq1-afk.github.io/converter/")

if not BOT_TOKEN:
    raise RuntimeError(
        "Не найден BOT_TOKEN. Создай файл .env рядом с bot.py и впиши в него:\n"
        "BOT_TOKEN=токен_который_выдал_BotFather"
    )
