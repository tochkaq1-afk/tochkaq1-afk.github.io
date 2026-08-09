from aiogram import F, Router
from aiogram.filters import Command, CommandStart
from aiogram.types import (
    InlineKeyboardButton,
    InlineKeyboardMarkup,
    Message,
    WebAppInfo,
)

from config import WEBAPP_URL
from services import currency_api, units_data
from services.currency_api import CurrencyError
from services.units_data import UnitError
from utils import format_number, parse_query

router = Router()

GREETING = (
    "💱 <b>Конвертер</b>\n\n"
    "Открывай приложение кнопкой ниже — там курсы валют и шесть категорий "
    "единиц измерения.\n\n"
    "А можно посчитать прямо здесь, просто написав:\n"
    "<code>100 usd byn</code>\n"
    "<code>10 км в мили</code>\n"
    "<code>36.6 c f</code>"
)

HELP = (
    "<b>Два способа считать</b>\n\n"
    "📱 <b>В приложении</b> — кнопка ниже или синяя кнопка «Меню» рядом с полем ввода.\n\n"
    "💬 <b>Прямо в чате</b> — напиши <code>число откуда куда</code>:\n"
    "<code>50 eur pln</code>, <code>5 кг фнт</code>, <code>100 f c</code>, "
    "<code>3 га сот</code>, <code>90 км/ч м/с</code>\n\n"
    "Понимаю и коды (usd, eur), и слова (доллар, злотый, миля, гектар).\n\n"
    "Валюты: USD, EUR, BYN, RUB, PLN, UAH, KZT, GBP, CHF, CNY, JPY, TRY, AED, GEL, CZK, SEK.\n"
    "Единицы: длина, вес, объём, температура, площадь, скорость."
)

NOT_UNDERSTOOD = (
    "Не разобрал запрос 🤔\n\n"
    "Напиши в формате <code>число откуда куда</code>, например:\n"
    "<code>100 usd byn</code> или <code>10 км в мили</code>\n\n"
    "Либо открой приложение:"
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


async def answer_currency(message: Message, amount: float, src: str, dst: str) -> None:
    src, dst = currency_api.normalize(src), currency_api.normalize(dst)
    try:
        result, rate = await currency_api.convert(amount, src, dst)
    except CurrencyError as exc:
        await message.answer(f"⚠️ {exc}. Попробуй через минуту.")
        return

    await message.answer(
        f"{currency_api.flag(src)} <b>{format_number(amount)} {src}</b>  =  "
        f"{currency_api.flag(dst)} <b>{format_number(result)} {dst}</b>\n\n"
        f"<i>1 {src} = {format_number(rate)} {dst}</i>"
    )


async def answer_units(message: Message, amount: float, src: str, dst: str) -> None:
    try:
        result = units_data.convert(amount, src, dst)
        src_short, dst_short = units_data.short(src), units_data.short(dst)
    except UnitError as exc:
        await message.answer(f"⚠️ {exc}")
        return

    await message.answer(
        f"<b>{format_number(amount)} {src_short}</b>  =  "
        f"<b>{format_number(result)} {dst_short}</b>"
    )


@router.message(F.text)
async def convert_text(message: Message) -> None:
    parsed = parse_query(message.text)
    if parsed is None:
        await message.answer(NOT_UNDERSTOOD, reply_markup=app_keyboard())
        return

    amount, src, dst = parsed

    if currency_api.is_currency(src) and currency_api.is_currency(dst):
        await answer_currency(message, amount, src, dst)
        return

    if units_data.is_unit(src) and units_data.is_unit(dst):
        await answer_units(message, amount, src, dst)
        return

    await message.answer(
        f"Не знаю такую пару: <b>{src}</b> → <b>{dst}</b>.\n"
        "Проверь написание или посчитай в приложении:",
        reply_markup=app_keyboard(),
    )
