# Antiphon · 对经

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
bash tools/build.sh          # 打包为 dist/antiphon-v2.bbgtheme2
```

目录结构：

```
index.html          入口，按 BBG 查询参数路由
css/                tokens · base · layout · views · light
js/                 app · router · data · views · markdown · i18n · light · comments
themecfg/           themecfg.json 与配置手册
preview/            本地预览用示例数据（不打包进主题）
tools/              preview.sh · build.sh
```

## 许可

[BSD 3-Clause](LICENSE)。
