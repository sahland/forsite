(() => {
  "use strict";

  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const auditDialog = document.querySelector("#audit-dialog");
  const menuDialog = document.querySelector("#menu-dialog");
  const caseDialog = document.querySelector("#case-dialog");
  let returnFocus = null;

  function openDialog(dialog, trigger) {
    returnFocus = trigger;
    document.querySelectorAll("dialog[open]").forEach((item) => item.close());
    dialog.showModal();
  }

  document.querySelector(".menu-toggle").addEventListener("click", (event) => {
    openDialog(menuDialog, event.currentTarget);
  });

  document.querySelectorAll("[data-audit]").forEach((button) => {
    button.addEventListener("click", () => openDialog(auditDialog, button));
  });

  document.querySelectorAll("dialog").forEach((dialog) => {
    dialog
      .querySelector("[data-close]")
      .addEventListener("click", () => dialog.close());
    dialog.addEventListener("click", (event) => {
      // Only the backdrop, not blank space within the dialog, dismisses it.
      if (event.target !== dialog) return;
      const rect = dialog.getBoundingClientRect();
      if (
        event.clientX < rect.left ||
        event.clientX > rect.right ||
        event.clientY < rect.top ||
        event.clientY > rect.bottom
      )
        dialog.close();
    });
    dialog.addEventListener("close", () => {
      if (!document.querySelector("dialog[open]") && returnFocus?.isConnected)
        returnFocus.focus({ preventScroll: true });
    });
  });

  menuDialog.querySelectorAll("nav a").forEach((link) => {
    link.addEventListener("click", () => menuDialog.close());
  });

  const cases = {
    bodywork: {
      category: "Услуги, Воронеж",
      title: "Кузовной центр",
      sections: [
        [
          "Задача",
          "Два объявления объединяли все услуги центра. Покупателю было сложно сразу увидеть предложение под конкретную задачу: ремонт, покраску или полировку.",
        ],
        [
          "Что сделали",
          "Разделили услуги на 13 объявлений под конкретные запросы. Переписали заголовки и тексты, настроили автоответы.",
        ],
        [
          "Что изменилось",
          "Вместо двух общих объявлений — структура из 13 отдельных предложений. Каждая услуга получила свою точку входа из поиска.",
        ],
      ],
      stat: "2 → 13",
      note: "Изменение количества объявлений, не показатель роста продаж.",
    },
    electrician: {
      category: "Услуги, Воронеж",
      title: "Выездной автоэлектрик",
      sections: [
        [
          "Задача",
          "Одно объявление описывало все виды работ. Клиент, который искал решение конкретной неисправности, не всегда находил понятный ответ.",
        ],
        [
          "Что сделали",
          "Переупаковали профиль и разделили предложения по проблемам, с которыми обращаются клиенты. Перестроили подачу под конкретные поисковые запросы.",
        ],
        [
          "Логика решения",
          "Покупателю проще обратиться, когда он узнаёт в объявлении свою проблему. Поэтому отправной точкой стала задача клиента, а не общий перечень услуг.",
        ],
      ],
      stat: "",
      note: "",
    },
  };

  document.querySelectorAll("[data-case]").forEach((button) => {
    button.addEventListener("click", () => {
      const data = cases[button.dataset.case];
      if (!data) return;
      document.querySelector("#case-category").textContent = data.category;
      document.querySelector("#case-title").textContent = data.title;
      const content = document.querySelector("#case-content");
      content.replaceChildren();
      if (data.stat) {
        const stat = document.createElement("div");
        stat.className = "case-stat";
        stat.textContent = data.stat;
        const note = document.createElement("span");
        note.textContent = data.note;
        stat.append(note);
        content.append(stat);
      }
      data.sections.forEach(([heading, description]) => {
        const title = document.createElement("h3");
        title.textContent = heading;
        const text = document.createElement("p");
        text.textContent = description;
        content.append(title, text);
      });
      openDialog(caseDialog, button);
    });
  });

  document.querySelector("#year").textContent = new Date().getFullYear();

  // No hidden content dependency: the observer must be ready before hiding anything.
  if ("IntersectionObserver" in window && !reducedMotion.matches) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.08, rootMargin: "0px 0px -24px 0px" },
    );
    document
      .querySelectorAll("[data-reveal]")
      .forEach((element) => observer.observe(element));
    document.documentElement.classList.add("motion-ready");
  }

  const hero = document.querySelector(".hero");
  const picture = document.querySelector(".hero-picture");
  let framePending = false;

  function updateMotion() {
    framePending = false;
    if (reducedMotion.matches) {
      picture.style.removeProperty("--hero-y");
      document.documentElement.classList.remove("motion-ready");
      return;
    }
    const heroRect = hero.getBoundingClientRect();
    if (heroRect.bottom > 0)
      picture.style.setProperty(
        "--hero-y",
        `${Math.min(window.scrollY * 0.17, 160)}px`,
      );
  }

  function scheduleMotion() {
    if (!framePending) {
      framePending = true;
      window.requestAnimationFrame(updateMotion);
    }
  }

  window.addEventListener("scroll", scheduleMotion, { passive: true });
  window.addEventListener("resize", scheduleMotion, { passive: true });
  reducedMotion.addEventListener("change", scheduleMotion);
  updateMotion();
})();
