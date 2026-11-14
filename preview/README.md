# preview/ — the sample blog fixture

This directory is the single source of the sample blog. It is used by two
consumers and is never duplicated:

- `tools/preview.sh` mounts it over a temporary directory and serves it locally,
  so the theme can be inspected against realistic content;
- `tools/make-demo.sh` copies it into the GitHub Pages demo, together with the
  theme source from the repository root.

Files:

```
data/index.json          站点配置 + 文章/页面清单
data/i18n.json           可选的元数据译文（标题、副标题、公告、摘要）
data/articles/*.md       示例文章正文（作者原文，不翻译）
data/pages/*.md          示例页面正文
static/favicon.svg       站点图标
atom.xml                 Atom 订阅源
```

Because both consumers read from here, changing a sample article or its metadata
updates the local preview and the published demo at the same time. The demo
directory itself is generated and is not committed.
