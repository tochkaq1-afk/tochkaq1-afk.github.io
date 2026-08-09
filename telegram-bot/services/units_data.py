"""Единицы измерения для чат-режима.

Коэффициент — во сколько базовых единиц превращается одна такая.
Набор должен совпадать с converter/data.js, чтобы чат и приложение
считали одинаково.
"""

CATEGORIES = {
    "length": {
        "title": "Длина",
        "units": {
            "mm": ("Миллиметр", "мм", 0.001),
            "cm": ("Сантиметр", "см", 0.01),
            "m": ("Метр", "м", 1.0),
            "km": ("Километр", "км", 1000.0),
            "in": ("Дюйм", "дюйм", 0.0254),
            "ft": ("Фут", "фут", 0.3048),
            "yd": ("Ярд", "ярд", 0.9144),
            "mi": ("Миля", "миля", 1609.344),
        },
    },
    "mass": {
        "title": "Вес",
        "units": {
            "g": ("Грамм", "г", 0.001),
            "kg": ("Килограмм", "кг", 1.0),
            "t": ("Тонна", "т", 1000.0),
            "oz": ("Унция", "унц", 0.028349523125),
            "lb": ("Фунт", "фнт", 0.45359237),
        },
    },
    "volume": {
        "title": "Объём",
        "units": {
            "ml": ("Миллилитр", "мл", 0.001),
            "l": ("Литр", "л", 1.0),
            "m3": ("Кубометр", "м³", 1000.0),
            "gal": ("Галлон US", "гал", 3.785411784),
            "pt": ("Пинта US", "пинт", 0.473176473),
        },
    },
    "temperature": {
        "title": "Температура",
        "units": {
            "c": ("Цельсий", "°C", None),
            "f": ("Фаренгейт", "°F", None),
            "k": ("Кельвин", "K", None),
        },
    },
    "area": {
        "title": "Площадь",
        "units": {
            "cm2": ("Кв. сантиметр", "см²", 0.0001),
            "m2": ("Кв. метр", "м²", 1.0),
            "a": ("Сотка", "сот", 100.0),
            "ha": ("Гектар", "га", 10000.0),
            "km2": ("Кв. километр", "км²", 1000000.0),
            "ft2": ("Кв. фут", "фут²", 0.09290304),
        },
    },
    "speed": {
        "title": "Скорость",
        "units": {
            "ms": ("Метр в секунду", "м/с", 1.0),
            "kmh": ("Км в час", "км/ч", 0.2777777778),
            "mph": ("Мили в час", "миль/ч", 0.44704),
            "kn": ("Узел", "уз", 0.5144444444),
        },
    },
}

# Как пользователь может написать единицу в чате
ALIASES = {
    "мм": "mm", "см": "cm", "м": "m", "км": "km", "метр": "m", "метров": "m",
    "дюйм": "in", "дюймов": "in", "фут": "ft", "футов": "ft", "фт": "ft",
    "ярд": "yd", "ярдов": "yd", "миля": "mi", "мили": "mi", "миль": "mi",
    "г": "g", "грамм": "g", "кг": "kg", "килограмм": "kg",
    "т": "t", "тонна": "t", "тонн": "t",
    "унц": "oz", "унция": "oz", "фнт": "lb", "фунт": "lb", "фунтов": "lb",
    "мл": "ml", "л": "l", "литр": "l", "литров": "l",
    "м3": "m3", "м³": "m3", "куб": "m3",
    "гал": "gal", "галлон": "gal", "пинт": "pt", "пинта": "pt",
    "ц": "c", "цельсий": "c", "°c": "c",
    "ф": "f", "фаренгейт": "f", "°f": "f",
    "к": "k", "кельвин": "k",
    "см2": "cm2", "см²": "cm2", "м2": "m2", "м²": "m2",
    "сот": "a", "сотка": "a", "соток": "a",
    "га": "ha", "гектар": "ha", "км2": "km2", "км²": "km2",
    "фут2": "ft2", "фут²": "ft2",
    "мс": "ms", "м/с": "ms", "км/ч": "kmh", "кмч": "kmh",
    "миль/ч": "mph", "уз": "kn", "узел": "kn", "узлов": "kn",
    "meter": "m", "metre": "m", "inch": "in", "foot": "ft", "feet": "ft",
    "mile": "mi", "miles": "mi", "yard": "yd", "gram": "g", "pound": "lb",
    "ounce": "oz", "liter": "l", "litre": "l", "gallon": "gal", "pint": "pt",
    "ton": "t", "tonne": "t", "knot": "kn", "kmh": "kmh", "mps": "ms",
}


class UnitError(Exception):
    pass


def normalize(unit: str) -> str:
    unit = unit.strip().lower().replace(".", "")
    return ALIASES.get(unit, unit)


def find_category(unit: str) -> str | None:
    unit = normalize(unit)
    for key, category in CATEGORIES.items():
        if unit in category["units"]:
            return key
    return None


def is_unit(unit: str) -> bool:
    return find_category(unit) is not None


def short(unit: str) -> str:
    unit = normalize(unit)
    category = find_category(unit)
    if category is None:
        raise UnitError(f"Неизвестная единица: {unit}")
    return CATEGORIES[category]["units"][unit][1]


def _to_celsius(value: float, unit: str) -> float:
    if unit == "c":
        return value
    if unit == "f":
        return (value - 32) * 5 / 9
    return value - 273.15


def _from_celsius(value: float, unit: str) -> float:
    if unit == "c":
        return value
    if unit == "f":
        return value * 9 / 5 + 32
    return value + 273.15


def convert(value: float, from_unit: str, to_unit: str) -> float:
    from_unit, to_unit = normalize(from_unit), normalize(to_unit)
    from_category, to_category = find_category(from_unit), find_category(to_unit)

    if from_category is None:
        raise UnitError(f"Не знаю единицу «{from_unit}»")
    if to_category is None:
        raise UnitError(f"Не знаю единицу «{to_unit}»")
    if from_category != to_category:
        raise UnitError(
            f"«{short(from_unit)}» и «{short(to_unit)}» из разных категорий — "
            "их нельзя перевести друг в друга"
        )

    if from_category == "temperature":
        return _from_celsius(_to_celsius(value, from_unit), to_unit)

    units = CATEGORIES[from_category]["units"]
    return value * units[from_unit][2] / units[to_unit][2]
