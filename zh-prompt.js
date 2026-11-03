/**
 * `zh-prompt` — 预设内局部覆盖系统提示里的非工具段落，改为中文。
 *
 * 机制：`systemPrompt.section()` 允许**同名的 scope 内段落遮蔽全局段落**
 * （"A scoped section shadows a global section with the same name"）。本插件
 * 随 `standard-zh` 预设挂载，因此只影响选了这个预设的 agent，不改动宿主组合。
 *
 * 不覆盖：工具说明（`TOOL_*`）、用户内容（AGENTS.md / persona suffix）、以及
 * 运行期 context（`working-directory:current` 由宿主 waterfall 在 next() 之后
 * 重写，无法从 scope 覆盖）。
 */

/** Cordis 插件名。 */
export const name = 'zh-prompt';

/** 需要 `systemPrompt` 注册表。 */
export const inject = ['systemPrompt'];

/** 中文段落：section 名 → [排序名, 文本]。 */
const SECTIONS = [
    [
        'harness:identity',
        'HARNESS_IDENTITY',
        '你是一个由 DeepSeek Harness 驱动的 AI 智能体。',
    ],
    [
        'harness:source',
        'HARNESS_SOURCE',
        '运行环境上下文会给出 DeepSeek Harness 实现所在的 checkout 位置。'
        + 'checkout 位置与当前工作目录是两个不同的值，两者可能不一致；'
        + '绝不要根据 checkout 路径推断工作目录。请用 pwd 确定当前工作目录。'
        + '只在需要检视或扩展 DSH 本体时才使用这个 checkout。',
    ],
    [
        'app:web-surface',
        'WEB_SURFACE',
        '你正通过 DeepSeek Harness Web GUI 与用户交互，该 GUI 的 URL 由运行环境上下文给出。'
        + '当用户提到「这个页面」「这个 GUI」或「这个应用」而没有指明其他对象时，指的就是这个 GUI。'
        + '浏览器不会提供隐式的 DOM、路由或截图上下文。'
        + '客户端插件的 HMR 接收器已启用，但只有在同一个 checkout 上同时运行 `pnpm run dev:web` '
        + '重建其 bundle 时，客户端插件的改动才会无需刷新页面即生效；'
        + '请先确认该 watcher 正在运行，再承诺自动更新。'
        + '其他所有改动——apps/web 外壳与普通包——都需要重新构建受影响的 Web 产物，'
        + '并在刷新页面后验证当前这个 URL。启动另一个服务器不会更新这个 GUI。'
        + 'apps/web 的 Vite 入口只构建外壳，不是独立应用，因为 window.__DSH_BOOT__ 只由 dsh web 注入。'
        + '除非用户明确要求，不要启动替代服务器；确有必要时，使用受管的后台任务并验证其准确的 URL。',
    ],
];

/**
 * 在挂载作用域内注册同名中文段落，遮蔽部署级英文段落。
 * @param ctx - 预设作用域上下文。
 */
export function apply(ctx) {
    for (const [section, order, text] of SECTIONS) {
        ctx.effect(
            () => ctx.systemPrompt.section({
                name: section,
                order: ctx.systemPrompt.getSectionOrder(order),
                interpolate: false,
                text,
            }),
            `zh-prompt.section(${section})`,
        );
    }
}
