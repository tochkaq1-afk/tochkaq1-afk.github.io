from aiogram import Router
from aiogram.filters import Command, CommandStart
from aiogram.types import (
    InlineKeyboardButton,
    InlineKeyboardMarkup,
    Message,
    WebAppInfo,
)

from config import WEBAPP_URL

router = Router()

GREETING = (
    "💱 <b>Конвертер</b>\n\n"
    "Курсы валют в реальном времени и единицы измерения — "
    "длина, вес, объём, температура, площадь, скорость.\n\n"
    "Жми кнопку, чтобы открыть приложение."
)

HELP = (
    "Приложение открывается кнопкой ниже или синей кнопкой «Меню» рядом с полем ввода.\n\n"
    "Курсы берутся из открытого источника и обновляются раз в час. "
    "Единицы считаются на устройстве, поэтому работают и без сети."
)


def app_keyboard() -> InlineKeyboardMarkup:
    return InlineKeyboardMarkup(
        inline_keyboard=[
            [
                InlineKeyboardButton(
                    text="Открыть конвертер",
                    web_app=WebAppInfo(url=WEBAPP_URL),
                )
            ]
        ]
    )


@router.message(CommandStart())
async def cmd_start(message: Message) -> None:
    await message.answer(GREETING, reply_markup=app_keyboard())


@router.message(Command("help"))
async def cmd_help(message: Message) -> None:
    await message.answer(HELP, reply_markup=app_keyboard())


@router.message()
async def anything_else(message: Message) -> None:
    await message.answer("Считаю внутри приложения — открывай:", reply_markup=app_keyboard())
