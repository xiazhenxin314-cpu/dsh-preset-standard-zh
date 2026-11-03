/**
 * `zh-tools` — 把 standard 预设默认工具的说明与参数说明换成中文。
 *
 * 机制：`system-prompt/assemble` 的 waterfall 返回的 assembly 是权威值，
 * agent loop 用 `assembly.tools` 构造请求，所以在这里改 `description`
 * 只影响模型看到的文本；工具名、参数名、枚举值与执行路径都不动。
 *
 * 只翻译 `zh-tools-data.js` 里列出的工具；其余（subagent/workflow/schedule/
 * MCP 等长尾）保持英文原文。
 */

import { TOOLS } from './zh-tools-data.js';

/** Cordis 插件名。 */
export const name = 'zh-tools';

/** 需要提示装配服务。 */
export const inject = ['systemPrompt'];

/**
 * 按 schema 路径替换 description。
 * 路径规则：顶层参数=参数名，数组元素追加 `[]`，嵌套对象用 `.` 连接。
 * @param node - 当前 schema 节点。
 * @param path - 当前节点的路径。
 * @param table - 路径 → 中文。
 */
function translateSchema(node, path, table) {
    if (node === null || typeof node !== 'object') return;
    if (Array.isArray(node)) {
        for (const item of node) translateSchema(item, `${path}[]`, table);
        return;
    }
    const replacement = table[path];
    if (typeof replacement === 'string' && typeof node.description === 'string') {
        node.description = replacement;
    }
    if (node.properties !== null && typeof node.properties === 'object') {
        for (const [key, child] of Object.entries(node.properties)) {
            translateSchema(child, path === '' ? key : `${path}.${key}`, table);
        }
    }
    if (node.items !== null && typeof node.items === 'object') {
        translateSchema(node.items, `${path}[]`, table);
    }
}

/**
 * 注册装配 waterfall，改写本次装配里已列出的工具说明。
 * @param ctx - 预设作用域上下文。
 */
export function apply(ctx) {
    ctx.effect(() => ctx.on('system-prompt/assemble', async (assembly, _context, next) => {
        const resolved = await next();
        for (const tool of resolved.tools ?? []) {
            const table = TOOLS[tool.name];
            if (table === undefined) continue;
            if (typeof table.description === 'string' && typeof tool.description === 'string') {
                tool.description = table.description;
            }
            if (table.parameters !== undefined && tool.parameters !== undefined) {
                translateSchema(tool.parameters, '', table.parameters);
            }
        }
        return resolved;
    }), 'zh-tools.assemble()');
}
