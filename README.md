# @xiaoxia/dsh-preset-standard-zh

DSH 的 `standard` 预设中文版：**工具与能力与 standard 完全一致**，只把模型看到的三类文本换成中文，并加了两条工作约定。

一个包 = 一个预设 + 三个包内插件，安装一次即可；

## 组成

| 部分 | 作用 |
| --- | --- |
| `presets/standard-zh.patch.yml` | 声明 `standard-zh` 预设：逐行复制 standard 的 22 个插件行，仅改 persona、plan-mode 两处文本，并多挂三个包内插件 |
| `zh-prompt.js` | 在预设作用域内注册与全局同名的 section（`harness:identity`、`harness:source`、`app:web-surface`），把它们遮蔽成中文 |
| `zh-tools.js` + `zh-tools-data.js` | 在 `system-prompt/assemble` waterfall 里改写 34 个默认工具的 `description` 与参数说明；工具名/参数名/枚举/执行路径不动 |
| `zh-directives.js` | 系统提示最前一条基调（order `-1000000`）+ 每轮第一步经 `agent/pre-step` 追加一条工作方式提醒 |

## 安装

```bash
# 方式一：从目录（开发用，软链）
dsh plugin --profile web add /path/to/dsh-preset-standard-zh

# 方式二：从打包产物
dsh plugin --profile web add ./xiaoxia-dsh-preset-standard-zh-1.2.0.tgz

# 方式三：宿主内的 plugin_manager
plugin_manager install_bundle   # target 传包目录或 tgz 路径
```

安装进某个 profile 后，新建会话在模式选择器里选 **「标准（中文提示）」**。不需要重启；改 `presets/*.patch.yml` 之后需要一次 bundle 重载（`set_bundle` false→true），而**同一模块路径的 JS 内容改动要重启进程**才换（Node 按 URL 缓存）。

## 验证

```bash
# 1) 行是否挂载（应 enabled=true / fiberPhase=active）
plugin_manager list_plugins | grep preset-standard-zh

# 2) 新会话里看系统提示与工具
#    会话日志 session.v4.jsonl.zstd 的 system/message 与 request/header
zstdcat <session>/session.v4.jsonl.zstd | grep -o '我们是 DeepSeek[^"]*' | head -1
```

一条完整的实测口径：新开会话选该预设 → system 首行是「我们是 DeepSeek…」→ `request/header.tools` 里 34 个工具描述为中文且 schema 骨架与 standard 一致 → 聊两句，`user/message` 中每轮各出现一条 `source.kind = zh-directive`。

## 自定义

- **扩工具**：在 `zh-tools-data.js` 里按 `工具名: { description, parameters: { <schema 路径>: 中文 } }` 追加；路径规则是顶层参数名、数组 `[]`、嵌套 `.`（如 `questions[].options[].label`）。没列出的工具保持英文。
- **改提醒**：改 `zh-directives.js` 里的 `WORKING` / `BASELINE` 文本；想每步都提醒就去掉 `payload.step !== 1` 判断。
- **加提示段**：在 `zh-prompt.js` 的 `SECTIONS` 里加一条（`name` 与全局同名才会遮蔽）。

## 边界

- 工具说明之外的**运行期文本**（工具返回、报错）仍是英文。
- 运行期 context（`Current working directory:` / `Current DSH file policy:` 等）保持英文：`working-directory:current` 由宿主在 `assembly` 之后重写，作用域遮蔽无效。
- 用户内容（AGENTS.md、SOUL/MEMORY、persona suffix）原样保留。
- 预设不是沙箱：patch 与插件都会在 Host 进程里执行。

## 环境

DSH `0.2.1-rc.2`；无第三方运行时依赖；Node.js 22+（`node:crypto` 的 `randomUUID`）。
