(() => {
  "use strict";

  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* 1. Mobile Navigation */
  const navToggle = document.querySelector(".nav-toggle");
  const mainNav = document.getElementById("main-nav");

  if (navToggle && mainNav) {
    const closeNav = () => {
      navToggle.setAttribute("aria-expanded", "false");
      mainNav.classList.remove("is-open");
    };

    navToggle.addEventListener("click", () => {
      const expanded = navToggle.getAttribute("aria-expanded") === "true";
      navToggle.setAttribute("aria-expanded", String(!expanded));
      mainNav.classList.toggle("is-open", !expanded);
    });

    mainNav.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", closeNav);
    });

    document.addEventListener("click", (e) => {
      if (mainNav.classList.contains("is-open") && !mainNav.contains(e.target) && !navToggle.contains(e.target)) {
        closeNav();
      }
    });

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && mainNav.classList.contains("is-open")) {
        closeNav();
        navToggle.focus();
      }
    });
  }

  /* 1b. Responsive Table-to-Card Metadata */
  const enhanceResponsiveTables = () => {
    document.querySelectorAll(".data-table").forEach((table) => {
      const headers = Array.from(table.querySelectorAll("thead th")).map((th) => th.textContent.trim());
      if (headers.length === 0) return;

      const isKtp4 = headers.length === 4 && headers[0] === "№";
      const isStem3 = headers.length === 3 && headers[0] === "Четверть" && headers[1] === "№";
      const isWs3 = table.classList.contains("compact-table") && headers.length === 3;

      if (isKtp4) table.setAttribute("data-table-kind", "ktp-4");
      else if (isStem3) table.setAttribute("data-table-kind", "stem-3");
      else if (isWs3) table.setAttribute("data-table-kind", "ws-3");
      else table.setAttribute("data-table-kind", "plan-2");

      table.querySelectorAll("tbody tr").forEach((row) => {
        if (row.classList.contains("chapter-row")) return;
        const cells = Array.from(row.children);

        cells.forEach((cell, idx) => {
          const headerLabel = headers[idx] || "";
          if (headerLabel) {
            cell.setAttribute("data-label", headerLabel);
          }

          if (isKtp4) {
            if (idx === 0) cell.classList.add("cell-num");
            else if (idx === 1) cell.classList.add("cell-title");
            else cell.classList.add("cell-detail");
          } else if (isStem3) {
            if (idx === 0) cell.classList.add("cell-quarter");
            else if (idx === 1) cell.classList.add("cell-num");
            else cell.classList.add("cell-detail");
          } else if (isWs3) {
            if (idx === 0) cell.classList.add("cell-title");
            else cell.classList.add("cell-choice");
          } else {
            if (headerLabel.includes("Четверть")) cell.classList.add("cell-quarter");
            else cell.classList.add("cell-detail");
          }
        });
      });
    });
  };
  enhanceResponsiveTables();

  /* 2. Scroll Reveal via IntersectionObserver */
  const revealItems = document.querySelectorAll(".reveal");
  if (prefersReducedMotion || !("IntersectionObserver" in window)) {
    revealItems.forEach((el) => el.classList.add("is-visible"));
  } else {
    const observer = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            obs.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.08, rootMargin: "0px 0px -32px 0px" }
    );
    revealItems.forEach((el) => observer.observe(el));
  }

  /* 3. Auto-Adaptive Gallery Grid & Broken Image Guard */
  document.querySelectorAll("[data-gallery-grid]").forEach((grid) => {
    const updateCount = () => {
      const visibleCards = grid.querySelectorAll(".gallery-card:not([hidden])").length;
      grid.setAttribute("data-count", String(visibleCards));
    };

    grid.querySelectorAll("img").forEach((img) => {
      img.addEventListener("error", () => {
        const card = img.closest(".gallery-card");
        if (card) {
          card.hidden = true;
          updateCount();
        }
      });
    });

    updateCount();
  });

  /* 4. Interactive Tabs */
  document.querySelectorAll("[data-tabs]").forEach((container) => {
    const buttons = container.querySelectorAll("[data-tab-target]");
    const panels = container.querySelectorAll(".tab-panel");

    buttons.forEach((btn) => {
      btn.addEventListener("click", () => {
        const targetId = btn.getAttribute("data-tab-target");
        buttons.forEach((b) => {
          const active = b === btn;
          b.classList.toggle("is-active", active);
          b.setAttribute("aria-selected", String(active));
        });
        panels.forEach((panel) => {
          const active = panel.id === targetId;
          panel.classList.toggle("is-active", active);
          panel.hidden = !active;
        });
      });
    });
  });

  /* 5. Interactive Accordions */
  const setAccordionState = (item, open) => {
    const trigger = item.querySelector(".accordion-trigger");
    const body = item.querySelector(".accordion-body");
    if (!trigger || !body) return;
    item.classList.toggle("is-open", open);
    trigger.setAttribute("aria-expanded", String(open));
    body.hidden = !open;
  };

  document.querySelectorAll("[data-accordion-group]").forEach((group) => {
    const items = group.querySelectorAll(".accordion-item");
    items.forEach((item) => {
      const trigger = item.querySelector(".accordion-trigger");
      if (!trigger) return;
      trigger.addEventListener("click", () => {
        const isOpen = item.classList.contains("is-open");
        setAccordionState(item, !isOpen);
      });
    });

    const expandAll = group.querySelector("[data-expand-all]");
    const collapseAll = group.querySelector("[data-collapse-all]");
    if (expandAll) {
      expandAll.addEventListener("click", () => items.forEach((it) => setAccordionState(it, true)));
    }
    if (collapseAll) {
      collapseAll.addEventListener("click", () => items.forEach((it) => setAccordionState(it, false)));
    }
  });

  /* 6. Interactive Subject Finder Quiz */
  const quizQuestions = [
    {
      title: "В каком классе учится школьник?",
      options: [
        { label: "5 класс", desc: "Старт в STEM, базовые алгоритмы и космические открытия", weights: { astronomy: 2, robotics: 1, inventor: 1 } },
        { label: "6 класс", desc: "Готов к САПР-чертежам, симуляциям и сложным моделям", weights: { rocketry: 2, inventor: 1, robotics: 1 } },
        { label: "7–8 класс", desc: "Интересны Python, C++, искусственный интеллект и IoT", weights: { robotics: 3, inventor: 1 } }
      ]
    },
    {
      title: "Что вызывает наибольший интерес?",
      options: [
        { label: "Программирование и электроника", desc: "Датчики Arduino, Python, алгоритмы и нейросети", weights: { robotics: 3 } },
        { label: "Ракеты, авиация и 3D-модели", desc: "Аэродинамика, OpenRocket, КОМПАС-3D и запуски", weights: { rocketry: 3 } },
        { label: "Механика, крафт и эксперименты", desc: "Цепные реакции, сборка прототипов и работа руками", weights: { inventor: 3 } },
        { label: "Звёзды, планеты и тайны Вселенной", desc: "Галактики, телескопы, экзопланеты и космонавтика", weights: { astronomy: 3 } }
      ]
    },
    {
      title: "Какой формат занятий нравится больше?",
      options: [
        { label: "Писать код и настраивать платы", desc: "Arduino IDE, CodiPlay, чат-боты и IoT-проекты", weights: { robotics: 2, rocketry: 1 } },
        { label: "Проектировать и симулировать полёты", desc: "Чертежи деталей, расчёт траекторий и сборка корпуса", weights: { rocketry: 2 } },
        { label: "Конструировать и тестировать механизмы", desc: "Подбор материалов, макеты, глина и машина Голдберга", weights: { inventor: 2 } },
        { label: "Квесты, опыты, VR и наблюдения", desc: "Интерактивные рабочие листы, Stellarium и эксперименты", weights: { astronomy: 2 } }
      ]
    },
    {
      title: "Какой итоговый проект хочется сделать?",
      options: [
        { label: "Умный робот или ИИ-приложение", desc: "Автономная платформа или свой чат-бот", weights: { robotics: 2 } },
        { label: "Действующая модель ракеты", desc: "С расчётом в OpenRocket и электроникой на борту", weights: { rocketry: 2 } },
        { label: "Сложная машина Голдберга", desc: "Многоступенчатый механизм цепной реакции", weights: { inventor: 2 } },
        { label: "Космический проект к КосмоФесту", desc: "Модель Галактики, марсоход и дневник исследователя", weights: { astronomy: 2 } }
      ]
    }
  ];

  const subjectProfiles = {
    robotics: {
      name: "Робототехника",
      href: "#robotics",
      summary: "Идеально подойдёт для любителей кода, электроники и современных IT-технологий: Arduino, CodiPlay, Python, IoT и основы ИИ (5, 7–8 классы)."
    },
    rocketry: {
      name: "Ракетостроение",
      href: "#rocketry",
      summary: "Лучший выбор для будущих аэрокосмических инженеров: проектирование в OpenRocket и КОМПАС-3D, бортовая электроника на Arduino и реальные запуски."
    },
    inventor: {
      name: "Юный изобретатель",
      href: "#inventor",
      summary: "Отлично раскроет инженерную смекалку через создание машин Голдберга, законы механики, макетирование и практическую работу в мастерской."
    },
    astronomy: {
      name: "Астрономия & Исследование Космоса",
      href: "#astronomy",
      summary: "Увлекательный 34-часовой курс для 5 класса: 17 глав от Большого взрыва и чёрных дыр до марсоходов, VR-экскурсий, Stellarium и рабочих листов."
    }
  };

  const quizStage = document.getElementById("quiz-stage");
  const quizResult = document.getElementById("quiz-result");
  const quizStepLabel = document.getElementById("quiz-step-label");
  const quizProgressFill = document.getElementById("quiz-progress-fill");
  const quizResetBtn = document.getElementById("quiz-reset");

  if (quizStage && quizResult && quizStepLabel && quizProgressFill && quizResetBtn) {
    let step = 0;
    let scores = { robotics: 0, rocketry: 0, inventor: 0, astronomy: 0 };
    let selectedGrade = "";

    const renderQuiz = () => {
      if (step < quizQuestions.length) {
        const q = quizQuestions[step];
        quizStage.hidden = false;
        quizResult.hidden = true;
        quizResetBtn.hidden = step === 0;
        quizStepLabel.textContent = `Вопрос ${step + 1} из ${quizQuestions.length}`;
        quizProgressFill.style.width = `${((step + 1) / quizQuestions.length) * 100}%`;

        quizStage.innerHTML = "";
        const h3 = document.createElement("h3");
        h3.className = "quiz-question";
        h3.textContent = q.title;
        quizStage.appendChild(h3);

        const optionsWrap = document.createElement("div");
        optionsWrap.className = "quiz-options";

        q.options.forEach((opt) => {
          const btn = document.createElement("button");
          btn.type = "button";
          btn.className = "quiz-option";
          btn.innerHTML = `<strong>${opt.label}</strong><span>${opt.desc}</span>`;
          btn.addEventListener("click", () => {
            if (step === 0) selectedGrade = opt.label;
            Object.entries(opt.weights).forEach(([key, val]) => {
              scores[key] += val;
            });
            step += 1;
            renderQuiz();
          });
          optionsWrap.appendChild(btn);
        });

        quizStage.appendChild(optionsWrap);
      } else {
        const sorted = Object.entries(scores).sort((a, b) => b[1] - a[1]);
        const winnerKey = sorted[0][0];
        const runnerKey = sorted[1][0];
        const winner = subjectProfiles[winnerKey];
        const runner = subjectProfiles[runnerKey];

        quizStage.hidden = true;
        quizResult.hidden = false;
        quizResetBtn.hidden = false;
        quizStepLabel.textContent = "Результат подбора готов";
        quizProgressFill.style.width = "100%";

        quizResult.innerHTML = `
          <div class="quiz-result-card">
            <span class="mono-tag">РЕКОМЕНДАЦИЯ ДЛЯ УЧЕНИКА (${selectedGrade || "5–8 класс"})</span>
            <h3>${winner.name}</h3>
            <p>${winner.summary}</p>
            <div class="quiz-result-meta">
              <a href="${winner.href}" class="btn btn-primary">Перейти к программе «${winner.name}» →</a>
              <a href="${runner.href}" class="btn btn-ghost">Также подойдёт: ${runner.name}</a>
            </div>
          </div>
        `;
      }
    };

    quizResetBtn.addEventListener("click", () => {
      step = 0;
      scores = { robotics: 0, rocketry: 0, inventor: 0, astronomy: 0 };
      selectedGrade = "";
      renderQuiz();
    });

    renderQuiz();
  }

  /* 7. Lightbox Gallery */
  const triggers = Array.from(document.querySelectorAll("[data-lightbox-src]"));
  const lightbox = document.getElementById("lightbox");
  const lbImg = document.getElementById("lightbox-img");
  const lbTitle = document.getElementById("lightbox-title");
  const lbText = document.getElementById("lightbox-text");
  const lbCounter = document.getElementById("lightbox-counter");
  const lbPrev = document.getElementById("lightbox-prev");
  const lbNext = document.getElementById("lightbox-next");

  if (lightbox && triggers.length > 0) {
    let currentIndex = 0;
    let lastFocused = null;

    const showSlide = (idx) => {
      currentIndex = (idx + triggers.length) % triggers.length;
      const item = triggers[currentIndex];
      const img = item.querySelector("img");
      lbImg.src = item.getAttribute("data-lightbox-src") || "";
      lbImg.alt = img ? img.alt : "";
      lbTitle.textContent = item.getAttribute("data-lightbox-title") || "";
      lbText.textContent = item.getAttribute("data-lightbox-caption") || "";
      lbCounter.textContent = `${currentIndex + 1} / ${triggers.length}`;
    };

    const openLightbox = (idx, triggerEl) => {
      lastFocused = triggerEl;
      showSlide(idx);
      lightbox.hidden = false;
      document.body.style.overflow = "hidden";
      const closeBtn = lightbox.querySelector(".lightbox-close");
      if (closeBtn) closeBtn.focus();
    };

    const closeLightbox = () => {
      lightbox.hidden = true;
      document.body.style.overflow = "";
      if (lastFocused && typeof lastFocused.focus === "function") {
        lastFocused.focus();
      }
    };

    triggers.forEach((btn, idx) => {
      btn.addEventListener("click", () => openLightbox(idx, btn));
    });

    lightbox.querySelectorAll("[data-lightbox-close]").forEach((el) => {
      el.addEventListener("click", closeLightbox);
    });

    if (lbPrev) lbPrev.addEventListener("click", () => showSlide(currentIndex - 1));
    if (lbNext) lbNext.addEventListener("click", () => showSlide(currentIndex + 1));

    document.addEventListener("keydown", (e) => {
      if (lightbox.hidden) return;
      if (e.key === "Escape") closeLightbox();
      else if (e.key === "ArrowLeft") showSlide(currentIndex - 1);
      else if (e.key === "ArrowRight") showSlide(currentIndex + 1);
    });
  }
})();
