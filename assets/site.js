(function () {
  const doc = document;

  function initNavigation() {
    const navToggle = doc.querySelector("[data-nav-toggle]");
    const nav = doc.querySelector("[data-nav]");
    if (!navToggle || !nav) {
      return;
    }

    navToggle.addEventListener("click", function () {
      const isOpen = nav.classList.toggle("is-open");
      navToggle.setAttribute("aria-expanded", String(isOpen));
    });

    nav.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", function () {
        nav.classList.remove("is-open");
        navToggle.setAttribute("aria-expanded", "false");
      });
    });
  }

  function initLanguageToggle() {
    const buttons = Array.from(doc.querySelectorAll("[data-lang-btn]"));
    const i18nNodes = Array.from(doc.querySelectorAll("[data-i18n-de][data-i18n-en]"));
    const translationNotes = Array.from(doc.querySelectorAll("[data-ai-translation-note]"));
    if (!buttons.length || !i18nNodes.length) {
      return;
    }

    const storageKey = "sal_lang";
    const defaultLang = "de";
    const savedLang = localStorage.getItem(storageKey);
    const activeLang = savedLang === "en" ? "en" : defaultLang;
    let currentLang = activeLang;
    const mobileQuery = window.matchMedia("(max-width: 640px)");

    function getI18nValue(node, lang) {
      if (mobileQuery.matches) {
        const mobileValue = node.getAttribute("data-i18n-" + lang + "-mobile");
        if (mobileValue !== null) {
          return mobileValue;
        }
      }
      return node.getAttribute("data-i18n-" + lang);
    }

    function applyLang(lang) {
      currentLang = lang;
      i18nNodes.forEach(function (node) {
        const value = getI18nValue(node, lang);
        if (value !== null) {
          node.innerHTML = value;
        }
      });
      doc.documentElement.lang = lang === "en" ? "en" : "de-CH";
      buttons.forEach(function (btn) {
        btn.classList.toggle("is-active", btn.getAttribute("data-lang-btn") === lang);
      });
      translationNotes.forEach(function (note) {
        const visible = lang === "en";
        note.classList.toggle("is-visible", visible);
        note.setAttribute("aria-hidden", String(!visible));
      });
      localStorage.setItem(storageKey, lang);
    }

    buttons.forEach(function (btn) {
      btn.addEventListener("click", function () {
        const lang = btn.getAttribute("data-lang-btn");
        applyLang(lang === "en" ? "en" : "de");
      });
    });

    if (typeof mobileQuery.addEventListener === "function") {
      mobileQuery.addEventListener("change", function () {
        applyLang(currentLang);
      });
    } else if (typeof mobileQuery.addListener === "function") {
      mobileQuery.addListener(function () {
        applyLang(currentLang);
      });
    }

    applyLang(activeLang);
  }

  function initQuoteSlider() {
    const slider = doc.querySelector("[data-slider]");
    if (!slider) {
      return;
    }

    const slides = Array.from(slider.querySelectorAll(".quote-slide"));
    if (!slides.length) {
      return;
    }

    const prevBtn = slider.querySelector("[data-slider-prev]");
    const nextBtn = slider.querySelector("[data-slider-next]");
    let activeSlide = slides.findIndex(function (slide) {
      return slide.classList.contains("is-active");
    });
    if (activeSlide < 0) {
      activeSlide = 0;
      slides[0].classList.add("is-active");
    }

    function showSlide(index) {
      slides[activeSlide].classList.remove("is-active");
      activeSlide = (index + slides.length) % slides.length;
      slides[activeSlide].classList.add("is-active");
    }

    if (prevBtn) {
      prevBtn.addEventListener("click", function () {
        showSlide(activeSlide - 1);
      });
    }

    if (nextBtn) {
      nextBtn.addEventListener("click", function () {
        showSlide(activeSlide + 1);
      });
    }

    if (slides.length > 1) {
      window.setInterval(function () {
        showSlide(activeSlide + 1);
      }, 6500);
    }
  }

  function initGalleryScrollControls() {
    const shells = Array.from(doc.querySelectorAll(".gallery-shell"));
    shells.forEach(function (shell) {
      const track = shell.querySelector("[data-gallery-track]");
      if (!track) {
        return;
      }

      function galleryStep() {
        const card = track.querySelector(".gallery-item");
        if (!card) {
          return 280;
        }
        const styles = window.getComputedStyle(track);
        const gap = parseFloat(styles.columnGap || styles.gap || "0");
        return card.getBoundingClientRect().width + gap;
      }

      const prev = shell.querySelector("[data-gallery-prev]");
      const next = shell.querySelector("[data-gallery-next]");
      if (prev) {
        prev.addEventListener("click", function () {
          track.scrollBy({ left: -galleryStep(), behavior: "smooth" });
        });
      }
      if (next) {
        next.addEventListener("click", function () {
          track.scrollBy({ left: galleryStep(), behavior: "smooth" });
        });
      }
    });
  }

  function initLightbox() {
    const tracks = Array.from(doc.querySelectorAll("[data-lightbox-gallery]"));
    if (!tracks.length) {
      return;
    }

    const lightbox = doc.createElement("div");
    lightbox.className = "lightbox";
    lightbox.innerHTML =
      '<div class="lightbox-backdrop" data-lightbox-close></div>' +
      '<div class="lightbox-inner">' +
      '  <div class="lightbox-frame">' +
      '    <img class="lightbox-image" alt="">' +
      '    <div class="lightbox-nav-wrap">' +
      '      <button type="button" class="lightbox-nav" data-lightbox-prev aria-label="Previous image">Prev</button>' +
      '      <button type="button" class="lightbox-nav" data-lightbox-next aria-label="Next image">Next</button>' +
      "    </div>" +
      "  </div>" +
      '  <div class="lightbox-toolbar">' +
      '    <p class="lightbox-caption"></p>' +
      '    <button type="button" class="lightbox-close" data-lightbox-close aria-label="Close lightbox">Close</button>' +
      "  </div>" +
      "</div>";
    doc.body.appendChild(lightbox);

    const imageNode = lightbox.querySelector(".lightbox-image");
    const captionNode = lightbox.querySelector(".lightbox-caption");
    const closeButtons = Array.from(lightbox.querySelectorAll("[data-lightbox-close]"));
    const prevButton = lightbox.querySelector("[data-lightbox-prev]");
    const nextButton = lightbox.querySelector("[data-lightbox-next]");

    let currentItems = [];
    let currentIndex = 0;

    function setImage(index) {
      if (!currentItems.length) {
        return;
      }
      currentIndex = (index + currentItems.length) % currentItems.length;
      const item = currentItems[currentIndex];
      imageNode.src = item.src;
      imageNode.alt = item.alt;
      captionNode.textContent = item.caption;
    }

    function open(items, index) {
      currentItems = items;
      setImage(index);
      lightbox.classList.add("is-open");
      doc.body.style.overflow = "hidden";
    }

    function close() {
      lightbox.classList.remove("is-open");
      doc.body.style.overflow = "";
    }

    if (prevButton) {
      prevButton.addEventListener("click", function () {
        setImage(currentIndex - 1);
      });
    }
    if (nextButton) {
      nextButton.addEventListener("click", function () {
        setImage(currentIndex + 1);
      });
    }

    closeButtons.forEach(function (button) {
      button.addEventListener("click", close);
    });

    doc.addEventListener("keydown", function (event) {
      if (!lightbox.classList.contains("is-open")) {
        return;
      }
      if (event.key === "Escape") {
        close();
      } else if (event.key === "ArrowLeft") {
        setImage(currentIndex - 1);
      } else if (event.key === "ArrowRight") {
        setImage(currentIndex + 1);
      }
    });

    tracks.forEach(function (track) {
      const images = Array.from(track.querySelectorAll(".gallery-item img"));
      const items = images.map(function (img) {
        const figure = img.closest(".gallery-item");
        const captionNodeLocal = figure ? figure.querySelector("figcaption") : null;
        return {
          src: img.currentSrc || img.src,
          alt: img.alt || "",
          caption: captionNodeLocal ? captionNodeLocal.textContent.trim() : img.alt || ""
        };
      });

      images.forEach(function (img, index) {
        const figure = img.closest(".gallery-item");
        const target = figure || img;
        target.addEventListener("click", function () {
          open(items, index);
        });
      });
    });
  }

  function initYear() {
    const year = doc.getElementById("year");
    if (year) {
      year.textContent = String(new Date().getFullYear());
    }
  }

  function applyStaggerDelays() {
    const groups = Array.from(doc.querySelectorAll("[data-stagger]"));
    groups.forEach(function (group) {
      const reveals = Array.from(group.querySelectorAll(".reveal"));
      reveals.forEach(function (node, index) {
        node.style.setProperty("--reveal-delay", String(index * 65) + "ms");
      });
    });
  }

  function initRevealObserver() {
    const revealNodes = Array.from(doc.querySelectorAll(".reveal"));
    if (!revealNodes.length) {
      return;
    }

    const observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.14, rootMargin: "0px 0px -50px 0px" }
    );

    revealNodes.forEach(function (node) {
      observer.observe(node);
    });
  }

  initNavigation();
  initLanguageToggle();
  initQuoteSlider();
  initGalleryScrollControls();
  initLightbox();
  initYear();
  applyStaggerDelays();
  initRevealObserver();
})();
