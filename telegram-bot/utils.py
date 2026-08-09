import re

NUMBER = r"-?\d+(?:[.,]\d+)?"

# «100 usd to byn», «10 км в мили», «5 кг -> фунт», «36.6 c f»
QUERY = re.compile(
    rf"^\s*({NUMBER})\s*([^\s\d]+(?:/[^\s\d]+)?)\s*"
    rf"(?:в|to|in|->|=|—|-)?\s*"
    rf"([^\s\d]+(?:/[^\s\d]+)?)\s*$",
    re.IGNORECASE,
)


def parse_query(text: str) -> tuple[float, str, str] | None:
    """Разбирает строку вида «100 usd to byn»."""
    match = QUERY.match(text)
    if not match:
        return None
    amount = float(match.group(1).replace(",", "."))
    return amount, match.group(2), match.group(3)


def format_number(value: float) -> str:
    abs_value = abs(value)
    if abs_value and abs_value < 1:
        digits = 4
    elif abs_value >= 100000:
        digits = 1
    else:
        digits = 2

    text = f"{value:,.{digits}f}".replace(",", " ")
    if "." in text:
        text = text.rstrip("0").rstrip(".")
    return text.replace(".", ",")
