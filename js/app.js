/* Antiphon — boot, appearance, light and extensions */
window.Antiphon = window.Antiphon || {};

(function (A) {
  var MODE_KEY = "antiphon:mode";
  var LIGHT_KEY = "antiphon:light";
  var VISITOR_KEY = "antiphon:visitor";
  var media = window.matchMedia ? window.matchMedia("(prefers-color-scheme: dark)") : null;
  var reducedMotion = function () {
    return window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  };

  function isSafeColor(value) {
    if (!value) return false;
    var text = String(value).trim();
    if (!text || /[;{}<>]/.test(text)) return false;
    try {
      return window.CSS && CSS.supports && CSS.supports("color", text);
    } catch (error) {
      return false;
    }
  }

  function isSafeUrl(value) {
    var text = String(value || "").trim();
    if (!text || /["'<>]/.test(text)) return false;
    return /^(https?:)?\/\//i.test(text) || /^\.?\//.test(text);
  }

  /* The per-language defaults live in css/tokens.css as body[data-script] rules.
     applyCfg() only intervenes when the blog owner asks for something different:
     外观.版心宽度（rem） wins outright, and the 使版心宽度更窄 switch narrows
     whatever language default is in force. Writing on <body> (not <html>) is
     deliberate: the token layer declares --measure there too, so an inline value
     on <body> is the only thing that reliably wins over it. */
  /* 使版心宽度更窄 subtracts 4rem from whichever language default is in force,
     matching how the switch behaved before the language scale was introduced. */
  function narrowMeasure() {
    if (A.lang === "English") return 30;
    if (A.lang === "日本語") return 34;
    return 36;
  }

  function applyCfg() {
    var blog = A.state.blog;
    var cfg = A.state.cfg || {};

    var width = Number(cfg["外观"] && cfg["外观"]["版心宽度（rem）"]);
    if (isFinite(width) && width > 0) {
      document.body.style.setProperty("--measure", A.clamp(width, 32, 44) + "rem");
    } else if (blog["使版心宽度更窄（提高左右页边距）"] === true) {
      document.body.style.setProperty("--measure", narrowMeasure() + "rem");
    } else {
      /* fall through to the data-script default in css/tokens.css */
      document.body.style.removeProperty("--measure");
    }

    var serifSetting = cfg["外观"] ? cfg["外观"]["界面使用衬线"] : null;
    var useSerif =
      serifSetting === true ||
      (serifSetting === null && blog["优先使用衬线字体"] === true);
    /* Written on <body>, not <html>: --font-serif is per-language (Japanese leads
       with a Mincho), and a custom property resolves var() on the element that
       declares it. On <html> the Japanese stack would never be picked up. */
    document.body.style.setProperty(
      "--font-ui",
      useSerif ? "var(--font-serif)" : "var(--font-ui-sans)"
    );

    var dayColor = cfg["外观"] ? cfg["外观"]["链接颜色"] : "";
    var nightColor = cfg["外观"] ? cfg["外观"]["链接颜色（暗色）"] : "";
    var linkStyle = document.getElementById("antiphon-link-override");
    if ((isSafeColor(dayColor) || isSafeColor(nightColor)) ) {
      if (!linkStyle) {
        linkStyle = document.createElement("style");
        linkStyle.id = "antiphon-link-override";
        document.head.appendChild(linkStyle);
      }
      linkStyle.textContent =
        (isSafeColor(dayColor) ? 'body[data-mode="day"]{--link:' + dayColor + ";}" : "") +
        (isSafeColor(nightColor) ? 'body[data-mode="night"]{--link:' + nightColor + ";}" : "");
    } else if (linkStyle) {
      linkStyle.textContent = "";
    }

    var theme = blog["全局主题设置"] || {};
    var hasImage = false;
    if (theme["是否使用纯色背景（优先级高于背景图像）"] === true && isSafeColor(theme["若使用纯色背景，颜色为"])) {
      document.body.style.setProperty("--wall", String(theme["若使用纯色背景，颜色为"]).trim());
    } else if (theme["是否使用背景图像"] === true) {
      var set = theme["若使用背景图像，设置为"] || {};
      var url = "";
      if (set["将网站根目录下的background.webp作为背景图像"] === true) {
        url = "./background.webp";
      } else if (set["将某个url作为背景图像"] === true) {
        url = set["若将某个url作为背景图像，这个url是"] || "";
      }
      if (isSafeUrl(url)) {
        hasImage = true;
        document.body.style.setProperty("--wall-image", 'url("' + String(url).replace(/"/g, "%22") + '")');
      }
    }
    document.body.classList.toggle("has-wall-image", hasImage);

    var stat = blog["静态资源"] || {};
    var icon = document.querySelector('link[rel="icon"]');
    if (icon && stat["资源目录"] && stat["网页图标文件名"]) {
      icon.href = "./" + stat["资源目录"] + "/" + stat["网页图标文件名"];
    }
    var description = document.querySelector('meta[name="description"]');
    if (description) description.setAttribute("content", String(blog["博客描述（副标题）"] || ""));
  }

  function randomVisitor() {
    var bytes = null;
    try {
      if (window.crypto && window.crypto.getRandomValues) {
        bytes = new Uint8Array(2);
        window.crypto.getRandomValues(bytes);
      }
    } catch (error) {}
    if (bytes) {
      var hex = "";
      for (var i = 0; i < bytes.length; i++) {
        hex += (bytes[i] + 0x100).toString(16).slice(1);
      }
      return hex.toUpperCase();
    }
    return (Math.floor(Math.random() * 0x10000) + 0x10000).toString(16).slice(1).toUpperCase();
  }

  function ensureVisitor() {
    var value = null;
    try { value = localStorage.getItem(VISITOR_KEY); } catch (error) {}
    if (!/^[0-9A-F]{4}$/.test(String(value || ""))) {
      value = randomVisitor();
      try { localStorage.setItem(VISITOR_KEY, value); } catch (error) {}
    }
    A.visitor = value;
  }

  function storedMode() {
    var value = null;
    try { value = localStorage.getItem(MODE_KEY); } catch (error) {}
    return value === "day" || value === "night" || value === "auto" ? value : null;
  }

  function resolveMode() {
    var pref = storedMode();
    if (pref === "day" || pref === "night") return pref;
    if (pref === "auto") return media && media.matches ? "night" : "day";
    var fallback = A.getCfg("外观.默认模式", "auto");
    if (fallback === "day" || fallback === "night") return fallback;
    return media && media.matches ? "night" : "day";
  }

  function updateModeButton(mode) {
    var button = document.getElementById("mode-btn");
    if (!button) return;
    button.innerHTML = A.views.icon(mode === "day" ? "moon" : "sun");
    button.setAttribute("aria-label", A.t(mode === "day" ? "THEME_NIGHT" : "THEME_DAY"));
  }

  function applyMode() {
    var mode = resolveMode();
    document.body.setAttribute("data-mode", mode);
    var themeMeta = document.querySelector('meta[name="theme-color"]');
    if (themeMeta) themeMeta.setAttribute("content", mode === "night" ? "#121110" : "#EDEAE0");
    updateModeButton(mode);
    if (A.light && A.light.setTheme) A.light.setTheme(mode === "night");
    if (A.views && A.views.renderFooter) A.views.renderFooter();
  }

  function toggleMode() {
    var next = resolveMode() === "day" ? "night" : "day";
    try { localStorage.setItem(MODE_KEY, next); } catch (error) {}
    applyMode();
  }

  function lightEnabledByCfg() {
    var cfg = A.getCfg("窗光", {});
    return cfg["启用"] !== false;
  }

  function updateLightButton(on) {
    var button = document.getElementById("light-btn");
    if (!button) return;
    button.setAttribute("aria-label", A.t(on ? "LIGHT_OFF" : "LIGHT_ON"));
  }

  function initLight() {
    var cfg = A.getCfg("窗光", {});
    if (cfg["启用"] === false) {
      document.body.setAttribute("data-light", "off");
      return;
    }
    var stored = null;
    try { stored = localStorage.getItem(LIGHT_KEY); } catch (error) {}
    var on = stored === null ? cfg["默认开启"] !== false : stored === "on";
    var options = {
      intensity: A.clamp(cfg["强度"], 0, 1),
      dust: A.clamp(cfg["粒子密度"], 0, 1),
      fps: [30, 45, 60].indexOf(Number(cfg["帧率上限"])) !== -1 ? Number(cfg["帧率上限"]) : 60,
      dark: document.body.getAttribute("data-mode") === "night",
      enabled: on
    };
    if (A.light && A.light.start) {
      A.light.start(document.getElementById("light-canvas"), options);
    }
    updateLightButton(on);
  }

  function toggleLight() {
    if (!lightEnabledByCfg()) return;
    var on = document.body.getAttribute("data-light") === "on";
    var next = !on;
    try { localStorage.setItem(LIGHT_KEY, next ? "on" : "off"); } catch (error) {}
    if (A.light && A.light.setEnabled) A.light.setEnabled(next);
    updateLightButton(next);
    if (A.views && A.views.renderFooter) A.views.renderFooter();
  }

  function openViewer(src, caption) {
    var viewer = document.getElementById("image-viewer");
    var image = document.getElementById("viewer-img");
    if (!viewer || !image) return;
    image.src = src;
    image.alt = caption || "";
    document.getElementById("viewer-caption").textContent = caption || "";
    viewer.hidden = false;
    document.body.style.overflow = "hidden";
  }

  function closeViewer() {
    var viewer = document.getElementById("image-viewer");
    if (!viewer) return;
    viewer.hidden = true;
    document.getElementById("viewer-img").src = "";
    document.body.style.overflow = "";
  }

  A.openViewer = openViewer;
  A.closeViewer = closeViewer;

  function bindShell() {
    var searchBtn = document.getElementById("search-btn");
    if (searchBtn && A.views.openSearch) {
      searchBtn.addEventListener("click", function () { A.views.openSearch(); });
    }
    var modeBtn = document.getElementById("mode-btn");
    if (modeBtn) modeBtn.addEventListener("click", toggleMode);
    var lightBtn = document.getElementById("light-btn");
    if (lightBtn) lightBtn.addEventListener("click", toggleLight);

    document.addEventListener("keydown", function (event) {
      var key = event.key;
      if (key === "Escape") {
        var search = document.getElementById("search-overlay");
        var viewer = document.getElementById("image-viewer");
        if (search && !search.hidden && A.views.closeSearch) A.views.closeSearch();
        if (viewer && !viewer.hidden) closeViewer();
        return;
      }
      if (key === "/" && !event.metaKey && !event.ctrlKey && !event.altKey) {
        var target = event.target;
        var typing =
          target &&
          (target.tagName === "INPUT" ||
            target.tagName === "TEXTAREA" ||
            target.tagName === "SELECT" ||
            target.isContentEditable);
        if (!typing && A.views.openSearch) {
          event.preventDefault();
          A.views.openSearch();
        }
      }
    });

    var searchOverlay = document.getElementById("search-overlay");
    if (searchOverlay) {
      searchOverlay.addEventListener("click", function (event) {
        if (event.target === searchOverlay && A.views.closeSearch) A.views.closeSearch();
      });
    }
    var searchClose = document.getElementById("search-close");
    if (searchClose && A.views.closeSearch) {
      searchClose.addEventListener("click", function () { A.views.closeSearch(); });
    }

    var viewer = document.getElementById("image-viewer");
    if (viewer) {
      viewer.addEventListener("click", function (event) {
        if (event.target === viewer) closeViewer();
      });
    }
    var viewerClose = document.getElementById("viewer-close");
    if (viewerClose) viewerClose.addEventListener("click", closeViewer);

    document.addEventListener("click", function (event) {
      var image = event.target && event.target.closest ? event.target.closest("img[data-viewer]") : null;
      if (!image) return;
      var figure = image.closest("figure");
      var captionNode = figure ? figure.querySelector("figcaption") : null;
      var caption = (captionNode && captionNode.textContent) || image.getAttribute("alt") || "";
      openViewer(image.currentSrc || image.src, caption.trim());
    });

    var backToTop = document.getElementById("back-to-top");
    if (backToTop) {
      backToTop.addEventListener("click", function () {
        window.scrollTo({ top: 0, behavior: reducedMotion() ? "auto" : "smooth" });
      });
    }
    var progress = document.querySelector("#progress > span");
    window.addEventListener(
      "scroll",
      function () {
        if (backToTop) {
          var show = window.scrollY > window.innerHeight * 1.5;
          backToTop.hidden = !show;
        }
        if (progress) {
          var doc = document.documentElement;
          var max = doc.scrollHeight - window.innerHeight;
          var ratio = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
          progress.style.width = (ratio * 100).toFixed(2) + "%";
        }
      },
      { passive: true }
    );
  }

  function runExtensions() {
    var blog = A.state.blog;
    if (!blog) return;
    if (blog["启用自定义CSS"] === true && !document.getElementById("antiphon-custom-css")) {
      var style = document.createElement("style");
      style.id = "antiphon-custom-css";
      style.textContent = String(blog["自定义CSS"] || "");
      document.head.appendChild(style);
    }
    if (blog["启用自定义JS"] === true && blog["自定义JS"]) {
      try {
        window.eval(String(blog["自定义JS"]));
      } catch (error) {
        console.error("[Antiphon] 自定义 JS 执行失败：", error);
      }
    }
    if (blog["是否启用插件功能"] === true) {
      (blog["插件列表"] || []).forEach(function (plugin) {
        if (!plugin || plugin["是否启用此插件"] !== true) return;
        try {
          window.eval(String(plugin["插件内容"] || ""));
        } catch (error) {
          console.error("[Antiphon] 插件执行失败：", plugin["插件名称"] || "", error);
        }
      });
    }
  }

  A.runExtensions = runExtensions;

  async function boot() {
    try {
      await A.loadThemeConfig();
      await A.loadBlog();
    } catch (error) {
      console.error("[Antiphon] 站点数据加载失败：", error);
      A.views.showError(String(error && error.message ? error.message : error));
      return;
    }

    A.setLang(A.state.blog["网站语言"]);
    /* A.setLang sets data-script too; asserted here so the token layer is resolved
       before applyCfg() and before the first view paints — no post-render jump. */
    A.setScript(A.lang);
    A.applyInterfaceText(A.state.blog);
    window.blog = A.state.blog;

    applyCfg();
    applyMode();
    ensureVisitor();
    A.views.renderShell();
    bindShell();
    initLight();

    A.ensureMarked()
      .then(function () { A.views.renderFooter(); })
      .catch(function (error) { console.warn("[Antiphon] Markdown 渲染器未加载：", error.message); });

    A.renderRoute();
  }

  A.app = {
    boot: boot,
    applyMode: applyMode,
    toggleMode: toggleMode,
    toggleLight: toggleLight,
    appliedMode: function () { return document.body.getAttribute("data-mode"); },
    afterRoute: function () {
      if (A.light && A.light.setTheme) A.light.setTheme(document.body.getAttribute("data-mode") === "night");
    }
  };

  if (media && media.addEventListener) {
    media.addEventListener("change", function () {
      var pref = storedMode();
      if (pref === "auto" || (pref === null && A.getCfg("外观.默认模式", "auto") === "auto")) {
        applyMode();
      }
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})(window.Antiphon);
