"""
sql_loader.py

Parser tolerante para extrair linhas de INSERT de um dump MySQL/MariaDB sem
recorrer a uma base de dados. Usado para carregar os artigos do Código Civil
(`chatbot.sql`) directamente para memória.
"""


def _unescape(raw: str):
    """Converte um campo SQL em bruto no respectivo valor Python."""
    raw = raw.strip()
    if raw == "" or raw.upper() == "NULL":
        return None
    if raw.startswith("'") and raw.endswith("'"):
        s = raw[1:-1]
        s = (
            s.replace("\\'", "'")
            .replace("''", "'")
            .replace('\\"', '"')
            .replace("\\n", "\n")
            .replace("\\r", "\r")
            .replace("\\\\", "\\")
        )
        return s
    try:
        return int(raw)
    except ValueError:
        try:
            return float(raw)
        except ValueError:
            return raw


def _split_fields(tuple_str: str):
    """Divide o conteúdo de uma tupla `a, b, 'c'` respeitando aspas."""
    fields = []
    current = []
    in_str = False
    i, n = 0, len(tuple_str)
    while i < n:
        c = tuple_str[i]
        if in_str:
            current.append(c)
            if c == "\\" and i + 1 < n:
                current.append(tuple_str[i + 1])
                i += 2
                continue
            if c == "'":
                if i + 1 < n and tuple_str[i + 1] == "'":
                    current.append("'")
                    i += 2
                    continue
                in_str = False
            i += 1
            continue
        if c == "'":
            in_str = True
            current.append(c)
        elif c == ",":
            fields.append("".join(current))
            current = []
        else:
            current.append(c)
        i += 1
    fields.append("".join(current))
    return [_unescape(f) for f in fields]


def parse_table(sql_text: str, table: str):
    r"""Devolve uma lista de tuplas (listas de valores) de todos os
    `INSERT INTO \`table\`` encontrados no texto SQL fornecido."""
    rows = []
    token = f"INSERT INTO `{table}`"
    pos = 0
    while True:
        idx = sql_text.find(token, pos)
        if idx == -1:
            break
        i = sql_text.find("VALUES", idx) + len("VALUES")
        n = len(sql_text)
        depth = 0
        in_str = False
        current = []
        while i < n:
            c = sql_text[i]
            if in_str:
                current.append(c)
                if c == "\\" and i + 1 < n:
                    current.append(sql_text[i + 1])
                    i += 2
                    continue
                if c == "'":
                    if i + 1 < n and sql_text[i + 1] == "'":
                        current.append("'")
                        i += 2
                        continue
                    in_str = False
                i += 1
                continue
            if c == "'":
                in_str = True
                current.append(c)
            elif c == "(":
                if depth == 0:
                    current = []
                else:
                    current.append(c)
                depth += 1
            elif c == ")":
                depth -= 1
                if depth == 0:
                    rows.append(_split_fields("".join(current)))
                else:
                    current.append(c)
            elif c == ";" and depth == 0:
                break
            elif depth > 0:
                current.append(c)
            i += 1
        pos = i + 1
    return rows
