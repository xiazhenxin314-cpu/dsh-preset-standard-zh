/**
 * `zh-directives` — 两条固定工作约定：
 *
 * 1. 一条「DeepSeek」基调，放在系统提示**最前面**（order 远低于 harness identity）。
 * 2. 一条每轮开工提醒，通过 `agent/pre-step` 追加到用户消息之后，只在该轮第一步注入，
 *    避免每步重复导致上下文膨胀。
 *
 * 只在本预设作用域生效；不改工具、不改其他段落。
 */

import { randomUUID } from 'node:crypto';

/** Cordis 插件名。 */
export const name = 'zh-directives';

/** 需要提示装配服务。 */
export const inject = ['systemPrompt'];

/** 保证排在最前的排序值。 */
const EARLIEST = -1000000;

/** 系统提示最前面的基调。 */
const BASELINE = '我们是 DeepSeek，不要吝惜真实 API 测试。We are DeepSeek — do not ration real-API tests.';

/** 每轮开工提醒。 */
const WORKING = '仔细考量工作需求，理清范畴后再进入工作；使用中文思考、回复。'
    + '回复时，保证信息完整性，尝试尽可能解释清楚自己的工作成果。';

/**
 * 深冻结一个消息对象，保持与 `createMessage` 相同的不可变语义。
 * @param value - 要冻结的值。
 * @returns 同一个值。
 */
function deepFreeze(value) {
    if (value !== null && typeof value === 'object') {
        for (const child of Object.values(value)) deepFreeze(child);
        Object.freeze(value);
    }
    return value;
}

/**
 * 构造一条注入用用户消息（对应 `dsh-llm` 的 `createUserMessage` 契约）。
 * @param text - 消息文本。
 * @returns 冻结后的 user 消息。
 */
function directiveMessage(text) {
    return deepFreeze({
        id: randomUUID(),
        role: 'user',
        content: [{ type: 'text', text }],
        source: { kind: 'zh-directive', form: 'instructions' },
    });
}

/**
 * 注册最前置段落与每轮开工提醒。
 * @param ctx - 预设作用域上下文。
 */
export function apply(ctx) {
    ctx.effect(() => ctx.systemPrompt.section({
        name: 'zh:directive:deepseek',
        order: EARLIEST,
        interpolate: false,
        text: BASELINE,
    }), 'zh-directives.section()');

    ctx.effect(() => ctx.on('agent/pre-step', async (payload, next) => {
        const decision = await next();
        if (decision.kind === 'reject') return decision;
        if (payload.step !== 1) return decision;
        return {
            ...decision,
            messages: [...decision.messages, directiveMessage(WORKING)],
        };
    }), 'zh-directives.preStep()');
}
