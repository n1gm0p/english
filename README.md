# Clear Accent — лендинг курса американского произношения

Одностраничный лендинг (HTML/CSS/JS, без сборки) с формой записи. Заявки
отправляются в ваш Telegram через serverless-функцию Netlify — токен бота
хранится в переменных окружения и **не попадает в клиентский код**.

## Структура проекта

```
.
├── index.html                 # сама страница
├── styles.css                 # стили
├── script.js                  # логика формы и анимаций
├── netlify.toml               # конфигурация Netlify
├── netlify/
│   └── functions/
│       └── submit.js          # приём заявки → отправка в Telegram
└── README.md
```

## Как задеплоить на Netlify

### Вариант A — перетащить папку (drag & drop)

1. Войдите на [app.netlify.com](https://app.netlify.com).
2. Откройте вкладку **Sites** → перетащите папку проекта в поле
   «drag and drop your site output folder here».
3. Сайт опубликуется за несколько секунд. Serverless-функция из
   `netlify/functions/` подхватится автоматически.
4. Добавьте переменные окружения (см. ниже) — без них форма работать не будет.

### Вариант B — через Git

1. Запушьте проект в репозиторий на GitHub/GitLab.
2. В Netlify: **Add new site → Import an existing project** → выберите репозиторий.
3. Настройки сборки можно оставить пустыми (publish-директория `.` уже задана
   в `netlify.toml`). Нажмите **Deploy**.
4. Добавьте переменные окружения (см. ниже) и сделайте **Redeploy**.

## Получение TELEGRAM_BOT_TOKEN и chat_id

### 1. Токен бота (`TELEGRAM_BOT_TOKEN`)

1. Откройте в Telegram [@BotFather](https://t.me/BotFather).
2. Отправьте `/newbot` и следуйте инструкциям (имя + username бота).
3. BotFather пришлёт токен вида `123456789:AAly...` — это и есть
   `TELEGRAM_BOT_TOKEN`.

### 2. Ваш chat_id (`TELEGRAM_CHAT_ID`)

Самый простой способ:

1. Напишите своему новому боту любое сообщение (например, «привет») —
   это нужно, чтобы бот «увидел» ваш чат.
2. Откройте в браузере (подставьте свой токен):
   ```
   https://api.telegram.org/bot<ВАШ_ТОКЕН>/getUpdates
   ```
3. В ответе найдите `"chat":{"id":123456789,...}` — число `id` и есть
   `TELEGRAM_CHAT_ID`.

> Хотите получать заявки в группу? Добавьте бота в группу, напишите там
> сообщение и снова откройте `getUpdates` — id группы будет отрицательным
> (например, `-100123456789`). Используйте его как `TELEGRAM_CHAT_ID`.
>
> Альтернатива: напишите [@userinfobot](https://t.me/userinfobot) — он
> пришлёт ваш личный chat_id.

## Куда вставить переменные окружения

В панели Netlify вашего сайта:

**Site configuration → Environment variables → Add a variable**

Добавьте две переменные:

| Ключ                   | Значение                          |
| ---------------------- | --------------------------------- |
| `TELEGRAM_BOT_TOKEN`   | токен от @BotFather               |
| `TELEGRAM_CHAT_ID`     | ваш chat_id (или id группы)       |

После добавления нажмите **Deploys → Trigger deploy → Deploy site**, чтобы
функция подхватила новые переменные.

## Локальная проверка (необязательно)

Чтобы проверить функцию локально, установите Netlify CLI:

```bash
npm install -g netlify-cli
netlify env:set TELEGRAM_BOT_TOKEN "ваш_токен"
netlify env:set TELEGRAM_CHAT_ID "ваш_chat_id"
netlify dev
```

Откройте предложенный адрес (обычно `http://localhost:8888`) и отправьте форму.

## Что можно поменять под себя

- **Тексты, название, слоган** — в `index.html`.
- **Отзывы** — блок `#reviews` в `index.html` (сейчас там заглушки-плейсхолдеры).
- **Ссылка на Telegram** в шапке футера — атрибут `href="https://t.me/your_username"`.
- **Цвета** — переменные в начале `styles.css` (блок `:root`).
- **Защита от спама** — honeypot-поле `company`: скрыто от людей, боты его
  заполняют, и такие заявки функция молча отбрасывает.
