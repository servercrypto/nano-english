with open("src/app/page.tsx", "r", encoding="utf-8") as f:
    code = f.read()

old_url = "https://api.developer.coinbase.com/rpc/v1/base/public"
# ВСТАВЬ СВОЙ КЛЮЧ ВМЕСТО ТЕКСТА НИЖЕ
new_url = «https://api.developer.coinbase.com/rpc/v1/base/HRG7SmtqyvEaMvjurncidcqOuT6EHNWS"

if old_url in code:
    code = code.replace(old_url, new_url)
    with open("src/app/page.tsx", "w", encoding="utf-8") as f:
        f.write(code)
    print("URL Паймастера успешно обновлен!")
else:
    print("Целевой блок не найден. Возможно, URL уже изменен.")
