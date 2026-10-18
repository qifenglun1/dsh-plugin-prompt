# Prompt Library for DeepSeek Harness

[English](README.md) | 中文

一个 DeepSeek Harness Web 插件：把可复用的提示词模板放到侧边栏和输入框旁边。选择模板后会插入到当前光标处；没有打开的对话时，会新建对话并把模板填入草稿。

仓库地址：<https://github.com/qifenglun1/dsh-plugin-prompt>

## 功能

- **侧边栏模板库**：左侧边栏的书签入口打开完整模板库面板。
- **输入框快速选择**：输入框工具栏的书签按钮打开紧凑选择器，可直接搜索并插入。
- **光标处插入**：插入到当前草稿的光标处；有选区时替换选区。可通过输入框正常的撤销历史撤销。
- **无对话时自动新建**：没有打开的对话时，选择模板会新建对话并填入草稿。
- **模板管理**：新建、编辑、删除、另存为、复制、搜索，并按分类筛选。
- **分类**：可以先建分类再建模板。空分类会提供“在此分类下新建模板”。如果分类名与内置分类名称相同，会归入内置分类，不会重复创建。
- **8 个内置模板**：代码审查、重构、编写测试、排查问题、解释代码、总结内容、翻译润色、结构化调研。内置模板跟随界面语言，且为只读；“另存为我的模板”可创建可编辑副本。
- **中英文界面**：跟随 DSH 的语言设置。
- **无需配置**：不需要 API Key、Token、密码、账号或外部服务。

## 环境要求

- DeepSeek Harness **0.2.1-rc.2** 或更高版本，使用 Web 或 Desktop 界面。
- 一个允许安装 bundle 的 DSH Profile（默认 Desktop Profile 即可）。
- 从本仓库安装时需要能访问 GitHub。

插件是一个 **bundle**，不是独立网页。请通过 DSH 的插件管理器安装，不要直接打开 `client.js`。

仓库根目录就是可安装包根目录，包含 `package.json`、`cordis.patch.yml`、`index.js` 和 `client.js`；没有 monorepo 子目录，也没有构建步骤。

## 从 GitHub 安装

### Desktop / Web（推荐）

1. 在 DSH 中打开 **插件**。
2. 选择 **添加插件** → **安装第三方插件**。
3. 粘贴仓库地址：

   ```text
   https://github.com/qifenglun1/dsh-plugin-prompt
   ```

4. 阅读信任提示并确认安装。DSH 会读取 `package.json` 并安装 bundle。
5. 如果 `prompt-library` 行仍处于关闭状态，在 **插件** 中启用它。
6. 如果侧边栏书签没有出现，刷新一次 Web 界面。

### 命令行

`dsh plugin --profile <name> add ...` 会把安装操作转发给该 Profile 目录中的 pnpm。请使用你实际运行的 Profile（`web`、`desktop` 或自定义名称）：

```bash
dsh plugin --profile web add github:qifenglun1/dsh-plugin-prompt
```

基于 pnpm 的安装也接受等价的 GitHub URL 形式：

```bash
dsh plugin --profile web add https://github.com/qifenglun1/dsh-plugin-prompt
```

从 Git 安装获取的是源码，不是预构建产物。本包是纯 JavaScript，没有 `prepare`/`build` 脚本，因此 pnpm 不需要在安装时执行构建，也不会要求用户批准构建脚本。

不要手工修改 Profile 的 `package.json` 或 `cordis.patch.yml`；这些文件由插件管理器维护。

### 本地 checkout（开发）

把本仓库的绝对路径安装为链接 bundle：

```bash
dsh plugin --profile dev add /absolute/path/to/dsh-plugin-prompt
```

插件管理器会把 checkout 链接到 Profile 中，修改 `client.js` 后刷新页面即可看到变化。请把 `dev` 换成一次性的测试 Profile，不要把开发链接混入日常使用的 Profile。

### 更新与卸载

DSH 升级非官方插件的方式是先卸载再重新安装。在 **插件** 中卸载 bundle，然后安装新的仓库版本。命令行操作：

```bash
dsh plugin --profile web remove dsh-plugin-prompt
dsh plugin --profile web add github:qifenglun1/dsh-plugin-prompt
```

卸载 bundle 会移除侧边栏入口和输入框选择器。已经保存在浏览器中的模板不会被卸载删除；如需彻底清除，请清理下面的存储键。

## 配置

插件**没有 Config schema**，也没有必填设置。不需要 API Key、Token、密码、端点或模型选择。

| 配置项 | 位置 |
| --- | --- |
| 模板 | 在模板库面板或模板编辑器中管理。 |
| 分类 | 通过“新建分类”创建，或在模板编辑器中输入新分类。 |
| 语言 | 跟随 DSH 的语言设置（`English` 或 `简体中文`）。 |
| 内置模板 | 固定在插件中；“另存为我的模板”可创建可编辑副本。 |

### 浏览器存储

模板和分类保存在 Harness Web 源的 `localStorage` 中：

- `dsh.prompt-library.templates.v1`：用户模板。
- `dsh.prompt-library.categories.v1`：独立于模板存在的分类。该键缺失时，已保存模板用过的分类会迁移进来。

`localStorage` 按 Web 源隔离。不同源、不同浏览器 Profile 或清除站点数据后，数据彼此独立。插件不会把模板写入会话日志，不会发送到服务器，也不会读取凭据。发送消息时，消息文本会像平常一样通过 DSH 到达你配置的模型。

## 使用

### 侧边栏模板库

1. 点击左侧边栏的书签入口。
2. 按标题、内容或分类搜索，或点击分类标签筛选。
3. 选择 **插入** 把模板放入当前草稿，**复制** 复制模板，或 **另存为我的模板** 复制内置模板。
4. 使用 **新建分类** 先创建还没有模板的分类。
5. 使用面板标题栏的返回箭头回到对话。

### 输入框选择器

1. 点击输入框左侧工具栏的书签按钮。
2. 在新建的空对话中，选择器会以居中对话框打开，搜索框始终可见；在已有对话中，它会在输入框上方打开。
3. 搜索模板。用方向键移动、回车插入，或直接点击一行。
4. 模板会插入到光标处（或替换当前选区）。

### 示例

创建一个可复用的代码审查提示词：

1. 打开侧边栏模板库。
2. 选择 **新建模板**。
3. 标题填 `审查 PR`，分类填 `编程开发`，内容填：

   ```text
   请审查这次改动，重点关注正确性、边界条件、性能、安全性和可维护性。
   按严重程度列出问题，并给出具体的修改建议。

   ```

4. 保存。模板会出现在 **我的模板** 下。
5. 在任意对话中点击输入框书签，选择该模板，它就会插入到光标处。

### 空分类

新建分类后会立即选中该分类。在有模板之前，面板会显示“这个分类还没有模板”和“在此分类下新建模板”。点击后者会打开编辑器并预填分类。

分类目前支持创建和选择，暂不支持重命名或删除。

## 兼容性

- 使用 **DeepSeek Harness 0.2.1-rc.2** 构建并验证。
- 包声明 `engines.dsh: ">=0.2.1-rc.2 <0.3.0"`。安装和 Profile 启动会拒绝范围外的 bundle。
- 客户端使用公开插槽 `sidebar.panellist`、`main`、`conversation.input.left`、`conversation.input.overlay`，以及输入框的 `InputActions.captureInsertion()` / `insertText()`。
- 如果未来的 DSH 版本修改这些插槽，插件可能需要更新。提交问题时请附上 DSH 版本。

## 隐私与安全

- 没有自己的分析、遥测或网络请求。
- 不读取凭据、API Key、Token、Cookie 或账号。
- 不访问宿主机文件系统；Host 半部分是一个空的 `apply()` 行。
- 只在本浏览器源的 `localStorage` 中保存模板和分类名称。
- 内置提示词随插件分发，不属于用户数据。
- 安装任何第三方 bundle 都会在 DSH 内执行其代码。安装前请阅读源码；如需固定版本，可使用 `github:qifenglun1/dsh-plugin-prompt#<sha>` 锁定提交。

## 项目结构

| 文件 | 用途 |
| --- | --- |
| `package.json` | 包元数据、bundle 声明、客户端入口、`dsh.client` inject 列表。 |
| `index.js` | Host 半部分。空的 `apply()`，让 bundle 在插件清单中有对应行并可开关。 |
| `client.js` | 浏览器半部分：侧边栏入口、模板库面板、输入框选择器、插入、存储、语言词典。 |
| `cordis.patch.yml` | 插入 `prompt-library` 行的 bundle patch。 |
| `locale/en.json`、`locale/zh.json` | 插件管理器标题和描述。 |
| `icon.svg` | 插件图标。 |
| `README.md`、`README.zh.md` | 文档。 |
| `LICENSE` | MIT 许可证。 |

## 开发检查

```bash
npm run check
npm pack --dry-run
```

`npm run check` 对 `index.js` 和 `client.js` 执行 `node --check`，只需要 Node.js。`npm pack --dry-run` 会打印 npm 将要发布的确切文件；请确认其中包含 `package.json`、`cordis.patch.yml`、`index.js`、`client.js`、语言文件、图标、两份 README 和 `LICENSE`。

项目没有运行时依赖，也没有构建步骤。浏览器模块使用加载器自带的 React，以及 `dsh.client.inject` 中列出的宿主提供的客户端包。

## 排错

- **侧边栏图标没有出现**：刷新 Web 界面；确认 **插件** 中的 Prompt Library bundle 已启用；检查浏览器控制台是否有客户端模块加载错误。
- **安装失败**：确认 GitHub 仓库根目录包含带 `dsh.bundle.patch` 的 `package.json`，不要把安装地址指向子目录。检查当前 DSH 版本是否满足 `engines.dsh`。如果无法访问 GitHub，可使用插件管理器的镜像或其他安装源。
- **模板消失**：模板保存在当前浏览器源的 `localStorage`。确认使用同一个 Web 源和浏览器 Profile，且站点数据没有被清除。
- **模板没有插入**：输入框可能正在提交或裁决。等发送结束后再试。

## 许可证

MIT。见 [LICENSE](LICENSE)。Copyright (c) 2026 qifenglun1。

插件图标和内置提示词文案均为本项目原创。
