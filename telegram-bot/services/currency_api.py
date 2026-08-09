"""Курсы валют для чат-режима.

Тот же источник, что и у приложения: open.er-api.com — бесплатно, без ключа.
Ответ держим в памяти час, чтобы не дёргать сервис на каждое сообщение.
"""

import time

import aiohttp

API_URL = "https://open.er-api.com/v6/latest/{base}"
CACHE_TTL = 3600

# Порядок и состав совпадают с converter/data.js
CURRENCIES = {
    "USD": ("🇺🇸", "Доллар США"),
    "EUR": ("🇪🇺", "Евро"),
    "BYN": ("🇧🇾", "Белорусский рубль"),
    "RUB": ("🇷🇺", "Российский рубль"),
    "PLN": ("🇵🇱", "Злотый"),
    "UAH": ("🇺🇦", "Гривна"),
    "KZT": ("🇰🇿", "Тенге"),
    "GBP": ("🇬🇧", "Фунт стерлингов"),
    "CHF": ("🇨🇭", "Швейцарский франк"),
    "CNY": ("🇨🇳", "Юань"),
    "JPY": ("🇯🇵", "Иена"),
    "TRY": ("🇹🇷", "Турецкая лира"),
    "AED": ("🇦🇪", "Дирхам"),
    "GEL": ("🇬🇪", "Лари"),
    "CZK": ("🇨🇿", "Чешская крона"),
    "SEK": ("🇸🇪", "Шведская крона"),
}

ALIASES = {
    "доллар": "USD", "долларов": "USD", "бакс": "USD", "usd": "USD", "$": "USD",
    "евро": "EUR", "eur": "EUR", "€": "EUR",
    "byn": "BYN", "бел": "BYN", "белрубль": "BYN", "зайчик": "BYN",
    "руб": "RUB", "рубль": "RUB", "рублей": "RUB", "rub": "RUB",
    "злотый": "PLN", "злотых": "PLN", "pln": "PLN",
    "гривна": "UAH", "гривен": "UAH", "uah": "UAH",
    "тенге": "KZT", "kzt": "KZT",
    "фунт стерлингов": "GBP", "gbp": "GBP", "£": "GBP",
    "франк": "CHF", "chf": "CHF",
    "юань": "CNY", "cny": "CNY",
    "иена": "JPY", "jpy": "JPY",
    "лира": "TRY", "try": "TRY",
    "дирхам": "AED", "aed": "AED",
    "лари": "GEL", "gel": "GEL",
    "крона": "CZK", "czk": "CZK", "sek": "SEK",
}

_cache: dict[str, tuple[float, dict[str, float]]] = {}


class CurrencyError(Exception):
    pass


def normalize(code: str) -> str:
    code = code.strip().lower().replace(".", "")
    return ALIASES.get(code, code.upper())


def is_currency(code: str) -> bool:
    return normalize(code) in CURRENCIES


async def _fetch(base: str) -> dict[str, float]:
    try:
        timeout = aiohttp.ClientTimeout(total=10)
        async with aiohttp.ClientSession(timeout=timeout) as session:
            async with session.get(API_URL.format(base=base)) as response:
                if response.status != 200:
                    raise CurrencyError(f"Сервис курсов ответил кодом {response.status}")
                payload = await response.json()
    except aiohttp.ClientError as exc:
        raise CurrencyError("Не удалось связаться с сервисом курсов") from exc
    except TimeoutError as exc:
        raise CurrencyError("Сервис курсов не ответил вовремя") from exc

    if payload.get("result") != "success":
        raise CurrencyError("Сервис курсов вернул ошибку")
    return payload["rates"]


async def get_rates(base: str) -> dict[str, float]:
    base = base.upper()
    cached = _cache.get(base)
    if cached and time.time() - cached[0] < CACHE_TTL:
        return cached[1]

    rates = await _fetch(base)
    _cache[base] = (time.time(), rates)
    return rates


async def convert(amount: float, from_code: str, to_code: str) -> tuple[float, float]:
    """Возвращает (результат, курс за единицу)."""
    from_code, to_code = normalize(from_code), normalize(to_code)
    if from_code == to_code:
        return amount, 1.0

    rates = await get_rates(from_code)
    rate = rates.get(to_code)
    if rate is None:
        raise CurrencyError(f"Валюта {to_code} не поддерживается")
    return amount * rate, rate


def flag(code: str) -> str:
    return CURRENCIES.get(code.upper(), ("", ""))[0]
