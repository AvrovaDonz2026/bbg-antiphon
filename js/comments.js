/* Antiphon — comment providers (one active at a time) */
window.Antiphon = window.Antiphon || {};

(function (A) {
  var PUBLIC_APP_ID = "SykuVs4qcWMkl4RUtKEUlmog-gzGzoHsz";
  var PUBLIC_APP_KEY = "0jowkR4ct0lJbWcvocymEkKw";
  var disqusLoaded = false;

  function langCode() {
    if (A.lang === "English") return "en";
    if (A.lang === "日本語") return "ja";
    return "zh-CN";
  }

  function pathFor(kind, filename) {
    var base = window.location.origin + window.location.pathname;
    return "domain=" + base + ";" + (kind === "page" ? "page=" : "article=") + filename;
  }

  function note(container, text) {
    container.innerHTML = '<p class="comment-note">' + A.esc(text) + "</p>";
  }

  function hasValue(value) {
    return typeof value === "string" && value.trim() !== "";
  }

  function mount(main, context) {
    var container = main.querySelector("#comments");
    if (!container) return;
    var comment = A.state.blog["全局评论设置"] || {};
    var valine = comment["valine设置"] || {};
    var waline = comment["waline设置"] || {};
    var rustaline = comment["rustaline设置"] || {};
    var disqus = comment["disqus设置"] || {};
    var kind = context.kind === "page" ? "page" : "article";
    var path = pathFor(kind, context.filename);

    if (comment["启用valine评论"] === true) {
      var publicService = valine["是否使用bbg公共评论服务"] === true;
      var appId = publicService ? PUBLIC_APP_ID : valine["leancloud_appid"];
      var appKey = publicService ? PUBLIC_APP_KEY : valine["leancloud_appkey"];
      if (!hasValue(appId) || !hasValue(appKey)) {
        note(container, A.t("COMMENTS_UNAVAILABLE"));
        return;
      }
      if (publicService && (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1")) {
        note(container, A.t("COMMENTS_PREVIEW"));
        return;
      }
      A.loadScript(A.cdn("valine@1.5.1/dist/Valine.min.js"))
        .then(function () {
          if (!window.Valine) throw new Error("Valine 未就绪");
          new window.Valine({
            el: "#comments",
            appId: appId,
            appKey: appKey,
            path: path,
            placeholder: String(valine["评论区占位符（提示文字）"] || A.t("COMMENTS")),
            enableQQ: valine["评论者填写邮箱为qq邮箱时使用qq昵称和头像代替gravatar头像"] === true,
            lang: langCode(),
            recordIP: valine["记录评论者ip"] === true
          });
        })
        .catch(function (error) {
          console.error("[Antiphon] Valine 加载失败：", error);
          note(container, A.t("COMMENTS_LOAD_FAILED"));
        });
      return;
    }

    if (comment["启用waline评论"] === true) {
      if (!hasValue(waline["serverurl"])) {
        note(container, A.t("COMMENTS_UNAVAILABLE"));
        return;
      }
      Promise.all([
        A.loadStyle(A.cdn("@waline/client@3.16.2/dist/waline.css")),
        A.loadScript(A.cdn("@waline/client@3.16.2/dist/waline.umd.js"))
      ])
        .then(function () {
          if (!window.Waline || !window.Waline.init) throw new Error("Waline 未就绪");
          window.Waline.init({
            el: "#comments",
            serverURL: String(waline["serverurl"]).replace(/\/$/, ""),
            path: path,
            lang: langCode(),
            dark: document.body.getAttribute("data-mode") === "night"
          });
        })
        .catch(function (error) {
          console.error("[Antiphon] Waline 加载失败：", error);
          note(container, A.t("COMMENTS_LOAD_FAILED"));
        });
      return;
    }

    if (comment["启用rustaline评论"] === true) {
      if (!hasValue(rustaline["serverurl"])) {
        note(container, A.t("COMMENTS_UNAVAILABLE"));
        return;
      }
      var server = String(rustaline["serverurl"]).replace(/\/$/, "");
      A.loadScript(server + "/sdk/rustaline.js")
        .then(function () {
          if (!window.Rustaline) throw new Error("Rustaline SDK 未就绪");
          new window.Rustaline({
            el: "#comments",
            server: server,
            url: path,
            lang: "auto",
            colorPattern: "#B08A46",
            darkMode: "auto"
          });
        })
        .catch(function (error) {
          console.error("[Antiphon] Rustaline 加载失败：", error);
          note(container, A.t("COMMENTS_LOAD_FAILED"));
        });
      return;
    }

    if (comment["启用disqus评论"] === true) {
      if (!hasValue(disqus["shortname"])) {
        note(container, A.t("COMMENTS_UNAVAILABLE"));
        return;
      }
      var shortname = String(disqus["shortname"]).trim();
      window.disqus_config = function () {
        this.page.identifier = path;
        this.page.url = window.location.href;
      };
      if (window.DISQUS && disqusLoaded) {
        window.DISQUS.reset({ reload: true, config: window.disqus_config });
        return;
      }
      disqusLoaded = true;
      var script = document.createElement("script");
      script.src = "https://" + shortname + ".disqus.com/embed.js";
      script.setAttribute("data-timestamp", String(Date.now()));
      script.onerror = function () { note(container, A.t("COMMENTS_LOAD_FAILED")); };
      document.body.appendChild(script);
      return;
    }

    note(container, A.t("COMMENTS_UNAVAILABLE"));
  }

  A.comments = { mount: mount };
})(window.Antiphon);
