// ===== Текущий год в футере =====
document.getElementById('year').textContent = new Date().getFullYear();

// ===== Анимация появления блоков при скролле =====
(function () {
  var reveals = document.querySelectorAll('.reveal');
  if (!('IntersectionObserver' in window) || !reveals.length) {
    reveals.forEach(function (el) { el.classList.add('visible'); });
    return;
  }
  var observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

  reveals.forEach(function (el) { observer.observe(el); });
})();

// ===== Отправка формы заявки =====
(function () {
  var form = document.getElementById('signup-form');
  if (!form) return;

  var btn = document.getElementById('submit-btn');
  var status = document.getElementById('form-status');

  function setStatus(message, type) {
    status.textContent = message;
    status.className = 'form-status' + (type ? ' ' + type : '');
  }

  function validate() {
    var ok = true;
    ['name', 'contact'].forEach(function (id) {
      var input = form.elements[id];
      if (!input.value.trim()) {
        input.classList.add('invalid');
        ok = false;
      } else {
        input.classList.remove('invalid');
      }
    });
    return ok;
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    setStatus('', '');

    if (!validate()) {
      setStatus('Пожалуйста, заполните имя и контакт для связи.', 'error');
      return;
    }

    var payload = {
      name: form.elements['name'].value.trim(),
      contact: form.elements['contact'].value.trim(),
      time: form.elements['time'].value.trim(),
      company: form.elements['company'].value.trim() // honeypot
    };

    btn.classList.add('loading');
    btn.disabled = true;
    setStatus('Отправляем заявку…', '');

    fetch('/.netlify/functions/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
      .then(function (res) {
        return res.json().then(function (data) {
          return { ok: res.ok, data: data };
        });
      })
      .then(function (result) {
        if (result.ok) {
          form.reset();
          setStatus('Спасибо! Заявка отправлена — мы скоро свяжемся с вами.', 'success');
        } else {
          setStatus(
            (result.data && result.data.error) ||
              'Не удалось отправить заявку. Попробуйте ещё раз или напишите нам в Telegram.',
            'error'
          );
        }
      })
      .catch(function () {
        setStatus(
          'Ошибка сети. Проверьте соединение и попробуйте ещё раз, либо напишите нам в Telegram.',
          'error'
        );
      })
      .finally(function () {
        btn.classList.remove('loading');
        btn.disabled = false;
      });
  });
})();
