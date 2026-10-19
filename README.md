# AI 学习实验室

一个可以拨动参数、逐步观察训练过程的中文交互学习站。

[打开学习站](https://cyrilggg.github.io/ai-learning-lab/)

## 第一课：让模型学会一条直线

先调节 `w` 和 `b`，再观察模型如何通过梯度下降调整它们。课程包括：

- 预测线、正确答案与误差的实时对照。
- 可切换学习率、单步训练、连续 10 步训练与误差曲线。
- 最近一步的梯度与参数更新计算。
- 三个小实验、自测与浏览器本地完成清单。
- 可下载的 CPU PyTorch 实验，包含训练集与验证集。

网页使用无噪声合成数据展示机制；Python 实验使用带噪声合成数据。数值实验不代表大模型训练效果。后续课程随学习推进逐步增加。

## 第二课：从直线到转折

打开 `site/lesson-02.html`，按三个短实验理解非线性：对照 x−1 与 ReLU(x−1)，用三个参数控制一个转折，再把两个 ReLU 贡献相加，与同一组样本上的最小二乘直线比较。提供手动挑战、自测和独立的浏览器完成清单。本课没有自动训练或验证集；样本误差只用于比较拟合，不能代表泛化。

课程按理解程度推进，不按周划分，一天可以学多课。第一课的进度键保持 `ai-learning-lab.lesson-01.v1`；第二课使用 `ai-learning-lab.lesson-02.v1`。

## 本地运行与入口

直接打开 `site/index.html`，或在仓库目录运行 `python -m http.server 8080 --directory site`，访问 `http://localhost:8080`。

网页无构建步骤、无第三方运行依赖、无 API 密钥。只发布 `site/`，浏览器清单不上传、不跨设备同步。

## 验证

运行 `node tests/model.test.cjs` 验证梯度、收敛与过大学习率的行为。

浏览器回归测试需要安装 Playwright 及 Chromium，或使用已有的 Edge：

```sh
npm install --no-save playwright
npx playwright install chromium
node tests/browser.test.cjs
```

已有 Edge 时可设置环境变量 `BROWSER_CHANNEL=msedge`。Python 实验按 [PyTorch 官方安装页](https://pytorch.org/get-started/locally/)安装 PyTorch，再运行 `python site/train_linear.py`。

## 发布与维护

`main` 保存课程源码，`gh-pages` 仅保存 `site/` 的静态内容，由 GitHub Pages 自动部署。发布前运行计算测试和必要的浏览器验证，再运行 `git subtree push --prefix site origin gh-pages`。当前 GitHub 登录没有写 Actions 工作流的权限，因此使用静态分支发布。只维护这份独立仓库，不复制个人看板或私人资料。

- `site/model.js`：纯计算模型，更新使用同一组旧参数的梯度。
- `site/app.js`：图表、控制、边界处理与本地清单。
- `site/index.html`：课程内容与页面结构。
- `site/train_linear.py`：可运行训练实验。

手动调参数或改变学习率会重开误差曲线；改变学习率保留参数，比较不同学习率时先重置到同一起点。参数越界或超过 1000 步会暂停显示实验，可重置继续。
