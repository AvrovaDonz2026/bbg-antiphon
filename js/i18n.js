/* Antiphon — interface strings */
window.Antiphon = window.Antiphon || {};

(function (A) {
  A.I18N = {
    "简体中文": {
      NAV_ARTICLES: "文章",
      NAV_ARCHIVE: "归档与标签",
      NAV_FRIENDS: "友人帐",
      SEARCH: "搜索",
      SEARCH_PLACEHOLDER: "搜索文章、标签或摘要…",
      NO_RESULTS: "未找到结果",
      PINNED: "置顶",
      PAGE_PREV: "上一页",
      PAGE_NEXT: "下一页",
      READ_TIME: "约 {n} 分钟",
      REVISED: "修订",
      PREV: "上一篇",
      NEXT: "下一篇",
      REFERENCES: "参考",
      INFO: "提示",
      WARNING: "注意",
      DANGER: "危险",
      SUCCESS: "成功",
      COMMENTS: "留言",
      COMMENTS_UNAVAILABLE: "评论系统未配置",
      COMMENTS_LOAD_FAILED: "评论加载失败",
      COMMENTS_PREVIEW: "预览环境评论不可用",
      LICENSE: "授权",
      DOWNLOAD: "下载原文",
      COPY: "复制全文",
      COPY_CODE: "复制",
      COPIED: "已复制",
      SHARE: "复制链接",
      LINK_COPIED: "链接已复制",
      NOT_FOUND: "页面不存在",
      PASSWORD_PROMPT: "请输入文章密码",
      PASSWORD_SUBMIT: "解锁",
      PASSWORD_WRONG: "密码错误",
      LIGHT_ON: "开灯",
      LIGHT_OFF: "关灯",
      THEME_DAY: "日间",
      THEME_NIGHT: "夜间",
      TOC: "目录",
      BACK_TO_TOP: "回到顶部",
      ANNOUNCEMENT: "网站公告",
      LOADING: "载入中",
      LOAD_ERROR: "无法读取站点数据",
      MINUTES: "分钟",
      EMPTY: "暂无内容",
      TAG_TITLE: "标签 · “{tag}”",
      CLOSE: "关闭"
    },
    English: {
      NAV_ARTICLES: "Articles",
      NAV_ARCHIVE: "Archive & tags",
      NAV_FRIENDS: "Friends",
      SEARCH: "Search",
      SEARCH_PLACEHOLDER: "Search titles, tags or excerpts…",
      NO_RESULTS: "No results",
      PINNED: "Pinned",
      PAGE_PREV: "Previous page",
      PAGE_NEXT: "Next page",
      READ_TIME: "About {n} min",
      REVISED: "Revised",
      PREV: "Previous",
      NEXT: "Next",
      REFERENCES: "References",
      INFO: "Note",
      WARNING: "Warning",
      DANGER: "Danger",
      SUCCESS: "Success",
      COMMENTS: "Comments",
      COMMENTS_UNAVAILABLE: "No comment system configured",
      COMMENTS_LOAD_FAILED: "Could not load comments",
      COMMENTS_PREVIEW: "Comments are unavailable in preview",
      LICENSE: "License",
      DOWNLOAD: "Download source",
      COPY: "Copy text",
      COPY_CODE: "Copy",
      COPIED: "Copied",
      SHARE: "Copy link",
      LINK_COPIED: "Link copied",
      NOT_FOUND: "Page not found",
      PASSWORD_PROMPT: "Enter the article password",
      PASSWORD_SUBMIT: "Unlock",
      PASSWORD_WRONG: "Wrong password",
      LIGHT_ON: "Turn light on",
      LIGHT_OFF: "Turn light off",
      THEME_DAY: "Day",
      THEME_NIGHT: "Night",
      TOC: "Contents",
      BACK_TO_TOP: "Back to top",
      ANNOUNCEMENT: "Announcement",
      LOADING: "Loading",
      LOAD_ERROR: "Could not read site data",
      MINUTES: "min",
      EMPTY: "Nothing here yet",
      TAG_TITLE: "Tag · “{tag}”",
      CLOSE: "Close"
    },
    "日本語": {
      NAV_ARTICLES: "記事",
      NAV_ARCHIVE: "アーカイブとタグ",
      NAV_FRIENDS: "友達帳",
      SEARCH: "検索",
      SEARCH_PLACEHOLDER: "記事・タグ・要約を検索…",
      NO_RESULTS: "結果がありません",
      PINNED: "固定",
      PAGE_PREV: "前のページ",
      PAGE_NEXT: "次のページ",
      READ_TIME: "約 {n} 分",
      REVISED: "改訂",
      PREV: "前の記事",
      NEXT: "次の記事",
      REFERENCES: "参考",
      INFO: "ヒント",
      WARNING: "注意",
      DANGER: "危険",
      SUCCESS: "成功",
      COMMENTS: "コメント",
      COMMENTS_UNAVAILABLE: "コメントシステムが未設定です",
      COMMENTS_LOAD_FAILED: "コメントを読み込めません",
      COMMENTS_PREVIEW: "プレビューではコメントを利用できません",
      LICENSE: "ライセンス",
      DOWNLOAD: "原文をダウンロード",
      COPY: "全文をコピー",
      COPY_CODE: "コピー",
      COPIED: "コピーしました",
      SHARE: "リンクをコピー",
      LINK_COPIED: "リンクをコピーしました",
      NOT_FOUND: "ページが見つかりません",
      PASSWORD_PROMPT: "記事のパスワードを入力",
      PASSWORD_SUBMIT: "解除",
      PASSWORD_WRONG: "パスワードが違います",
      LIGHT_ON: "灯りを点ける",
      LIGHT_OFF: "灯りを消す",
      THEME_DAY: "昼",
      THEME_NIGHT: "夜",
      TOC: "目次",
      BACK_TO_TOP: "先頭へ",
      ANNOUNCEMENT: "お知らせ",
      LOADING: "読み込み中",
      LOAD_ERROR: "サイトデータを読み込めません",
      MINUTES: "分",
      EMPTY: "まだ何もありません",
      TAG_TITLE: "タグ · “{tag}”",
      CLOSE: "閉じる"
    }
  };

  A.lang = "简体中文";
  A.overrides = {};

  A.t = function (key, replace) {
    var lang = A.I18N[A.lang] || A.I18N["简体中文"];
    var zh = A.I18N["简体中文"];
    var value = A.overrides[key] || lang[key] || zh[key] || key;
    if (replace && typeof replace === "object") {
      Object.keys(replace).forEach(function (name) {
        value = value.replace(new RegExp("\\{" + name + "\\}", "g"), String(replace[name]));
      });
    }
    return value;
  };

  /* data-script drives the per-language token layer in css/tokens.css.
     It is the primary switch; :lang() on <html> is the CSS-level fallback. */
  A.scriptOf = function (lang) {
    if (lang === "English") return "latin";
    if (lang === "日本語") return "ja";
    return "cjk";
  };

  A.setScript = function (lang) {
    var script = A.scriptOf(lang || A.lang);
    try {
      document.body.setAttribute("data-script", script);
      /* keep html[lang] in sync — :lang() fallbacks and hyphenation depend on it */
      var code = script === "latin" ? "en" : script === "ja" ? "ja" : "zh-CN";
      if (document.documentElement.getAttribute("lang") !== code) {
        document.documentElement.setAttribute("lang", code);
      }
    } catch (e) {}
    return script;
  };

  A.setLang = function (lang) {
    A.lang = A.I18N[lang] ? lang : "简体中文";
    A.setScript(A.lang);
  };

  A.applyInterfaceText = function (blog) {
    A.overrides = {};
    try {
      var cfg = blog && blog["自定义界面文本"];
      if (!cfg || cfg["启用"] !== true) return;
      var list = cfg["列表"] || [];
      for (var i = 0; i < list.length; i++) {
        if (list[i] && typeof list[i].key === "string") {
          A.overrides[list[i].key] = String(list[i].value == null ? "" : list[i].value);
        }
      }
    } catch (e) {}
  };
})(window.Antiphon);
