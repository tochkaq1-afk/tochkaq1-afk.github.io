import asyncio
import logging

from aiogram import Bot, Dispatcher
from aiogram.client.default import DefaultBotProperties
from aiogram.enums import ParseMode
from aiogram.types import BotCommand, MenuButtonWebApp, WebAppInfo

from config import BOT_TOKEN, WEBAPP_URL
from handlers import start


async def setup(bot: Bot) -> None:
    await bot.set_my_commands(
        [
            BotCommand(command="start", description="Открыть конвертер"),
            BotCommand(command="help", description="Справка"),
        ]
    )
    # Синяя кнопка рядом с полем ввода тоже открывает приложение
    await bot.set_chat_menu_button(
        menu_button=MenuButtonWebApp(
            text="Конвертер",
            web_app=WebAppInfo(url=WEBAPP_URL),
        )
    )


async def main() -> None:
    logging.basicConfig(level=logging.INFO)

    bot = Bot(
        token=BOT_TOKEN,
        default=DefaultBotProperties(parse_mode=ParseMode.HTML),
    )
    dispatcher = Dispatcher()
    dispatcher.include_router(start.router)

    await setup(bot)
    await bot.delete_webhook(drop_pending_updates=True)
    await dispatcher.start_polling(bot)


if __name__ == "__main__":
    try:
        asyncio.run(main())
    except (KeyboardInterrupt, SystemExit):
        logging.info("Бот остановлен")
