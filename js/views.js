/* Antiphon — shell, panels and views */
window.Antiphon = window.Antiphon || {};

(function (A) {
  var V = (A.views = A.views || {});

  V.icon = function (name) {
    var paths = {
      search:
        '<circle cx="7" cy="7" r="4.4"/><path d="M10.4 10.4 14 14"/>',
      moon:
        '<path d="M12.6 3.2a6.2 6.2 0 1 0 4.4 10.6 7 7 0 0 1-4.4-10.6Z"/>',
      sun:
        '<circle cx="8" cy="8" r="3"/><path d="M8 1.2v1.6M8 13.2v1.6M1.2 8h1.6M13.2 8h1.6M3.2 3.2l1.1 1.1M11.7 11.7l1.1 1.1M12.8 3.2l-1.1 1.1M4.3 11.7l-1.1 1.1"/>',
      candle:
        '<path d="M8 2.2c1.6 1.4 2.4 2.4 2.4 3.7a2.4 2.4 0 0 1-4.8 0c0-1.3.8-2.3 2.4-3.7Z"/><path d="M5 8.6h6v5.2H5z"/>'
    };
    return (
      '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.1" stroke-linecap="square" aria-hidden="true">' +
      (paths[name] || "") +
      "</svg>"
    );
  };

  V.sigil = function (size) {
    size = size || 18;
    return (
      '<svg class="sigil" viewBox="0 0 80 80" width="' + size + '" height="' + size + '" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1">' +
      '<circle cx="40" cy="40" r="34" opacity=".18" vector-effect="non-scaling-stroke"/>' +
      '<circle cx="40" cy="40" r="26" opacity=".3" vector-effect="non-scaling-stroke"/>' +
      '<circle cx="40" cy="40" r="18" opacity=".5" vector-effect="non-scaling-stroke"/>' +
      '<circle cx="40" cy="40" r="3" fill="currentColor" stroke="none"/>' +
      "</svg>"
    );
  };

  V.ornament = function () {
    return (
      '<div class="signal-divider" aria-hidden="true">' +
      '<span class="line"></span>' +
      '<span class="node">●</span>' +
      '<span class="line line--right"></span>' +
      "</div>"
    );
  };

  V.panel = function (inner, meta) {
    meta = meta || {};
    var classification = meta.classification || "INDEX";
    var fileNo = meta.fileNo === undefined || meta.fileNo === null ? "—" : meta.fileNo;
    var leaf = meta.leaf === undefined || meta.leaf === null ? "" : meta.leaf;
    return (
      '<section class="panel">' +
      '<span class="panel-top" aria-hidden="true"></span>' +
      '<span class="panel-edge panel-edge--left" aria-hidden="true"></span>' +
      '<span class="panel-edge panel-edge--right" aria-hidden="true"></span>' +
      '<div class="panel-status">' +
      '<span class="status-kind"><span class="led" aria-hidden="true"></span>' + A.esc(classification) + "</span>" +
      "<span>FILE " + A.esc(fileNo) + "</span>" +
      (leaf ? "<span>" + A.esc(leaf) + "</span>" : "") +
      "<span>" + A.esc(A.fmtDate(Date.now())) + "</span>" +
      "</div>" +
      '<div class="panel-inner">' + inner + "</div>" +
      "</section>"
    );
  };

  /* a ruled section head: LABEL ————— METADATA */
  V.secHead = function (label, meta) {
    return (
      '<header class="sec-head">' +
      '<h2 class="sec-head-title">' + A.esc(label) + "</h2>" +
      '<span class="sec-head-rule" aria-hidden="true"></span>' +
      (meta ? '<p class="sec-head-meta">' + A.esc(meta) + "</p>" : "") +
      "</header>"
    );
  };

  V.navItems = function () {
    var blog = A.state.blog;
    var items = [
      { key: "home", label: A.t("NAV_ARTICLES"), href: "./index.html?type=internal&function=article_list" }
    ];
    if (blog["在菜单中添加归档和标签的入口"] !== false) {
      items.push({
        key: "archive",
        label: A.t("NAV_ARCHIVE"),
        href: "./index.html?type=internal&function=archive_and_tags"
      });
    }
    A.state.pages.forEach(function (page) {
      if (!page.inMenu) return;
      items.push({
        key: "page:" + page.filename,
        label: page.menuLabel || page.title,
        href: "./index.html?type=page&filename=" + encodeURIComponent(page.filename),
        blank: page.newTab
      });
    });
    if (blog["启用内建友人帐页面"] === true) {
      items.push({
        key: "friends",
        label: A.t("NAV_FRIENDS"),
        href: "./index.html?type=internal&function=friendbook"
      });
    }
    (blog["菜单中的外部链接"] || []).forEach(function (link) {
      if (!link || !link["url"]) return;
      items.push({
        key: null,
        label: String(link["显示名称"] || link["url"]),
        href: String(link["url"]),
        blank: link["是否在新标签页打开"] === true,
        external: true
      });
    });
    return items;
  };

  V.renderShell = function () {
    var blog = A.state.blog;
    var mode = document.body.getAttribute("data-mode") === "night" ? "night" : "day";
    var masthead = document.getElementById("masthead");
    var nav = V.navItems()
      .map(function (item) {
        var attrs =
          (item.blank ? ' target="_blank" rel="noopener"' : "") +
          (item.external ? "" : " data-internal") +
          (item.key ? ' data-nav-key="' + A.esc(item.key) + '"' : "");
        return '<a href="' + A.esc(item.href) + '"' + attrs + ">" + A.esc(item.label) + "</a>";
      })
      .join("");

    masthead.innerHTML =
      '<div class="masthead-top">' +
      '<p class="sys-line"><span class="led" aria-hidden="true"></span>' +
      '<strong>OBSERVATION ACTIVE</strong>' +
      '<span class="protocol">PROTOCOL 20261001</span></p>' +
      '<div class="masthead-actions">' +
      '<button class="icon-btn" id="search-btn" type="button" aria-label="' + A.esc(A.t("SEARCH")) + '">' + V.icon("search") + "</button>" +
      '<button class="icon-btn" id="mode-btn" type="button" aria-label="' + A.esc(A.t(mode === "day" ? "THEME_NIGHT" : "THEME_DAY")) + '">' + V.icon(mode === "day" ? "moon" : "sun") + "</button>" +
      (A.state.cfg && A.state.cfg["窗光"] && A.state.cfg["窗光"]["启用"] !== false
        ? '<button class="icon-btn" id="light-btn" type="button" aria-label="' + A.esc(A.t("LIGHT_ON")) + '">' + V.icon("candle") + "</button>"
        : "") +
      "</div>" +
      "</div>" +
      '<div class="masthead-brand">' +
      '<div>' +
      '<h1 class="blog-title"><a href="./index.html?type=internal&function=article_list" data-internal data-nav-key="home">' +
      A.esc(blog["博客标题"] || "对经") +
      "</a></h1>" +
      (blog["博客描述（副标题）"]
        ? '<p class="blog-subtitle">' + A.esc(blog["博客描述（副标题）"]) + "</p>"
        : "") +
      "</div>" +
      '<div class="masthead-mark" aria-hidden="true">' + V.sigil(30) +
      '<span class="mark-rule"></span>' +
      "<span>INSTITVTUM · MMXXVI</span>" +
      "<span>SECTIO " + A.roman(A.state.visible.length || 1) + "</span>" +
      "</div>" +
      "</div>" +
      '<nav class="masthead-nav" aria-label="主导航">' + nav +
      '<span class="nav-tail" aria-hidden="true">ANTIPHON / 对经</span>' +
      "</nav>";

    V.renderFooter();
  };

  V.licenseText = function () {
    var blog = A.state.blog;
    if (blog["不使用全站内容授权协议"] === true) return "";
    var note = String(blog["全站内容授权说明"] || "").trim();
    if (note) return note;
    var license = String(blog["全站内容授权协议"] || "").trim();
    if (!license) return "";
    if (license === "reserved") return "保留所有权利（All rights reserved）";
    if (license === "unlicensed") return "未授权（Unlicensed）";
    if (license === "cc-by-nc-sa-4.0") return "CC BY-NC-SA 4.0";
    return license;
  };

  V.renderFooter = function () {
    var blog = A.state.blog;
    if (!blog) return;
    var footer = document.getElementById("footer");
    var year = new Date().getFullYear();
    var license = V.licenseText();
    var bottomText = String(blog["底部信息（格式为markdown）"] || "").trim();
    var bottomHtml = "";
    if (bottomText) {
      try {
        bottomHtml = window.marked ? window.marked.parse(bottomText) : A.esc(bottomText).replace(/\n/g, "<br />");
      } catch (error) {
        bottomHtml = A.esc(bottomText);
      }
    }
    var atom =
      String(blog["网站域名（包括https://）"] || "").trim() !== ""
        ? '<p class="footer-brand"><a href="./atom.xml">ATOM FEED</a></p>'
        : "";
    var showVisitor = A.getCfg("外观.显示访客编号", true) !== false;
    var count = (A.state.visible || []).length;
    footer.innerHTML =
      '<div class="footer-inner">' +
      '<div class="footer-grid">' +
      '<p class="footer-brand footer-colophon">' + V.sigil(13) + "<span>COLOPHON · END OF FILE</span></p>" +
      '<p class="footer-license">© ' + year + " " + A.esc(blog["博客标题"] || "") + (license ? " · " + A.esc(license) : "") + "</p>" +
      '<p class="footer-brand">ANNO ' + A.roman(year) + "</p>" +
      (showVisitor && A.visitor ? '<p class="visitor">VISITOR 0x' + A.esc(A.visitor) + "</p>" : "") +
      '<p class="footer-brand">由 BBG 与 Antiphon 主题生成</p>' +
      atom +
      (bottomHtml ? '<div class="footer-bottom prose">' + bottomHtml + "</div>" : "") +
      '<p class="log-line">' +
      "<span>FOLIA " + A.roman(count) + " (" + A.esc(count) + ")</span>" +
      "<span>SYS " + A.esc((A.app && A.app.appliedMode && A.app.appliedMode()) === "night" ? "NOCT" : "DIURN") + "</span>" +
      "<span>LUX " + A.esc(bodyLightLabel()) + "</span>" +
      "<span>MMXXVI · ANTIPHON</span>" +
      "</p>" +
      "</div>" +
      "</div>";
  };

  function bodyLightLabel() {
    var mode = document.body.getAttribute("data-light");
    if (mode === "on") return "ON";
    if (mode === "fallback") return "STATIC";
    return "OFF";
  }

  V.updateNavActive = function (route) {
    var key = null;
    if (!route || route.view === "home") key = "home";
    else if (route.view === "archive") key = "archive";
    else if (route.view === "friends") key = "friends";
    else if (route.view === "page") key = "page:" + route.filename;
    document.querySelectorAll(".masthead-nav a[data-nav-key]").forEach(function (link) {
      var active = link.getAttribute("data-nav-key") === key;
      link.classList.toggle("is-active", active);
    });
  };

  V.showLoading = function () {
    var main = document.getElementById("main");
    main.innerHTML =
      '<div id="loading">' +
      '<svg class="loading-sigil" viewBox="0 0 80 80" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1">' +
      '<circle cx="40" cy="40" r="34" opacity=".18" vector-effect="non-scaling-stroke"/><circle cx="40" cy="40" r="26" opacity=".3" vector-effect="non-scaling-stroke"/>' +
      '<circle cx="40" cy="40" r="18" opacity=".5" vector-effect="non-scaling-stroke"/><circle cx="40" cy="40" r="3" fill="currentColor" stroke="none"/></svg>' +
      "<p>SYS BOOT</p></div>";
  };

  V.showError = function (reason) {
    var main = document.getElementById("main");
    main.innerHTML = V.panel(
      '<div class="not-found">' +
        '<p class="not-found-code">!</p>' +
        '<p class="not-found-text">' + A.esc(A.t("LOAD_ERROR")) + "</p>" +
        '<p class="not-found-text">' + A.esc(reason || "") + "</p>" +
        '<p class="not-found-text">请通过 BBG 预览，或在站点根目录（与 data/ 同级）访问本主题。</p>' +
      "</div>"
    );
  };

  V.announcement = async function () {
    var blog = A.state.blog;
    if (blog["启用网站公告"] !== true) return "";
    var text = String(blog["网站公告"] || "").trim();
    if (!text) return "";
    var body;
    try {
      await A.ensureMarked();
      body = window.marked.parse(text);
    } catch (error) {
      body = "<p>" + A.esc(text) + "</p>";
    }
    return (
      '<aside class="announcement">' +
      '<span class="announcement-label">' + A.esc(A.t("ANNOUNCEMENT")) + "</span>" +
      '<div class="prose">' + body + "</div>" +
      "</aside>"
    );
  };

  var HITOKOTO_CATEGORIES = [
    ["范围包括动画分类下的一言", "a"],
    ["范围包括漫画分类下的一言", "b"],
    ["范围包括游戏分类下的一言", "c"],
    ["范围包括文学分类下的一言", "d"],
    ["范围包括原创分类下的一言", "e"],
    ["范围包括非原创分类下的一言", "f"],
    ["范围包括其他分类下的一言", "g"],
    ["范围包括影视分类下的一言", "h"],
    ["范围包括诗词分类下的一言", "i"],
    ["范围包括网易云分类下的一言（不建议）", "j"],
    ["范围包括哲学分类下的一言", "k"],
    ["范围包括抖机灵分类下的一言", "l"]
  ];

  V.verse = async function () {
    var blog = A.state.blog;
    var cfg = blog["一言设置"] || {};
    if (cfg["启用一言"] !== true) return "";
    var range = cfg["范围设置"] || {};
    var cats = HITOKOTO_CATEGORIES.filter(function (item) {
      return range[item[0]] === true;
    }).map(function (item) { return "c=" + item[1]; });
    var url = "https://v1.hitokoto.cn/?encode=json" + (cats.length ? "&" + cats.join("&") : "");
    var controller = typeof AbortController !== "undefined" ? new AbortController() : null;
    var timer = controller ? setTimeout(function () { controller.abort(); }, 5000) : null;
    try {
      var response = await fetch(url, { signal: controller ? controller.signal : undefined });
      if (!response.ok) return "";
      var data = await response.json();
      if (!data || !data.hitokoto) return "";
      var source = data.from || data.creator || "";
      return (
        '<blockquote class="verse">' +
        A.esc(data.hitokoto) +
        (source ? '<span class="verse-source">—— ' + A.esc(source) + "</span>" : "") +
        "</blockquote>"
      );
    } catch (error) {
      return "";
    } finally {
      clearTimeout(timer);
    }
  };

  V.tagLinks = function (tags) {
    return (tags || [])
      .map(function (tag) {
        return (
          '<a class="tag-link" data-internal href="./index.html?type=internal&function=tag&argument=' +
          encodeURIComponent(tag) +
          '">' + A.esc(tag) + "</a>"
        );
      })
      .join("");
  };

  V.leadEntry = function (article) {
    var date = A.dateParts(article.created);
    var entryNo = String(article.index + 1).padStart(3, "0");
    return (
      '<article class="lead">' +
      '<div class="lead-fig" aria-hidden="true">' +
      '<span class="lead-no">' + A.esc(entryNo) + "</span>" +
      '<span class="lead-glyph">' + V.sigil(46) + "</span>" +
      "</div>" +
      '<div class="lead-body">' +
      '<p class="lead-kicker">' +
      '<span class="lead-flag">' + A.esc(A.t("PINNED")) + "</span>" +
      "<span>FEATURED FILE</span>" +
      '<span class="sep" aria-hidden="true">·</span>' +
      "<span>" + A.esc(date.year) + "." + A.esc(date.monthday) + "</span>" +
      "</p>" +
      '<h2 class="lead-title"><a data-internal href="./index.html?type=article&amp;filename=' +
      encodeURIComponent(article.filename) + '">' + A.esc(article.title) + "</a></h2>" +
      (article.excerpt ? '<p class="lead-dek">' + A.esc(article.excerpt) + "</p>" : "") +
      '<div class="lead-foot">' +
      (article.tags.length ? '<span class="entry-tags">' + V.tagLinks(article.tags) + "</span>" : "") +
      '<span class="lead-read">ACCEDE TO FILE →</span>' +
      "</div>" +
      "</div></article>"
    );
  };

  V.entryRow = function (article) {
    var date = A.dateParts(article.created);
    var entryNo = String(article.index + 1).padStart(3, "0");
    return (
      '<article class="entry">' +
      '<div class="entry-no">NO. ' + A.esc(entryNo) + "</div>" +
      '<div class="entry-body">' +
      '<h2 class="entry-title"><a data-internal href="./index.html?type=article&amp;filename=' +
      encodeURIComponent(article.filename) + '">' + A.esc(article.title) + "</a>" +
      (article.pinned ? '<span class="pinned-mark">' + A.esc(A.t("PINNED")) + "</span>" : "") +
      "</h2>" +
      (article.excerpt
        ? '<p class="entry-excerpt">' + A.esc(article.excerpt) + "</p>"
        : "") +
      '<div class="entry-foot">' +
      (article.tags.length ? '<span class="entry-tags">' + V.tagLinks(article.tags) + "</span>" : "") +
      (article.encrypted ? '<span class="sep" aria-hidden="true">·</span><span>SEALED</span>' : "") +
      (article.comments ? '<span class="sep" aria-hidden="true">·</span><span>DISCUSSION OPEN</span>' : "") +
      "</div>" +
      "</div>" +
      '<div class="entry-side"><span class="side-year">' + A.esc(date.year) + "</span><br>" +
      A.esc(date.monthday) + "</div>" +
      "</article>"
    );
  };

  V.pagination = function (page, totalPages) {
    var prev =
      page > 1
        ? '<a class="page-link" data-internal href="./index.html?type=internal&amp;function=article_list&amp;page=' + (page - 1) + '">← ' + A.esc(A.t("PAGE_PREV")) + "</a>"
        : '<span class="page-link is-disabled">← ' + A.esc(A.t("PAGE_PREV")) + "</span>";
    var next =
      page < totalPages
        ? '<a class="page-link" data-internal href="./index.html?type=internal&amp;function=article_list&amp;page=' + (page + 1) + '">' + A.esc(A.t("PAGE_NEXT")) + " →</a>"
        : '<span class="page-link is-disabled">' + A.esc(A.t("PAGE_NEXT")) + " →</span>";
    return (
      '<nav class="pagination" aria-label="分页">' +
      prev +
      '<span class="page-count">' + A.roman(page) + " / " + A.roman(totalPages) + "</span>" +
      next +
      "</nav>"
    );
  };

  V.home = async function (page) {
    var blog = A.state.blog;
    var list = A.homeOrder();
    var size = A.clamp(parseInt(blog["文章列表中每页的文章数为"], 10) || 10, 1, 50);
    var totalPages = Math.max(1, Math.ceil(list.length / size));
    var current = A.clamp(page || 1, 1, totalPages);
    var items = list.slice((current - 1) * size, current * size);

    var announcement = await V.announcement();
    var verse = await V.verse();

    /* page one leads with the newest pinned file; the rest become the ledger */
    var lead = null;
    var rest = items;
    if (current === 1 && items.length > 1) {
      var pinnedIndex = items.findIndex(function (item) { return item.pinned; });
      if (pinnedIndex === 0 || pinnedIndex > 0) {
        lead = items[pinnedIndex >= 0 ? pinnedIndex : 0];
        rest = items.filter(function (item) { return item !== lead; });
      }
    }
    var rows = rest.map(V.entryRow).join("");
    var range = "";
    var dated = list.filter(function (item) { return item.created; });
    if (dated.length) {
      var oldest = dated.reduce(function (a, b) { return b.created < a.created ? b : a; });
      var newest = dated.reduce(function (a, b) { return b.created > a.created ? b : a; });
      range = A.fmtDate(oldest.created) + " → " + A.fmtDate(newest.created);
    }
    var head = V.secHead(
      "INDEX · 目录",
      "FOLIA " + A.roman(list.length) + " / " + A.roman(totalPages) + (range ? " · " + range : "")
    );
    var body =
      '<section class="home">' +
      head +
      announcement +
      verse +
      (lead ? V.leadEntry(lead) : "") +
      '<div class="entry-list">' +
      (rows || (lead ? "" : '<p class="search-empty">' + A.esc(A.t("EMPTY")) + "</p>")) +
      "</div>" +
      (totalPages > 1 ? V.pagination(current, totalPages) : "") +
      "</section>";

    return { title: "", html: V.panel(body, { classification: "INDEX", fileNo: "—", leaf: "FOLIA " + A.roman(items.length) }) };
  };

  V.articleCatalog = function (article, minutes, encrypted, sectionCount) {
    var cells = [];
    function cell(key, value, signal) {
      cells.push(
        '<div class="catalog-cell"><span class="catalog-key">' + A.esc(key) + "</span>" +
        '<span class="catalog-val' + (signal ? " is-signal" : "") + '">' + A.esc(value) + "</span></div>"
      );
    }
    cell("RECORDED", A.fmtDate(article.created));
    if (article.modified && article.modified - article.created > 86400000) {
      cell("REVISED", A.fmtDate(article.modified));
    }
    if (!encrypted) cell("EXTENT", minutes + " MIN");
    if (sectionCount > 0) cell("SECTIONS", String(sectionCount).padStart(2, "0"));
    if (article.tags.length) cell("RUBRIC", article.tags.join(" · "), true);
    if (!cells.length) return "";
    return '<div class="article-catalog">' + cells.join("") + "</div>";
  };

  V.articleMeta = function (article, minutes, encrypted) {
    var parts = ["<span>RECORDED " + A.esc(A.fmtDate(article.created)) + "</span>"];
    if (article.modified && article.modified - article.created > 86400000) {
      parts.push('<span class="dot">·</span>');
      parts.push("<span>REVISED " + A.esc(A.fmtDate(article.modified)) + "</span>");
    }
    if (!encrypted) {
      parts.push('<span class="dot">·</span>');
      parts.push("<span>READ " + A.esc(minutes) + " MIN</span>");
    }
    return '<div class="article-meta">' + parts.join("") + "</div>";
  };

  V.licenseBlock = function () {
    var text = V.licenseText();
    if (!text) return "";
    return (
      '<div class="license-block"><span class="license-label">' + A.esc(A.t("LICENSE")) + "</span>" +
      A.esc(text) +
      "</div>"
    );
  };

  V.actionRow = function (item, kind) {
    var blog = A.state.blog;
    var actions = [];
    if (blog["提供文章文件下载"] === true) {
      var sourceUrl = kind === "page" ? A.pageUrl(item.filename) : A.articleUrl(item.filename, false);
      actions.push(
        '<a class="action-link" href="' + A.esc(sourceUrl) + '" download="' +
        A.esc(item.title) + '.md">' + A.esc(A.t("DOWNLOAD")) + "</a>"
      );
    }
    if (blog["提供复制全文到剪贴板的选项"] === true) {
      actions.push('<button class="action-link" type="button" data-action="copy">' + A.esc(A.t("COPY")) + "</button>");
    }
    if (blog["在文章或页面的底部添加分享按钮，以便复制直链url"] === true) {
      actions.push('<button class="action-link" type="button" data-action="share">' + A.esc(A.t("SHARE")) + "</button>");
    }
    if (!actions.length) return "";
    return '<div class="article-actions">' + actions.join("") + "</div>";
  };

  V.prevNext = function (article) {
    var blog = A.state.blog;
    if (blog["文章页面显示上一篇下一篇文章导航按钮"] !== true) return "";
    var around = A.visibleAround(article.filename);
    function item(label, target, className) {
      if (!target) {
        return '<div class="prevnext-item ' + className + ' prevnext-empty"><span class="prevnext-label">' + A.esc(label) + "</span><span class=\"prevnext-title\">—</span></div>";
      }
      return (
        '<div class="prevnext-item ' + className + '">' +
        '<span class="prevnext-label">' + A.esc(label) + "</span>" +
        '<span class="prevnext-title"><a data-internal href="./index.html?type=article&amp;filename=' +
        encodeURIComponent(target.filename) + '">' + A.esc(target.title) + "</a></span></div>"
      );
    }
    return (
      '<nav class="prevnext" aria-label="文章导航">' +
      item(A.t("PREV"), around.prev, "prevnext-item--prev") +
      item(A.t("NEXT"), around.next, "prevnext-item--next") +
      "</nav>"
    );
  };

  V.commentsBlock = function (enabled, title) {
    if (!enabled) return "";
    return (
      '<section class="comment-area"><h2 class="comment-title">' + A.esc(A.t("COMMENTS")) + "</h2>" +
      '<div id="comments" data-comments-title="' + A.esc(title || "") + '"></div></section>'
    );
  };

  V.bindActions = function (main) {
    main.querySelectorAll('[data-action="copy"]').forEach(function (button) {
      button.addEventListener("click", function () {
        var prose = main.querySelector("#article-prose, #page-prose") || main.querySelector(".article-body .prose");
        var text = prose ? prose.innerText : "";
        var original = button.textContent;
        A.copyText(text).then(function () {
          button.textContent = A.t("COPIED");
          setTimeout(function () { button.textContent = original; }, 1400);
        });
      });
    });
    main.querySelectorAll('[data-action="share"]').forEach(function (button) {
      button.addEventListener("click", function () {
        var original = button.textContent;
        A.copyText(window.location.href).then(function () {
          button.textContent = A.t("LINK_COPIED");
          setTimeout(function () { button.textContent = original; }, 1400);
        });
      });
    });
  };

  V.buildToc = function (main) {
    if (A.getCfg("外观.显示页边目录", true) === false) return;
    var layout = main.querySelector(".article-layout");
    if (!layout) return;
    var prose = layout.querySelector("#article-prose") || layout.querySelector(".article-body .prose");
    if (!prose) return;
    var headings = A.markdown.headings(prose);
    if (headings.length < 3) return;
    var aside = document.createElement("aside");
    aside.className = "marginalia";
    var title = document.createElement("h2");
    title.className = "marginalia-title";
    title.textContent = "MARGINALIA";
    aside.appendChild(title);
    headings.forEach(function (heading) {
      var link = document.createElement("a");
      link.href = "#" + heading.id;
      link.textContent = heading.text;
      if (heading.level === 3) link.classList.add("is-sub");
      link.addEventListener("click", function (event) {
        event.preventDefault();
        var target = document.getElementById(heading.id);
        if (!target) return;
        var behavior = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth";
        target.scrollIntoView({ behavior: behavior, block: "start" });
      });
      aside.appendChild(link);
    });
    layout.appendChild(aside);
  };

  V.bindPassword = function (main, article, raw, baseurl) {
    var input = main.querySelector("#password-input");
    var submit = main.querySelector("#password-submit");
    var error = main.querySelector("#password-error");
    if (!input || !submit) return;

    async function attempt() {
      var password = input.value;
      if (!password) return;
      submit.disabled = true;
      if (error) error.hidden = true;
      try {
        await A.loadScript(A.cdn("sjcl@1.0.8/sjcl.js"));
        if (!window.sjcl) throw new Error("sjcl 未就绪");
        var plain = window.sjcl.decrypt(password, raw);
        var body = await A.markdown.render(plain, baseurl);
        var holder = main.querySelector(".article-body");
        holder.innerHTML = '<div class="prose" id="article-prose">' + body + "</div>";
        await A.markdown.postProcess(holder.querySelector(".prose"));
        V.buildToc(main);
        V.bindActions(main);
      } catch (decryptError) {
        if (error) {
          error.hidden = false;
          error.textContent = A.t("PASSWORD_WRONG");
        }
      } finally {
        submit.disabled = false;
      }
    }

    submit.addEventListener("click", attempt);
    input.addEventListener("keydown", function (event) {
      if (event.key === "Enter") attempt();
    });
  };

  V.article = async function (filename) {
    var article = A.getArticle(filename);
    if (!article) return V.notFound();

    var blog = A.state.blog;
    var md = blog["Markdown渲染配置"] || {};
    var baseurl = md["使用markdown文件所在目录作为baseurl"] === true ? "./data/articles/" : "./";
    var raw = await A.fetchText(A.articleUrl(filename));
    var minutes = A.readingMinutes(raw);
    var fileNo = String((article.index || 0) + 1).padStart(3, "0");
    var sectionCount = (raw.match(/^\s*#{2}\s+/gm) || []).length;

    var announcement = "";
    if (blog["启用网站公告"] === true && blog["网站公告仅在首页显示"] !== true) {
      announcement = await V.announcement();
    }

    var bodyHtml;
    if (article.encrypted) {
      bodyHtml =
        '<div class="article-body"><div class="password-box">' +
        '<label class="license-label" for="password-input">' + A.esc(A.t("PASSWORD_PROMPT")) + "</label>" +
        '<input class="password-input" id="password-input" type="password" autocomplete="off" />' +
        '<button class="action-link password-submit" id="password-submit" type="button">' + A.esc(A.t("PASSWORD_SUBMIT")) + "</button>" +
        '<p class="password-error" id="password-error" hidden></p>' +
        "</div></div>";
    } else {
      var rendered = await A.markdown.render(raw, baseurl);
      bodyHtml = '<div class="article-body"><div class="prose" id="article-prose">' + rendered + "</div></div>";
    }

    var inner =
      "<article>" +
      announcement +
      '<header class="article-header">' +
      (A.getCfg("外观.档案标记", true) !== false ? '<span class="stamp">CLASSIFIED</span>' : "") +
      '<div class="article-kicker"><span class="file-no">FILE NO. ' + A.esc(fileNo) + "</span>" +
      (article.tags.length ? V.tagLinks(article.tags) : '<span class="kicker-sub">UNFILED</span>') +
      "</div>" +
      '<h1 class="article-title">' + A.esc(article.title) + "</h1>" +
      (article.excerpt ? '<p class="article-dek">' + A.esc(article.excerpt) + "</p>" : "") +
      V.articleCatalog(article, minutes, article.encrypted, sectionCount) +
      V.ornament() +
      "</header>" +
      bodyHtml +
      V.licenseBlock() +
      V.actionRow(article, "article") +
      V.prevNext(article) +
      V.commentsBlock(article.comments, article.title) +
      "</article>";

    return {
      title: article.title,
      html: '<div class="article-layout">' + V.panel(inner, { classification: "CLASSIFIED", fileNo: fileNo }) + "</div>",
      after: async function (main) {
        if (article.encrypted) {
          V.bindPassword(main, article, raw, baseurl);
          return;
        }
        var prose = main.querySelector("#article-prose");
        if (prose) await A.markdown.postProcess(prose);
        V.buildToc(main);
        V.bindActions(main);
        if (article.comments && A.comments && A.comments.mount) {
          A.comments.mount(main, {
            kind: "article",
            filename: article.filename,
            title: article.title
          });
        }
      }
    };
  };

  V.page = async function (filename) {
    var page = A.getPage(filename);
    if (!page) return V.notFound();
    var pageNo = String((page.index || 0) + 1).padStart(3, "0");

    if (page.fullHtml) {
      var target = A.pageUrl(filename);
      return {
        title: page.title,
        html: V.panel(
          '<div class="not-found"><p class="not-found-text">' + A.esc(page.title) + "</p>" +
          '<a class="not-found-link" href="' + A.esc(target) + '">' + A.esc(A.t("NAV_ARTICLES")) + "</a></div>",
          { classification: "RECORD", fileNo: pageNo }
        ),
        after: function () { window.location.href = target; }
      };
    }

    var blog = A.state.blog;
    var md = blog["Markdown渲染配置"] || {};
    var baseurl = md["使用markdown文件所在目录作为baseurl"] === true ? "./data/pages/" : "./";
    var raw = await A.fetchText(A.pageUrl(filename));
    var rendered = await A.markdown.render(raw, baseurl);

    var announcement = "";
    if (blog["启用网站公告"] === true && blog["网站公告仅在首页显示"] !== true) {
      announcement = await V.announcement();
    }

    var inner =
      "<article>" +
      announcement +
      '<header class="article-header">' +
      '<div class="article-kicker"><span class="file-no">RECORD ' + A.esc(pageNo) + "</span>" +
      '<span class="kicker-sub">STANDING PAGE</span></div>' +
      '<h1 class="article-title">' + A.esc(page.title) + "</h1>" +
      V.ornament() +
      "</header>" +
      '<div class="article-body"><div class="prose" id="page-prose">' + rendered + "</div></div>" +
      V.licenseBlock() +
      V.actionRow(page, "page") +
      V.commentsBlock(page.comments, page.title) +
      "</article>";

    return {
      title: page.title,
      html: V.panel(inner, { classification: "RECORD", fileNo: pageNo }),
      after: async function (main) {
        var prose = main.querySelector("#page-prose");
        if (prose) await A.markdown.postProcess(prose);
        V.bindActions(main);
        if (page.comments && A.comments && A.comments.mount) {
          A.comments.mount(main, { kind: "page", filename: page.filename, title: page.title });
        }
      }
    };
  };

  V.archive = function () {
    var list = A.state.visible.slice().sort(function (a, b) { return b.created - a.created; });
    var groups = [];
    var currentYear = null;
    var currentGroup = null;
    list.forEach(function (article) {
      var year = article.created ? new Date(article.created).getFullYear() : "—";
      if (!currentGroup || currentGroup.year !== year) {
        currentGroup = { year: year, months: [] };
        groups.push(currentGroup);
        currentYear = year;
      }
      var month = article.created ? new Date(article.created).getMonth() + 1 : "—";
      var monthGroup = currentGroup.months.find(function (item) { return item.month === month; });
      if (!monthGroup) {
        monthGroup = { month: month, items: [] };
        currentGroup.months.push(monthGroup);
      }
      monthGroup.items.push(article);
    });

    var archiveHtml = groups
      .map(function (group) {
        var yearLabel = String(group.year);
        var romanYear = group.year === "—" ? "—" : A.roman(group.year);
        var months = group.months
          .map(function (month) {
            var rows = month.items
              .map(function (article) {
                var parts = A.dateParts(article.created);
                return (
                  '<div class="archive-row">' +
                  '<span class="archive-date">' + A.esc(parts.monthday) + "</span>" +
                  '<span class="archive-title"><a data-internal href="./index.html?type=article&amp;filename=' +
                  encodeURIComponent(article.filename) + '">' + A.esc(article.title) + "</a></span>" +
                  "</div>"
                );
              })
              .join("");
            var monthLabel = month.month === "—" ? "—" : String(month.month).padStart(2, "0");
            return '<div class="archive-month">' + monthLabel + "</div>" + rows;
          })
          .join("");
        var yearCount = group.months.reduce(function (sum, month) { return sum + month.items.length; }, 0);
        return (
          '<div class="archive-year"><span class="archive-year-roman">' + romanYear + "</span>" +
          '<span class="archive-year-line" aria-hidden="true"></span>' +
          '<span class="archive-year-arabic">' + A.esc(yearLabel) + " · FOLIA " + A.roman(yearCount) + "</span></div>" + months
        );
      })
      .join("");

    var counts = {};
    A.state.visible.forEach(function (article) {
      article.tags.forEach(function (tag) { counts[tag] = (counts[tag] || 0) + 1; });
    });
    var tags = Object.keys(counts).sort(function (a, b) { return counts[b] - counts[a] || a.localeCompare(b); });
    var max = tags.length ? counts[tags[0]] : 1;
    var tagHtml = tags
      .map(function (tag) {
        var size = counts[tag] >= max * 0.66 ? "lg" : counts[tag] >= max * 0.34 ? "md" : "sm";
        return (
          '<a class="tag-index-item tag-index-item--' + size + '" data-internal href="./index.html?type=internal&amp;function=tag&amp;argument=' +
          encodeURIComponent(tag) + '"><span class="name">' + A.esc(tag) + '</span><span class="count">' + counts[tag] + "</span></a>"
        );
      })
      .join("");

    var inner =
      '<section class="archive-block">' +
      V.secHead("ARCHIVUM · 归档", "FOLIA " + A.roman(list.length) + " · " + A.roman(groups.length) + " ANNI") +
      (archiveHtml || '<p class="search-empty">' + A.esc(A.t("EMPTY")) + "</p>") +
      '<div class="tag-index">' +
      V.secHead("RUBRICAE · 标签", A.roman(tags.length) + " SUBJECTS") +
      '<div class="tag-index-list">' + tagHtml + "</div></div>" +
      "</section>";

    return { title: A.t("NAV_ARCHIVE"), html: V.panel(inner, { classification: "ARCHIVE", fileNo: "—", leaf: "RUBRICAE" }) };
  };

  V.tag = function (tagName) {
    var tag = String(tagName || "");
    var list = A.state.visible.filter(function (article) {
      return article.tags.indexOf(tag) !== -1;
    });
    var rows = list.map(V.entryRow).join("");
    var inner =
      '<section class="home">' +
      V.secHead("RUBRIC · 主题", "FOLIA " + A.roman(list.length)) +
      '<h1 class="article-title">' + A.esc(tag) + "</h1>" +
      V.ornament() +
      '<div class="entry-list">' + (rows || '<p class="search-empty">' + A.esc(A.t("EMPTY")) + "</p>") + "</div>" +
      "</section>";
    return { title: A.t("TAG_TITLE", { tag: tag }), html: V.panel(inner, { classification: "RUBRIC", fileNo: "—", leaf: tag }) };
  };

  V.friends = async function () {
    var blog = A.state.blog;
    var entries = blog["友人帐"] || [];
    if (blog["友人帐来自json文件"] === true && blog["若友人帐来自json文件，则地址为"]) {
      try {
        var response = await fetch(blog["若友人帐来自json文件，则地址为"], { cache: "no-store" });
        if (response.ok) {
          var data = await response.json();
          entries = Array.isArray(data["友人帐"]) ? data["友人帐"] : [];
        }
      } catch (error) {
        console.warn("[Antiphon] 友人帐 JSON 加载失败：", error);
      }
    }

    var cards = entries
      .map(function (friend) {
        if (!friend) return "";
        var name = String(friend["名称"] || "");
        var url = String(friend["链接"] || "");
        var icon = String(friend["图标"] || "");
        var description = String(friend["简介"] || "");
        var initial = Array.from(name)[0] || "·";
        var iconHtml = icon
          ? '<img class="friend-icon" src="' + A.esc(icon) + '" alt="" loading="lazy" onerror="this.style.display=\'none\';this.nextElementSibling.style.display=\'grid\'" />' +
            '<span class="friend-icon friend-icon--empty" style="display:none">' + A.esc(initial) + "</span>"
          : '<span class="friend-icon friend-icon--empty">' + A.esc(initial) + "</span>";
        return (
          '<div class="friend">' +
          iconHtml +
          '<div class="friend-body"><a class="friend-name" href="' + A.esc(url) + '" target="_blank" rel="noopener">' +
          A.esc(name) + '</a><p class="friend-desc">' + A.esc(description) + "</p></div>" +
          "</div>"
        );
      })
      .join("");

    var noteHtml = "";
    var note = String(blog["友人帐页面附加信息"] || "").trim();
    if (note) {
      try {
        await A.ensureMarked();
        noteHtml = '<div class="friend-note prose">' + window.marked.parse(note) + "</div>";
      } catch (error) {
        noteHtml = '<p class="friend-note">' + A.esc(note) + "</p>";
      }
    }

    var inner =
      '<section class="friends-block">' +
      V.secHead("AFFILIATES · 友人帐", entries.length ? A.roman(entries.length) + " NOMINA" : "") +
      '<h1 class="article-title">' + A.esc(A.t("NAV_FRIENDS")) + "</h1>" +
      V.ornament() +
      '<div class="friends">' + (cards || '<p class="search-empty">' + A.esc(A.t("EMPTY")) + "</p>") + "</div>" +
      noteHtml +
      V.commentsBlock(blog["友人帐页面允许评论"] === true, A.t("NAV_FRIENDS")) +
      "</section>";

    return {
      title: A.t("NAV_FRIENDS"),
      html: V.panel(inner, { classification: "AFFILIATES", fileNo: "—", leaf: A.roman(entries.length) + " NOMINA" }),
      after: function (main) {
        if (blog["友人帐页面允许评论"] === true && A.comments && A.comments.mount) {
          A.comments.mount(main, { kind: "page", filename: "friendbook", title: A.t("NAV_FRIENDS") });
        }
      }
    };
  };

  V.notFound = function () {
    return {
      title: A.t("NOT_FOUND"),
      html: V.panel(
        '<div class="not-found">' +
        '<p class="not-found-code">404</p>' +
        '<p class="not-found-text">RECORD NOT FOUND</p>' +
        '<p class="not-found-text"><small>' + A.esc(A.t("NOT_FOUND")) + "</small></p>" +
        '<a class="not-found-link" data-internal href="./index.html?type=internal&amp;function=article_list">' +
        "RETURN TO INDEX</a></div>",
        { classification: "MISSING", fileNo: "—" }
      )
    };
  };

  /* search */

  var searchBound = false;

  function searchIndex() {
    return A.state.visible.map(function (article) {
      return {
        article: article,
        haystack: (article.title + " " + article.excerpt + " " + article.tags.join(" ")).toLowerCase()
      };
    });
  }

  V.renderSearch = function (query) {
    var results = document.getElementById("search-results");
    if (!results) return;
    var keyword = String(query || "").trim().toLowerCase();
    if (!keyword) {
      results.innerHTML = "";
      return;
    }
    var matches = searchIndex()
      .filter(function (item) { return item.haystack.indexOf(keyword) !== -1; })
      .slice(0, 20);
    if (!matches.length) {
      results.innerHTML = '<p class="search-empty">' + A.esc(A.t("NO_RESULTS")) + "</p>";
      return;
    }
    results.innerHTML = matches
      .map(function (item) {
        var article = item.article;
        var resultNo = String((article.index || 0) + 1).padStart(3, "0");
        return (
          '<a class="search-result" data-search-result href="./index.html?type=article&amp;filename=' +
          encodeURIComponent(article.filename) + '"><h3 class="search-result-title"><span class="result-no">NO. ' +
          A.esc(resultNo) + "</span>" + A.esc(article.title) +
          '</h3><p class="search-result-excerpt">' + A.esc(article.excerpt) + "</p></a>"
        );
      })
      .join("");
  };

  V.openSearch = function () {
    var overlay = document.getElementById("search-overlay");
    var input = document.getElementById("search-input");
    if (!overlay || !input) return;
    overlay.hidden = false;
    document.body.style.overflow = "hidden";
    input.value = "";
    V.renderSearch("");
    if (!searchBound) {
      searchBound = true;
      input.addEventListener("input", function () { V.renderSearch(input.value); });
      document.getElementById("search-results").addEventListener("click", function (event) {
        var result = event.target.closest ? event.target.closest("[data-search-result]") : null;
        if (!result) return;
        event.preventDefault();
        V.closeSearch();
        A.navigate(result.getAttribute("href"));
      });
    }
    setTimeout(function () { input.focus(); }, 30);
  };

  V.closeSearch = function () {
    var overlay = document.getElementById("search-overlay");
    if (!overlay) return;
    overlay.hidden = true;
    document.body.style.overflow = "";
  };
})(window.Antiphon);
