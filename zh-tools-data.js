/**
 * 工具说明的中文对照表（只覆盖 standard 预设的默认工具）。
 *
 * 键是 schema 路径：顶层参数用参数名，数组元素用 `[]`，嵌套对象用 `.`。
 * 例如 `questions[].options[].label`。没列出的工具/参数保持英文原文。
 *
 * 维护约定：改译文只改这里；上游工具改名或改路径时，未命中的条目自动回退英文，
 * 不会静默错位（按路径替换，不做英文串匹配）。
 */

/** 工具名 → { description, parameters }。 */
export const TOOLS = {
    bash: {
        description:
            '执行 bash 命令（`bash -c`）并返回其 stdout/stderr。每次调用都在新的 shell 中运行，不保留状态；'
            + '需要切换目录时用 `workdir`，不要用 `cd`。托管变量 `$DSH_*` 提供当前 harness 的环境事实。'
            + '输出过长时只保留尾部，完整输出会保存到文件并在可用时给出路径。'
            + '参数中请先写 `description` 再写 `command`。'
            + '执行任何删除或移动前，先确认解析出的绝对目标路径就是你要操作的那个；绝不要对未经核对的路径（含拼接或变量展开得到的）执行删除或移动。'
            + '未设置的变量会展开为空串，因此这类路径要用 `${VAR:?}` 做守卫。'
            + '命令可能运行在文件沙箱下；被阻止的文件操作会报 `[sandbox: file access denied under <mode> mode]`，'
            + '这属于策略拒绝：不要换别的办法重试。',
        parameters: {
            description:
                '用主动语态简洁描述这条命令做什么，5–10 个词（会显示在界面上）。'
                + '示例：「ls」→「列出当前目录文件」；「git status」→「查看工作区状态」；「npm install」→「安装依赖包」。',
            command: '要执行的 bash 命令。',
            timeoutMs:
                '超时时间（毫秒）。执行器会套用配置的默认值与上限；超时后命令转入后台成为作业，而不是被杀掉。',
            workdir: '该命令的工作目录。默认使用会话工作区；相对路径基于它解析。',
            run_in_background:
                '在后台运行并立即返回作业 id（用 job_output 取结果，用 job_kill 停止）。不受超时限制。',
            sandbox_permissions:
                '仅用于对刚被沙箱拒绝的同一条命令重试一次：选足以放行、又尽量窄的那一档更宽沙箱模式；这次重试会向用户申请批准。',
            justification:
                '与 `sandbox_permissions` 搭配时必填：用一句话向用户说明这条命令为什么需要更宽的权限。使用用户当前请求所用的语言。',
        },
    },
    read: {
        description: '读取 UTF-8 文本文件，返回带行号的内容。',
        parameters: {
            file_path: '要读取的路径，由文件系统后端解析。',
            offset: '从第几行开始返回（从 1 计）。默认为 1。',
            limit: '最多返回的行数。默认 2000。',
        },
    },
    write: {
        description: '创建或完整覆盖一个 UTF-8 文本文件。',
        parameters: {
            file_path: '要写入的路径，由文件系统后端解析。参数中请先写 `file_path` 再写 `content`。',
            content: '要写入的完整 UTF-8 文本内容。',
            sandbox_permissions:
                '仅用于对刚被沙箱拒绝的同一操作重试一次：选足以放行、又尽量窄的那一档更宽沙箱模式；这次重试会向用户申请批准。',
            justification:
                '与 `sandbox_permissions` 搭配时必填：用一句话向用户说明这个文件操作为什么需要更宽的权限。使用用户当前请求所用的语言。',
        },
    },
    edit: {
        description: '通过替换字面文本修改一个已存在的 UTF-8 文本文件。',
        parameters: {
            file_path:
                '要编辑的路径，由文件系统后端解析。参数中请先写 `file_path`，再写 `old_string` 与 `new_string`。',
            old_string: '要被替换的字面文本。',
            new_string: '替换后的字面文本。传空字符串表示删除匹配到的内容。',
            replace_all: '是否替换所有匹配。默认 false；为 false 时 `old_string` 必须恰好出现一次。',
            sandbox_permissions:
                '仅用于对刚被沙箱拒绝的同一操作重试一次：选足以放行、又尽量窄的那一档更宽沙箱模式；这次重试会向用户申请批准。',
            justification:
                '与 `sandbox_permissions` 搭配时必填：用一句话向用户说明这个文件操作为什么需要更宽的权限。使用用户当前请求所用的语言。',
        },
    },
    read_image: {
        description:
            '读取 PNG/JPEG/WebP/GIF 图片并返回图像本身。大图会自动缩放；不要为了查看图片而安装图像库或生成缩略图。',
        parameters: {
            file_path: '图片文件路径，由文件系统后端解析。',
        },
    },
    glob: {
        description:
            '按 glob 模式查找文件（不含目录），包含隐藏与被忽略的文件。最多返回 100 条，按修改时间排序；'
            + '结果更多时保留前若干条，并说明完整列表保存在哪里。',
        parameters: {
            pattern:
                '用于匹配文件路径的 glob 模式（如 "**/*.ts"、"src/**/*.test.js"）。'
                + '不含 "/" 的模式按文件名在任意深度匹配，因此 "*" 与 "*.ts" 都会搜索整棵树；要限定层级请带上分隔符。',
            path: '要搜索的目录。默认使用会话工作区；相对路径基于它解析。',
        },
    },
    grep: {
        description:
            '使用 ripgrep 正则搜索文件内容。按文件分组返回匹配行及其行号。'
            + '最多返回 250 条；结果更多时会说明完整匹配列表保存在哪里。',
        parameters: {
            pattern: '要搜索的正则表达式（ripgrep 语法）。',
            path: '要搜索的文件或目录。默认使用会话工作区；相对路径基于它解析。',
            include: '限定搜索哪些文件的单个 glob 过滤（如 "*.ts"、"*.{js,jsx}"）；只接受一个值；不支持取反。',
        },
    },
    job_output: {
        description: '读取后台作业：流式作业返回上次读取之后的输出；结果型作业返回完成后的结果。',
        parameters: {
            job_id: '启动该后台作业的工具返回的作业 id。',
            wait: '阻塞等待作业结束或超时；等待超时后作业仍在运行。默认 false。',
            timeout_ms: '`wait: true` 时的最长等待毫秒数。默认值由配置决定，并受其上限约束。',
        },
    },
    job_list: {
        description: '列出你的后台作业（运行中与已结束），包含 id、类型与状态。',
    },
    job_kill: {
        description: '请求取消一个运行中的后台作业。',
        parameters: {
            job_id: '启动该后台作业的工具返回的作业 id。',
            reason: '可选的简短原因，会写入日志并转达给作业。',
        },
    },
    todo_write: {
        description:
            '记录并更新任务清单，用于规划多步工作并展示进度；单步的琐碎任务可跳过。'
            + '开始前为每个具体步骤各加一条。工作未完成期间，正在做的条目保持 `in_progress`，只有并行推进时才可同时有多条。'
            + '每条一旦完成立即标记 `completed`。',
        parameters: {
            todos: '完整的任务清单，会替换此前的清单。',
            'todos[].content': '任务内容——一句简短的祈使句。',
            'todos[].status': 'pending（未开始）｜in_progress（进行中）｜completed（已完成）。',
        },
    },
    web_search: {
        description: '搜索网络以获取最新信息。返回可选的摘要答案和来源 URL 列表。',
        parameters: {
            queries: '1–4 个搜索查询；结果会合并。',
        },
    },
    web_fetch: {
        description: '抓取指定 HTTP(S) URL 的内容并以文本形式返回。',
        parameters: {
            url: '要抓取的 HTTP(S) URL。',
        },
    },
    ask_user_question: {
        description: '在继续之前需要用户确认、做选择或缺少信息时，向用户提一个简明的问题。',
        parameters: {
            questions: '继续之前要向用户提的问题。',
            'questions[].id': '该问题的稳定 id，会在回答中回显。',
            'questions[].question': '要向用户提出的具体问题。',
            'questions[].header': '可选的简短标题，如「确认」或「选择模式」。',
            'questions[].options': '可选，向用户展示的选项。如果你推荐其中一项，把它放第一位，并给该标签加上 "(Recommended)"。',
            'questions[].options[].label': '面向用户的简短选项标签。',
            'questions[].options[].description': '用一句话说明取舍或影响。',
            'questions[].multi_select': '用户是否可多选。默认 false。',
        },
    },
    exit_plan_mode: {
        description:
            '仅在计划模式下使用。把计划提交给用户审阅，获批后退出计划模式。'
            + '用户可以直接批准（你从下一步起执行计划），也可以继续规划——反馈会通过工具结果返回；据此修改并重新提交。',
        parameters: {
            plan: '完整计划（markdown 格式），开头用一个命名该计划的 # 标题。',
        },
    },
    working_directory: {
        description:
            '读取当前工作目录，或用 cd 切换。相对路径以当前目录为基准。'
            + '已存在的 shell 与正在运行的进程保留它们各自的目录。',
        parameters: {
            cd: '要进入的目录（须已存在）。省略则读取当前目录。',
        },
    },
    skill: {
        description:
            '加载一个技能的完整说明。当任务点名或明显匹配会话技能目录中的某个技能时，先调用它再动手。',
        parameters: {
            name: '可用技能列表中的确切技能名。',
        },
    },
    create_goal: {
        description:
            '创建一个持久化目标，让本会话在自动续轮中持续推进。'
            + '当人类的直接请求是一个长期目标时使用——即使用户没有说「目标」；单轮工作不要用。',
        parameters: {
            objective: '从人类直接请求中推断出的具体完成目标的描述。',
            max_goal_rounds: '可选的自动续轮次数上限，须为正安全整数。',
        },
    },
    get_goal: {
        description: '读取当前会话目标，包括 update_goal 所需要的 id 与 revision。',
    },
    update_goal: {
        description: '更新当前目标。',
        parameters: {
            goal_id: 'get_goal 返回的确切 id。',
            revision: 'get_goal 返回的确切正数 revision。',
            action:
                'edit、pause、resume 需人类在会话顶层直接提出请求（区别于自动续轮）。'
                + 'complete 与 blocked 也允许在该目标的自动续轮中使用；blocked 在达到配置的最少轮数前会被拒绝。',
            objective: '替换后的目标描述；仅在 action 为 edit 时有效。',
            max_goal_rounds: '替换后的轮数上限；仅在 action 为 edit 时有效。',
            blocked_reason: '仅在 action 为 blocked 时必填：跨多轮持续存在、确实阻塞进展的具体条件。',
        },
    },
    present: {
        description:
            '把已存在的文件声明为给用户的最终交付物。当用户需要一个独立文件时用它，尤其是 Office 文档、电子表格与幻灯片；'
            + '最终回复本身足够时优先用回复。用户打开的是当前文件，其内容不会被复制。',
        parameters: {
            files: '通常取最重要的 1–2 个交付物；每次最多 4 个。',
            'files[].path': '已存在的普通文件路径。相对路径以会话工作目录为基准。',
            'files[].description': '给用户看的简短说明。',
        },
    },
    send_message: {
        description:
            '向某个 agent 发送消息。工作中的 agent 会在下一步收到它；空闲的 agent 会因此开启新一轮。'
            + '返回的是投递确认，不是该 agent 的回答。',
        parameters: {
            agent_id: '你的直接可继续子代理的 agent id；当你本身是常驻的可继续子代理时，也可以填你的直接父代理。',
            message: '要投递给该 agent 的消息。',
        },
    },
    interrupt_agent: {
        description:
            '要求子代理停止当前工作。本调用不会等它真正停下就返回。'
            + '之后你可以用 send_message 继续本地直接子代理的对话。外部执行会永久停止，且无法接收后续消息。'
            + '它启动的子代理仍会继续运行。',
        parameters: {
            agent_id: '在你之下创建的 agent 的 id：直接子代理，或更深层的后代。',
        },
    },
    list_agents: {
        description:
            '列出你启动的子代理，含 id、标签与状态。running 表示正在工作；inactive 表示当前没有在工作。'
            + '子代理结束时你会收到通知，无需反复查状态。要继续对话用 send_message。',
        parameters: {
            scope:
                'children（默认）列出直接子代理，任何状态下都可对它们用 send_message。'
                + 'descendants 列出你下方的整棵树，每项带其父会话 id 与深度；深度大于 1 的条目只接受 interrupt_agent。',
        },
    },
    subagent: {
        description:
            '把一个自包含的任务委派给子代理（一个在独立上下文中工作的 agent），用来卸载聚焦、独立的工作——'
            + '调研、限定范围的实现、分析——避免占用本对话的上下文。子代理只返回结果，不返回中间的每一步。'
            + '本工具会启动一个独立托管的子代理并立即返回其 id，结束时运行时会通知你。'
            + '子代理用 `send_message` 回报结果；你也可以用它在其运行中纠偏，或在结束后继续对话。'
            + '子代理的模型选择是可选的：省略 `provider`、`model` 与 `reasoning_effort` 就使用配置好的子代理默认值，'
            + '并从父代理继承兼容的缺失值。先用 `list_subagent_models` 查看可用的路由与推理档位，'
            + '再成对提供 `provider` 与 `model`。改了实际路由但没点名推理档位时，使用所选模型的默认档位。',
        parameters: {
            cwd: '子代理的初始工作目录。相对路径以你当前目录为基准；省略则继承。之后两个 agent 的目录变化彼此独立。',
            description: '对被委派任务的一句话描述（3–5 个词），用于展示。',
            prompt: '交给子代理的完整、自包含任务。它不共享本对话的上下文，所以要把所需信息都写进去。',
            provider: '子代理的 LLM 提供方路由。与 model 成对提供；两者都省略则使用配置好的子代理默认值，或继承父代理路由。',
            model: '由 provider 解释的模型 id。与 provider 成对提供；两者都省略则使用配置好的子代理默认值，或继承父代理路由。',
            reasoning_effort: '子代理实际路由的推理档位（由适配器定义）。省略则继承兼容的配置值或父代理的档位，或使用新选模型的默认档位。',
        },
    },
    subagent_fork: {
        description:
            '把任务委派给一个继承本对话的子代理：子代理以到目前为止所有已完成的轮次为种子'
            + '（看不到当前正在进行中的这一轮）。当子任务要建立在本对话的上下文之上——后续分析、评审、续做——'
            + '又不想让这些工作占用本对话的上下文时用它。你收到的是它的结果，不是中间步骤。'
            + '本工具启动独立托管的子代理并立即返回 id，结束时运行时会通知你。'
            + '子代理用 `send_message` 回报结果；你也可以用它纠偏或继续对话。',
        parameters: {
            cwd: '子代理的初始工作目录。相对路径以你当前目录为基准；省略则继承。之后两个 agent 的目录变化彼此独立。',
            description: '对被委派任务的一句话描述（3–5 个词），用于展示。',
            prompt: '交给子代理的任务。它已经能看到本对话已完成的轮次，所以可以直接在其上展开，只说明新增的部分。',
        },
    },
    workflow: {
        description:
            '运行一段用 JavaScript 写的 workflow 脚本，用脚本大规模编排子代理。当工作会扇出成许多互相独立的小块时用它——'
            + '对很多文件做审计、迁移、多角度调研、对结论做对抗性验证——此时你把编排写成脚本，而不是一轮一轮地委派。\n\n'
            + '脚本体内可用的钩子：\n'
            + '- `agent(prompt, opts?): Promise<any>` —— 跑一个子代理直到完成。不给 `opts.schema` 时解析为子代理的最终文本；'
            + '给 `opts.schema`（以 object 为根、只允许使用 type/properties/required/additionalProperties/items/enum/const/oneOf 这些关键字的 JSON Schema）'
            + '时解析为校验后的对象。子代理失败时解析为 `null`（可用 `.filter(Boolean)` 过滤）。'
            + '其他选项：`label`（展示用）、`phase`（进度分组），以及独立的 `provider`/`model` LLM 目标覆盖。\n'
            + '- `pipeline(items, ...stages): Promise<any[]>` —— 让每个 item 独立走完各阶段，阶段之间不设屏障'
            + '（多阶段工作优先用它）。每个阶段收到 `(prev, item, index)`。某个阶段抛错只会把该 ITEM 降为 `null` 并跳过它剩余的阶段。\n'
            + '- `parallel(thunks): Promise<any[]>` —— 并发运行一组零参函数并等待全部完成（这是屏障；'
            + '只有某个阶段确实需要所有先前结果时才用）。抛错的 thunk 解析为 `null`。\n'
            + '- `phase(title)` —— 开始一个进度阶段；`log(message)` —— 输出进度说明；`args` —— 本次工具调用的 `args` 输入，原样传入。\n\n'
            + '误用钩子（参数不对、未知选项、不支持的 schema、触碰上限）会让整段脚本终止，而不是产生 `null`。'
            + '脚本里没有文件系统、网络、定时器或 Node.js API；活由子代理来干。',
        parameters: {
            script: '纯 JavaScript 脚本体，不是 TypeScript，也不要写 `export const meta` 语句；允许顶层 await。'
                + '最后用 `return <value>` 结束；该值是 JSON 可序列化的，就是本工具的结果。',
            meta: 'workflow 的身份信息，纯 JSON，不是代码。',
            'meta.name': '简短的 kebab-case workflow 名。',
            'meta.description': '一句话说明该 workflow 做什么。',
            'meta.whenToUse': '可选，说明该 workflow 适用场景的指引。',
            'meta.phases': '可选，阶段声明，由 phase() 调用按字符串精确匹配。',
            'meta.phases[].title': '阶段标题，phase() 按该字符串精确匹配。',
            'meta.phases[].detail': '可选，该阶段的一句话说明。',
            'meta.phases[].provider': '可选，该阶段预期使用的 provider 覆盖。',
            'meta.phases[].model': '可选，该阶段预期的模型覆盖。',
            args: '可选的 JSON 输入，作为 `args` 全局变量暴露给脚本（裸数组要包成字段，如 {"files": [...]}）。',
            run_in_background: '作为后台作业运行：立即返回作业 id 而不等待；返回值随完成通知到达。',
        },
    },
    schedule_create: {
        description:
            '在当前会话创建一条提醒，到点后投递 prompt。必须且只能给一个时间参数：'
            + 'after_seconds、at、every_seconds、daily、weekly 或 cron。在该时区中不存在的本地时间会被跳过；'
            + '重复的本地时间只触发一次，取较早的那一刻。宕机之后，循环提醒只补投最近一次错过的时间。崩溃后投递可能重复。',
        parameters: {
            prompt: '到点时要呈现的提醒内容。',
            title:
                '用用户语言书写的简短任务名，最多 120 字符。只写核心动作与对象；保留必要的目标标识（如 PR 编号、分支名）。'
                + '不要写执行频率（如每天、每小时）、计划日期或时间、时区、任务状态，也不要写配置与执行细节'
                + '（如只读模式、profile 标签过滤），即使它们出现在用户请求或已有标题里。不要追加括号备注。'
                + '调度信息放进时间参数，执行说明放进 prompt。',
            after_seconds: '延迟秒数（整数）。',
            every_seconds: '固定间隔秒数（整数），至少 60，按创建时刻对齐；用 schedule_update 修改时会按保存时刻重新对齐。',
            daily: '每天在某个本地时间触发。',
            'daily.time': 'HH:mm:ss，可带 1–3 位小数，例如 23:00:00。',
            'daily.time_zone': 'UTC 或 IANA 区域/位置，例如 Asia/Shanghai。',
            weekly: '在指定的星期几、某个本地时间触发。',
            'weekly.time': 'HH:mm:ss，可带 1–3 位小数，例如 09:00:00。',
            'weekly.time_zone': 'UTC 或 IANA 区域/位置，例如 Asia/Shanghai。',
            'weekly.weekdays': 'ISO 星期编号，周一到周日为 1 到 7，不得重复。',
            cron: '带时区的五字段 Vixie cron 表达式。',
            'cron.expression': '分 时 日 月 周，例如 "*/15 9-17 * * 1-5"。当两个日期字段都受限时，任一匹配即视为匹配。',
            'cron.time_zone': 'UTC 或 IANA 区域/位置，例如 Asia/Shanghai。',
            at: '绝对时间目标：带偏移量的 RFC 3339 日期时间，或由本地日期、时间与 IANA time_zone 组成的本地时间。',
        },
    },
    schedule_list: {
        description: '列出当前会话中的活动提醒。',
    },
    schedule_update: {
        description:
            '就地修改一条提醒，保留其 id。给一个新的 title、prompt，或至多一个时间参数；省略的字段保持已存值。'
            + '要改相对延迟，请新建一条提醒。',
        parameters: {
            id: 'schedule_list 返回的提醒 id。',
            title: '新任务名；遵循 schedule_create 的标题规则。',
            prompt: '新的提醒内容。',
            every_seconds: '固定间隔秒数（整数），至少 60，按创建时刻对齐；用 schedule_update 修改时会按保存时刻重新对齐。',
            daily: '每天在某个本地时间触发。',
            'daily.time': 'HH:mm:ss，可带 1–3 位小数，例如 23:00:00。',
            'daily.time_zone': 'UTC 或 IANA 区域/位置，例如 Asia/Shanghai。',
            weekly: '在指定的星期几、某个本地时间触发。',
            'weekly.time': 'HH:mm:ss，可带 1–3 位小数，例如 09:00:00。',
            'weekly.time_zone': 'UTC 或 IANA 区域/位置，例如 Asia/Shanghai。',
            'weekly.weekdays': 'ISO 星期编号，周一到周日为 1 到 7，不得重复。',
            cron: '带时区的五字段 Vixie cron 表达式。',
            'cron.expression': '分 时 日 月 周，例如 "*/15 9-17 * * 1-5"。当两个日期字段都受限时，任一匹配即视为匹配。',
            'cron.time_zone': 'UTC 或 IANA 区域/位置，例如 Asia/Shanghai。',
            at: '绝对时间目标：带偏移量的 RFC 3339 日期时间，或由本地日期、时间与 IANA time_zone 组成的本地时间。',
        },
    },
    schedule_delete: {
        description: '删除当前会话中的一条提醒，活动或非活动均可。删除不会撤回已经排入队列的提醒消息。',
        parameters: {
            id: '确切的提醒 id。',
        },
    },
    list_mcp_resources: {
        description: '列出某个 MCP 服务器提供的资源。',
        parameters: {
            server: '已配置的 MCP 服务器名。',
            cursor: '该服务器返回的续读游标。',
        },
    },
    list_mcp_resource_templates: {
        description: '列出某个 MCP 服务器提供的参数化资源 URI 模板。',
        parameters: {
            server: '已配置的 MCP 服务器名。',
            cursor: '该服务器返回的续读游标。',
        },
    },
    read_mcp_resource: {
        description: '从指定服务器按 URI 读取一个 MCP 资源。可用已列出的 URI，或展开后的资源模板。',
        parameters: {
            server: '已配置的 MCP 服务器名。',
            uri: '要读取的资源 URI。',
        },
    },
};
