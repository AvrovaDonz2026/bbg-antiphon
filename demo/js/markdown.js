/* Antiphon — markdown pipeline */
window.Antiphon = window.Antiphon || {};

(function (A) {
  var M = (A.markdown = {});
  var configured = false;
  var currentBaseurl = "./";
  var katexPromise = null;
  var highlightPromise = null;

  function absoluteSrc(src) {
    var href = String(src || "");
    if (/^(https?:|data:|blob:|\/)/i.test(href)) return href;
    return currentBaseurl + href;
  }

  function configure() {
    if (configured || !window.marked) return;
    configured = true;
    var renderer = new window.marked.Renderer();
    renderer.image = function (href, title, text) {
      var blog = A.state.blog || {};
      var md = blog["Markdown渲染配置"] || {};
      var responsive = md["根据用户屏幕尺寸渲染图片尺寸"] === true;
      var viewer = md["在用户点击图片时显示图片查看器"] === true;
      var caption = title || text || "";
      var src = absoluteSrc(href);
      var figureClass = responsive ? " is-responsive" : "";
      var viewerAttr = viewer ? ' data-viewer="1"' : "";
      return (
        '<figure class="prose-figure' + figureClass + '">' +
        '<img loading="lazy" src="' + A.esc(src) + '" alt="' + A.esc(text || "") + '"' + viewerAttr + " />" +
        (caption ? "<figcaption>" + A.esc(caption) + "</figcaption>" : "") +
        "</figure>"
      );
    };
    window.marked.setOptions({ gfm: true, breaks: false, headerIds: false, renderer: renderer });
  }

  M.render = async function (text, baseurl) {
    await A.ensureMarked();
    configure();
    currentBaseurl = baseurl || "./";
    try {
      return window.marked.parse(text);
    } catch (error) {
      console.error("[Antiphon] Markdown 渲染失败：", error);
      return "<p>" + A.esc(text) + "</p>";
    }
  };

  function slugify(text, used) {
    var base = String(text || "")
      .trim()
      .toLowerCase()
      .replace(/[\s\u3000]+/g, "-")
      .replace(/[，。、；：！？"'“”‘’（）《》〈〉「」『』【】·…—]/g, "")
      .replace(/[^a-z0-9\u4e00-\u9fff-]/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "");
    if (!base) base = "section";
    var slug = base;
    var count = 2;
    while (used[slug]) {
      slug = base + "-" + count;
      count += 1;
    }
    used[slug] = true;
    return slug;
  }

  M.headings = function (root) {
    return Array.from(root.querySelectorAll("h2, h3"))
      .filter(function (heading) { return !heading.closest(".reference-list"); })
      .map(function (heading) {
        var text = heading.dataset.antiphonTitle || heading.textContent;
        return {
          level: heading.tagName === "H2" ? 2 : 3,
          text: String(text).replace(/^§\s*\d+\s*/, "").trim(),
          id: heading.id
        };
      });
  };

  function addSectionIndices(root) {
    var index = 0;
    root.querySelectorAll("h2").forEach(function (heading) {
      if (heading.closest(".reference-list")) return;
      if (heading.querySelector(".section-index")) return;
      index += 1;
      heading.dataset.antiphonTitle = heading.textContent.trim();
      var label = document.createElement("span");
      label.className = "section-index";
      label.textContent = "§ " + String(index).padStart(2, "0");
      heading.insertBefore(label, heading.firstChild);
    });
  }

  function addHeadingIds(root) {
    var used = {};
    root.querySelectorAll("h2, h3").forEach(function (heading) {
      if (!heading.id) heading.id = slugify(heading.textContent, used);
      else used[heading.id] = true;
    });
  }

  function addRefs(root) {
    var refs = Array.from(root.querySelectorAll("ref"));
    if (!refs.length) return;
    var list = document.createElement("div");
    list.className = "reference-list";
    list.id = "references";
    var title = document.createElement("h3");
    title.textContent = A.t("REFERENCES");
    list.appendChild(title);

    refs.forEach(function (ref, index) {
      var number = index + 1;
      var name = ref.textContent.trim();
      var url = ref.getAttribute("url") || "";
      var sup = document.createElement("sup");
      sup.className = "ref";
      var link = document.createElement("a");
      link.href = "#ref-" + number;
      link.textContent = "[" + number + "]";
      sup.appendChild(link);
      ref.textContent = "";
      ref.appendChild(sup);
      ref.id = "ref-src-" + number;

      var item = document.createElement("div");
      item.className = "reference-item";
      item.id = "ref-" + number;
      var back = document.createElement("a");
      back.href = "#ref-src-" + number;
      back.textContent = number + ".";
      var text = document.createElement("span");
      if (url) {
        var target = document.createElement("a");
        target.href = url;
        target.target = "_blank";
        target.rel = "noopener";
        target.textContent = name;
        text.appendChild(target);
      } else {
        text.textContent = name;
      }
      item.appendChild(back);
      item.appendChild(text);
      list.appendChild(item);
    });
    root.appendChild(list);
  }

  function addHints(root) {
    [
      ["info-hint", "INFO"],
      ["warning-hint", "WARNING"],
      ["success-hint", "SUCCESS"],
      ["danger-hint", "DANGER"]
    ].forEach(function (pair) {
      root.querySelectorAll(pair[0]).forEach(function (hint) {
        var label = document.createElement("span");
        label.className = "hint-heading";
        label.textContent = A.t(pair[1]);
        hint.insertBefore(label, hint.firstChild);
      });
    });
  }

  function addDropcap(root) {
    if (A.getCfg("外观.首字下沉", true) === false) return;
    var paragraph = root.querySelector("p");
    if (!paragraph) return;
    var node = paragraph.firstChild;
    if (!node || node.nodeType !== 3) return;
    var text = node.nodeValue || "";
    if (!text) return;
    var first = Array.from(text)[0];
    /* CJK only, and only where the script layer asks for one. A 3em Songti
       initial dropped into English reads as pastiche; Latin opens with a
       small-caps first line instead. Korean and Arabic have no initial-letter
       treatment at all — Hangul is caseless and Arabic is joined — so the script
       class gates the insertion rather than the character test alone. The
       character test still matters: an English article quoted inside a Chinese
       site must not take a Chinese drop cap. */
    var script = A.script || (A.scriptOf ? A.scriptOf(A.lang) : "cjk");
    if (script === "latin" || script === "cyrillic" || script === "arabic" || script === "ko") return;
    var isCjk = /[\u2E80-\u9FFF\uF900-\uFAFF\uFF00-\uFFEF\u3000-\u303F]/u.test(first);
    if (!isCjk) return;
    var span = document.createElement("span");
    span.className = "dropcap";
    span.textContent = first;
    node.nodeValue = text.slice(first.length);
    paragraph.insertBefore(span, node);
  }

  function addCopyButtons(root) {
    root.querySelectorAll("pre").forEach(function (pre) {
      if (pre.querySelector(".code-copy")) return;
      var code = pre.querySelector("code");
      if (!code) return;
      var button = document.createElement("button");
      button.type = "button";
      button.className = "code-copy";
      button.textContent = A.t("COPY_CODE");
      button.setAttribute("aria-label", A.t("COPY_CODE"));
      button.addEventListener("click", function () {
        var text = code.textContent || "";
        var done = function () {
          button.textContent = A.t("COPIED");
          setTimeout(function () { button.textContent = A.t("COPY_CODE"); }, 1200);
        };
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(text).then(done).catch(done);
        } else {
          done();
        }
      });
      pre.appendChild(button);
    });
  }

  M.ensureMath = function () {
    if (!katexPromise) {
      katexPromise = A.loadStyle(A.cdn("katex@0.16.11/dist/katex.min.css"))
        .then(function () { return A.loadScript(A.cdn("katex@0.16.11/dist/katex.min.js")); })
        .then(function () { return A.loadScript(A.cdn("katex@0.16.11/dist/contrib/auto-render.min.js")); });
    }
    return katexPromise;
  };

  M.ensureHighlight = function () {
    if (!highlightPromise) {
      highlightPromise = A.loadScript(A.cdn("@highlightjs/cdn-assets@11.9.0/highlight.min.js"));
    }
    return highlightPromise;
  };

  M.renderMath = function (root) {
    if (!window.renderMathInElement) return;
    try {
      window.renderMathInElement(root, {
        delimiters: [
          { left: "$$", right: "$$", display: true },
          { left: "$", right: "$", display: false },
          { left: "\\(", right: "\\)", display: false },
          { left: "\\[", right: "\\]", display: true }
        ],
        throwOnError: false
      });
    } catch (error) {
      console.error("[Antiphon] 数学公式渲染失败：", error);
    }
  };

  M.highlight = function () {
    if (window.hljs && window.hljs.highlightAll) {
      try { window.hljs.highlightAll(); } catch (error) { console.warn("[Antiphon] 代码高亮失败：", error); }
    }
  };

  M.postProcess = async function (root) {
    if (!root) return;
    addHeadingIds(root);
    addSectionIndices(root);
    addRefs(root);
    addHints(root);
    addDropcap(root);
    addCopyButtons(root);

    var needsMath = /\$|\\\(|\\\[/.test(root.textContent || "");
    if (needsMath) {
      M.ensureMath()
        .then(function () { M.renderMath(root); })
        .catch(function (error) { console.warn("[Antiphon] KaTeX 未加载：", error.message); });
    }
    if (root.querySelector("pre code")) {
      M.ensureHighlight()
        .then(function () { M.highlight(); })
        .catch(function (error) { console.warn("[Antiphon] highlight.js 未加载：", error.message); });
    }
  };
})(window.Antiphon);
