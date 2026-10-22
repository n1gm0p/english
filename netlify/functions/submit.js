// Netlify serverless function: приём заявки и отправка в Telegram.
// Токен и chat_id берутся ТОЛЬКО из переменных окружения (в коде их нет).
//   TELEGRAM_BOT_TOKEN — токен бота от @BotFather
//   TELEGRAM_CHAT_ID   — ваш chat_id (куда слать заявки)

exports.handler = async function (event) {
  const JSON_HEADERS = { 'Content-Type': 'application/json' };

  // Принимаем только POST
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: JSON_HEADERS,
      body: JSON.stringify({ error: 'Метод не поддерживается' })
    };
  }

  // Парсим тело запроса
  let data;
  try {
    data = JSON.parse(event.body || '{}');
  } catch (e) {
    return {
      statusCode: 400,
      headers: JSON_HEADERS,
      body: JSON.stringify({ error: 'Некорректные данные формы' })
    };
  }

  const name = (data.name || '').toString().trim();
  const contact = (data.contact || '').toString().trim();
  const time = (data.time || '').toString().trim();
  const honeypot = (data.company || '').toString().trim();

  // Защита от спама: honeypot должен быть пустым.
  // Боту отвечаем "успехом", чтобы не подсказывать логику фильтрации.
  if (honeypot) {
    return {
      statusCode: 200,
      headers: JSON_HEADERS,
      body: JSON.stringify({ ok: true })
    };
  }

  // Валидация обязательных полей
  if (!name || !contact) {
    return {
      statusCode: 400,
      headers: JSON_HEADERS,
      body: JSON.stringify({ error: 'Укажите имя и контакт для связи' })
    };
  }

  // Ограничим длину, чтобы нельзя было прислать «простыню»
  const clip = (s, n) => (s.length > n ? s.slice(0, n) + '…' : s);

  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  if (!token || !chatId) {
    return {
      statusCode: 500,
      headers: JSON_HEADERS,
      body: JSON.stringify({ error: 'Сервер не настроен. Попробуйте позже.' })
    };
  }

  // Формируем сообщение (HTML-разметка Telegram)
  const esc = (s) =>
    s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

  const lines = [
    '🎓 <b>Новая заявка на курс произношения</b>',
    '',
    `👤 <b>Имя:</b> ${esc(clip(name, 200))}`,
    `📞 <b>Контакт:</b> ${esc(clip(contact, 200))}`
  ];
  if (time) lines.push(`🕒 <b>Удобное время:</b> ${esc(clip(time, 200))}`);

  const text = lines.join('\n');

  try {
    const resp = await fetch(
      `https://api.telegram.org/bot${token}/sendMessage`,
      {
        method: 'POST',
        headers: JSON_HEADERS,
        body: JSON.stringify({
          chat_id: chatId,
          text: text,
          parse_mode: 'HTML',
          disable_web_page_preview: true
        })
      }
    );

    if (!resp.ok) {
      const detail = await resp.text();
      console.error('Telegram API error:', resp.status, detail);
      return {
        statusCode: 502,
        headers: JSON_HEADERS,
        body: JSON.stringify({ error: 'Не удалось доставить заявку. Попробуйте позже.' })
      };
    }

    return {
      statusCode: 200,
      headers: JSON_HEADERS,
      body: JSON.stringify({ ok: true })
    };
  } catch (err) {
    console.error('Function error:', err);
    return {
      statusCode: 500,
      headers: JSON_HEADERS,
      body: JSON.stringify({ error: 'Внутренняя ошибка. Попробуйте позже.' })
    };
  }
};
