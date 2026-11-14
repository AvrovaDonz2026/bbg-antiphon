# Antiphon · 对经

> 主题版本 **2.5.0**（当前发布）。修订记录见各版本 tag / release 说明。

一个 BBG v2 第三方主题。以档案纸、墨色与陶土红构成的机构化排版：
暖色档案纸、点阵墙纹、扫描式窗光（WebGL，附 CSS 回退），以及编号化的目录与勘误式小标题。

兼容 BBG `20261001` 及之后的 v2 版本。

## 安装

从 [Releases](../../releases/latest) 下载 `antiphon-v2.bbgtheme2`，在 BBG 后台「配置第三方主题」中上传。

## 特性

- **三种语言的排版尺度**：`简体中文` / `English` / `日本語` 各有独立的行高、版心、段间距与标题字距。
  日文使用明朝体字族并启用 `palt`/`vpal` 比例假名；英文使用 `all-small-caps` 起首而非首字下沉。
- **印刷而非浮起的纸面**：面板没有侧边框与圆角，左右通过遮罩渐隐融入墙面。
- **窗光**：WebGL 片元着色器绘制扫动的光带与尘埃，`prefers-reduced-motion` 下只渲染静止一帧，
  WebGL 不可用时自动退回 CSS 光晕。
- **明暗双模式**、页边目录、首字下沉（中日文）、阅读时长、复制全文、文章加密等。

## 配置

主题配置写在 `themecfg/themecfg.json`，完整键值与说明见 [`themecfg/themecfg_manual.html`](themecfg/themecfg_manual.html)。

## 开发

```bash
bash tools/preview.sh 8775   # 本地预览，使用 preview/ 中的示例数据
bash tools/make-demo.sh demo # 组装 GitHub Pages 演示站
bash tools/build.sh          # 打包为 dist/antiphon-v2.bbgtheme2
```

目录结构：

```
index.html          入口，按 BBG 查询参数路由
css/                tokens · base · layout · views · motion · light · fonts
js/                 app · router · data · content · views · markdown · i18n · light · comments
themecfg/           themecfg.json 与配置手册
preview/            预览夹具：示例博客数据 + atom.xml，同时也是 demo 的素材来源
tools/              preview.sh · make-demo.sh · build.sh · check-locales.cjs
```

`demo/` 与 `dist/` 都是生成物，不提交到 Git。`demo/` 由
`tools/make-demo.sh` 从主题源码与 `preview/` 夹具组装，`.github/workflows/pages.yml`
在每次部署时调用它；`dist/` 由 `tools/build.sh` 生成。因此仓库里每个文件只有一份
真实来源：主题只有根目录那一份，示例博客只有 `preview/` 那一份。

## 多语言

主题界面文案（导航、分区标题、日期、分页、页脚等）随站点语言在 11 种语言间切换，
界面语言按「访客选择 → 站点配置 `网站语言` → 系统语言 → 英语」的顺序解析。

文章与页面的**正文不翻译**：它是作者用自己语言写的正文，主题无权改写。可选的
`data/i18n.json` 只用于站点自行提供的**元数据**译文（博客标题、副标题、公告、
文章标题/摘要/标签），不填则一律使用原文。

## 许可

[BSD 3-Clause](LICENSE)。
