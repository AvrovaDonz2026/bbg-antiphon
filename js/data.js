/* Antiphon — data loading, normalisation and small utilities */
window.Antiphon = window.Antiphon || {};

(function (A) {
  A.state = {
    blog: null,
    themeCfg: {},
    cfg: {},
    articles: [],
    pages: [],
    visible: [],
    lang: "简体中文",
    markedPromise: null,
    scriptPromises: {},
    stylePromises: {}
  };

  A.DEFAULT_THEME_CFG = {
    "外观": {
      "默认模式": "auto",
      "链接颜色": "",
      "链接颜色（暗色）": "",
      "版心宽度（rem）": 0,
      "首字下沉": true,
      "显示页边目录": true,
      "界面使用衬线": null,
      "档案标记": true,
      "显示访客编号": true
    },
    "窗光": {
      "启用": true,
      "强度": 0.45,
      "粒子密度": 0.5,
      "帧率上限": 60,
      "默认开启": true
    },
    "阅读": {
      "显示阅读时长": true
    }
  };

  function isPlainObject(value) {
    return value !== null && typeof value === "object" && !Array.isArray(value);
  }

  function deepMerge(base, extra) {
    var out = Array.isArray(base) ? base.slice() : Object.assign({}, base);
    if (!isPlainObject(extra)) return out;
    Object.keys(extra).forEach(function (key) {
      var value = extra[key];
      if (isPlainObject(value) && isPlainObject(out[key])) {
        out[key] = deepMerge(out[key], value);
      } else if (value !== undefined) {
        out[key] = value;
      }
    });
    return out;
  }

  A.deepMerge = deepMerge;

  function parseLegacyTime(value) {
    if (typeof value === "number" && isFinite(value) && value > 0) return value;
    if (typeof value === "string" && value.trim() !== "") {
      var parsed = Date.parse(value.trim().replace(/\./g, "-"));
      if (isFinite(parsed) && parsed > 0) return parsed;
    }
    return 0;
  }

  function normalizeTime(raw, primaryKey, legacyKey) {
    var primary = Number(raw[primaryKey]);
    if (isFinite(primary) && primary > 0) return primary;
    return parseLegacyTime(raw[legacyKey]);
  }

  function normalizeArticle(raw, index) {
    if (!raw || typeof raw !== "object") return null;
    var filename = String(raw["文件名"] || "").trim();
    if (!filename) return null;
    var tags = Array.isArray(raw["标签"]) ? raw["标签"] : [];
    tags = tags
      .map(function (tag) { return String(tag == null ? "" : tag).trim(); })
      .filter(function (tag) { return tag !== ""; });
    return {
      index: index,
      title: String(raw["文章标题"] || filename),
      filename: filename,
      tags: tags,
      excerpt: String(raw["摘要"] || ""),
      created: normalizeTime(raw, "创建时间（时间戳）", "创建日期"),
      modified: normalizeTime(raw, "修改时间（时间戳）", "修改日期"),
      pinned: raw["是否置顶"] === true,
      hidden: raw["是否隐藏"] === true,
      comments: raw["启用评论"] === true,
      encrypted: raw["是否加密"] === true
    };
  }

  function normalizePage(raw, index) {
    if (!raw || typeof raw !== "object") return null;
    var filename = String(raw["文件名"] || "").trim();
    if (!filename) return null;
    var title = String(raw["页面标题"] || filename);
    return {
      index: index,
      title: title,
      filename: filename,
      inMenu: raw["是否显示在菜单中"] === true,
      menuLabel: String(raw["若显示在菜单中，则在菜单中显示为"] || title),
      newTab: raw["是否在新标签页打开"] === true,
      fullHtml: raw["这是一个完整的html"] === true,
      comments: raw["启用评论"] === true
    };
  }

  function ensureShape(blog) {
    blog["文章列表"] = Array.isArray(blog["文章列表"]) ? blog["文章列表"] : [];
    blog["页面列表"] = Array.isArray(blog["页面列表"]) ? blog["页面列表"] : [];
    blog["友人帐"] = Array.isArray(blog["友人帐"]) ? blog["友人帐"] : [];
    blog["菜单中的外部链接"] = Array.isArray(blog["菜单中的外部链接"]) ? blog["菜单中的外部链接"] : [];
    blog["全局主题设置"] = isPlainObject(blog["全局主题设置"]) ? blog["全局主题设置"] : {};
    blog["全局评论设置"] = isPlainObject(blog["全局评论设置"]) ? blog["全局评论设置"] : {};
    blog["Markdown渲染配置"] = isPlainObject(blog["Markdown渲染配置"]) ? blog["Markdown渲染配置"] : {};
    blog["自定义界面文本"] = isPlainObject(blog["自定义界面文本"]) ? blog["自定义界面文本"] : { "启用": false, "列表": [] };
    blog["一言设置"] = isPlainObject(blog["一言设置"]) ? blog["一言设置"] : { "启用一言": false, "范围设置": {} };
    blog["静态资源"] = isPlainObject(blog["静态资源"]) ? blog["静态资源"] : {};
    return blog;
  }

  A.loadBlog = async function () {
    var controller = typeof AbortController !== "undefined" ? new AbortController() : null;
    var timer = null;
    if (controller) {
      timer = setTimeout(function () { controller.abort(); }, 8000);
    }
    try {
      var response = await fetch("./data/index.json?t=" + Date.now(), {
        cache: "no-store",
        signal: controller ? controller.signal : undefined
      });
      if (!response.ok) throw new Error("HTTP " + response.status);
      var blog = ensureShape(await response.json());
      var articles = (blog["文章列表"] || [])
        .map(normalizeArticle)
        .filter(function (item) { return item !== null; });
      var pages = (blog["页面列表"] || [])
        .map(normalizePage)
        .filter(function (item) { return item !== null; });
      articles.forEach(function (article, i) { article.index = i; });
      pages.forEach(function (page, i) { page.index = i; });

      A.state.blog = blog;
      A.state.articles = articles;
      A.state.pages = pages;
      A.state.visible = articles.filter(function (article) { return !article.hidden; });
      return blog;
    } finally {
      if (timer) clearTimeout(timer);
    }
  };

  A.loadThemeConfig = async function () {
    var defaults = JSON.parse(JSON.stringify(A.DEFAULT_THEME_CFG));
    try {
      var response = await fetch("./themecfg/themecfg.json?t=" + Date.now(), { cache: "no-store" });
      if (!response.ok) throw new Error("HTTP " + response.status);
      var parsed = await response.json();
      A.state.themeCfg = parsed && typeof parsed === "object" ? parsed : {};
    } catch (error) {
      A.state.themeCfg = {};
      if (String(error && error.message).indexOf("JSON") !== -1) {
        console.warn("[Antiphon] themecfg.json 解析失败，使用默认配置：", error);
      }
    }
    A.state.cfg = deepMerge(defaults, A.state.themeCfg);
    return A.state.cfg;
  };

  A.getArticle = function (filename) {
    return A.state.articles.find(function (article) { return article.filename === filename; }) || null;
  };

  A.getPage = function (filename) {
    return A.state.pages.find(function (page) { return page.filename === filename; }) || null;
  };

  A.homeOrder = function () {
    var visible = A.state.visible;
    return visible
      .filter(function (article) { return article.pinned; })
      .concat(visible.filter(function (article) { return !article.pinned; }));
  };

  A.visibleAround = function (filename) {
    var list = A.state.visible;
    var index = list.findIndex(function (article) { return article.filename === filename; });
    return {
      prev: index > 0 ? list[index - 1] : null,
      next: index >= 0 && index < list.length - 1 ? list[index + 1] : null
    };
  };

  A.cdn = function (path) {
    var blog = A.state.blog || {};
    var base = blog["CDN路径"] || "https://unpkg.com";
    return String(base).replace(/\/$/, "") + "/" + String(path).replace(/^\//, "");
  };

  A.loadScript = function (src) {
    if (A.state.scriptPromises[src]) return A.state.scriptPromises[src];
    A.state.scriptPromises[src] = new Promise(function (resolve, reject) {
      var script = document.createElement("script");
      script.src = src;
      script.async = true;
      script.onload = function () { resolve(script); };
      script.onerror = function () { reject(new Error("无法加载脚本：" + src)); };
      document.head.appendChild(script);
    });
    return A.state.scriptPromises[src];
  };

  A.loadStyle = function (href) {
    if (A.state.stylePromises[href]) return A.state.stylePromises[href];
    A.state.stylePromises[href] = new Promise(function (resolve, reject) {
      var link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = href;
      link.onload = function () { resolve(link); };
      link.onerror = function () { reject(new Error("无法加载样式：" + href)); };
      document.head.appendChild(link);
    });
    return A.state.stylePromises[href];
  };

  A.ensureMarked = function () {
    if (window.marked) return Promise.resolve(window.marked);
    if (A.state.markedPromise) return A.state.markedPromise;
    A.state.markedPromise = A.loadScript(A.cdn("marked@4.3.0/marked.min.js")).then(function () {
      if (!window.marked) throw new Error("marked 未就绪");
      return window.marked;
    });
    return A.state.markedPromise;
  };

  A.fetchText = async function (url) {
    var response = await fetch(url + (url.indexOf("?") === -1 ? "?t=" + Date.now() : "&t=" + Date.now()), {
      cache: "no-store"
    });
    if (!response.ok) throw new Error("HTTP " + response.status);
    return response.text();
  };

  A.articleUrl = function (filename, withCacheBust) {
    var url = "./data/articles/" + encodeURIComponent(filename);
    return withCacheBust === false ? url : url + "?t=" + Date.now();
  };

  A.pageUrl = function (filename) {
    return "./data/pages/" + encodeURIComponent(filename);
  };

  A.esc = function (value) {
    return String(value == null ? "" : value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  };

  A.fmtDate = function (ms) {
    if (!ms || !isFinite(ms)) return "—";
    var date = new Date(ms);
    return (
      date.getFullYear() +
      "." +
      String(date.getMonth() + 1).padStart(2, "0") +
      "." +
      String(date.getDate()).padStart(2, "0")
    );
  };

  A.dateParts = function (ms) {
    if (!ms || !isFinite(ms)) return { year: "—", monthday: "—", full: "—" };
    var date = new Date(ms);
    return {
      year: String(date.getFullYear()),
      monthday: String(date.getMonth() + 1).padStart(2, "0") + "." + String(date.getDate()).padStart(2, "0"),
      full: A.fmtDate(ms)
    };
  };

  A.roman = function (number) {
    var n = Math.floor(Number(number));
    if (!isFinite(n) || n <= 0) return "—";
    if (n >= 4000) return String(n);
    var map = [
      [1000, "M"], [900, "CM"], [500, "D"], [400, "CD"],
      [100, "C"], [90, "XC"], [50, "L"], [40, "XL"],
      [10, "X"], [9, "IX"], [5, "V"], [4, "IV"], [1, "I"]
    ];
    var out = "";
    for (var i = 0; i < map.length; i++) {
      while (n >= map[i][0]) {
        out += map[i][1];
        n -= map[i][0];
      }
    }
    return out;
  };

  A.readingMinutes = function (text) {
    var content = String(text || "");
    var cjk = (content.match(/\p{Script=Han}/gu) || []).length;
    var words = (content.match(/[A-Za-z]+(?:['\u2019-][A-Za-z]+)*/g) || []).length;
    var minutes = Math.ceil(cjk / 300 + words / 220);
    return Math.max(1, minutes);
  };

  A.stripHtml = function (html) {
    var div = document.createElement("div");
    div.innerHTML = String(html || "");
    return (div.textContent || div.innerText || "").replace(/\s+/g, " ").trim();
  };

  A.getCfg = function (path, fallback) {
    var value = A.state.cfg;
    var parts = String(path).split(".");
    for (var i = 0; i < parts.length; i++) {
      if (value == null || typeof value !== "object") return fallback;
      value = value[parts[i]];
    }
    return value === undefined || value === null ? fallback : value;
  };

  A.clamp = function (value, min, max) {
    var number = Number(value);
    if (!isFinite(number)) number = min;
    return Math.min(max, Math.max(min, number));
  };

  A.copyText = function (text) {
    var value = String(text == null ? "" : text);
    function fallback() {
      var area = document.createElement("textarea");
      area.value = value;
      area.setAttribute("readonly", "");
      area.style.position = "fixed";
      area.style.opacity = "0";
      document.body.appendChild(area);
      area.select();
      try { document.execCommand("copy"); } catch (error) {}
      document.body.removeChild(area);
    }
    if (navigator.clipboard && navigator.clipboard.writeText) {
      return navigator.clipboard.writeText(value).catch(fallback);
    }
    fallback();
    return Promise.resolve();
  };
})(window.Antiphon);
