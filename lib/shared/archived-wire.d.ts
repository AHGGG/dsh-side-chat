import { z } from 'zod';
export declare const sideChatWireErrorSchema: z.ZodObject<{
    code: z.ZodEnum<{
        selection_empty: "selection_empty";
        selection_outside_conversation: "selection_outside_conversation";
        selection_not_model_visible: "selection_not_model_visible";
        selection_too_large: "selection_too_large";
        selection_stale: "selection_stale";
        selection_crosses_unsupported_nodes: "selection_crosses_unsupported_nodes";
        parent_session_missing: "parent_session_missing";
        parent_session_not_ready: "parent_session_not_ready";
        fork_unavailable: "fork_unavailable";
        side_chat_already_open: "side_chat_already_open";
        side_chat_not_found: "side_chat_not_found";
        side_chat_open_failed: "side_chat_open_failed";
        side_chat_prompt_failed: "side_chat_prompt_failed";
        side_chat_model_failed: "side_chat_model_failed";
        side_chat_interrupt_failed: "side_chat_interrupt_failed";
        side_chat_destroy_failed: "side_chat_destroy_failed";
        transport_error: "transport_error";
        invalid_request: "invalid_request";
        internal_error: "internal_error";
    }>;
    message: z.ZodString;
    recoverable: z.ZodBoolean;
}, z.core.$strict>;
export declare const archivedCreateRequestSchema: z.ZodObject<{
    parentSessionId: z.ZodString;
    atSeq: z.ZodNumber;
    modelSelection: z.ZodOptional<z.ZodObject<{
        provider: z.ZodString;
        model: z.ZodString;
        reasoningEffort: z.ZodOptional<z.ZodString>;
    }, z.core.$strict>>;
}, z.core.$strict>;
export declare const archivedSelectModelRequestSchema: z.ZodObject<{
    childSessionId: z.ZodString;
    provider: z.ZodString;
    model: z.ZodString;
    reasoningEffort: z.ZodOptional<z.ZodString>;
}, z.core.$strict>;
export declare const archivedCloseRequestSchema: z.ZodObject<{
    childSessionId: z.ZodString;
}, z.core.$strict>;
export declare const archivedCreateResultSchema: z.ZodDiscriminatedUnion<[z.ZodObject<{
    ok: z.ZodLiteral<true>;
    value: z.ZodObject<{
        parentSessionId: z.ZodString;
        childSessionId: z.ZodString;
        boundarySeq: z.ZodNumber;
        inheritedThroughSeq: z.ZodNumber;
        modelSelection: z.ZodOptional<z.ZodObject<{
            provider: z.ZodString;
            model: z.ZodString;
            reasoningEffort: z.ZodOptional<z.ZodString>;
        }, z.core.$strict>>;
    }, z.core.$strict>;
}, z.core.$strict>, z.ZodObject<{
    ok: z.ZodLiteral<false>;
    error: z.ZodObject<{
        code: z.ZodEnum<{
            selection_empty: "selection_empty";
            selection_outside_conversation: "selection_outside_conversation";
            selection_not_model_visible: "selection_not_model_visible";
            selection_too_large: "selection_too_large";
            selection_stale: "selection_stale";
            selection_crosses_unsupported_nodes: "selection_crosses_unsupported_nodes";
            parent_session_missing: "parent_session_missing";
            parent_session_not_ready: "parent_session_not_ready";
            fork_unavailable: "fork_unavailable";
            side_chat_already_open: "side_chat_already_open";
            side_chat_not_found: "side_chat_not_found";
            side_chat_open_failed: "side_chat_open_failed";
            side_chat_prompt_failed: "side_chat_prompt_failed";
            side_chat_model_failed: "side_chat_model_failed";
            side_chat_interrupt_failed: "side_chat_interrupt_failed";
            side_chat_destroy_failed: "side_chat_destroy_failed";
            transport_error: "transport_error";
            invalid_request: "invalid_request";
            internal_error: "internal_error";
        }>;
        message: z.ZodString;
        recoverable: z.ZodBoolean;
    }, z.core.$strict>;
}, z.core.$strict>], "ok">;
export declare const archivedSelectModelResultSchema: z.ZodDiscriminatedUnion<[z.ZodObject<{
    ok: z.ZodLiteral<true>;
    value: z.ZodObject<{
        selected: z.ZodObject<{
            provider: z.ZodString;
            model: z.ZodString;
            reasoningEffort: z.ZodOptional<z.ZodString>;
        }, z.core.$strict>;
    }, z.core.$strict>;
}, z.core.$strict>, z.ZodObject<{
    ok: z.ZodLiteral<false>;
    error: z.ZodObject<{
        code: z.ZodEnum<{
            selection_empty: "selection_empty";
            selection_outside_conversation: "selection_outside_conversation";
            selection_not_model_visible: "selection_not_model_visible";
            selection_too_large: "selection_too_large";
            selection_stale: "selection_stale";
            selection_crosses_unsupported_nodes: "selection_crosses_unsupported_nodes";
            parent_session_missing: "parent_session_missing";
            parent_session_not_ready: "parent_session_not_ready";
            fork_unavailable: "fork_unavailable";
            side_chat_already_open: "side_chat_already_open";
            side_chat_not_found: "side_chat_not_found";
            side_chat_open_failed: "side_chat_open_failed";
            side_chat_prompt_failed: "side_chat_prompt_failed";
            side_chat_model_failed: "side_chat_model_failed";
            side_chat_interrupt_failed: "side_chat_interrupt_failed";
            side_chat_destroy_failed: "side_chat_destroy_failed";
            transport_error: "transport_error";
            invalid_request: "invalid_request";
            internal_error: "internal_error";
        }>;
        message: z.ZodString;
        recoverable: z.ZodBoolean;
    }, z.core.$strict>;
}, z.core.$strict>], "ok">;
export declare const archivedCloseResultSchema: z.ZodDiscriminatedUnion<[z.ZodObject<{
    ok: z.ZodLiteral<true>;
    value: z.ZodObject<{
        closed: z.ZodLiteral<true>;
    }, z.core.$strict>;
}, z.core.$strict>, z.ZodObject<{
    ok: z.ZodLiteral<false>;
    error: z.ZodObject<{
        code: z.ZodEnum<{
            selection_empty: "selection_empty";
            selection_outside_conversation: "selection_outside_conversation";
            selection_not_model_visible: "selection_not_model_visible";
            selection_too_large: "selection_too_large";
            selection_stale: "selection_stale";
            selection_crosses_unsupported_nodes: "selection_crosses_unsupported_nodes";
            parent_session_missing: "parent_session_missing";
            parent_session_not_ready: "parent_session_not_ready";
            fork_unavailable: "fork_unavailable";
            side_chat_already_open: "side_chat_already_open";
            side_chat_not_found: "side_chat_not_found";
            side_chat_open_failed: "side_chat_open_failed";
            side_chat_prompt_failed: "side_chat_prompt_failed";
            side_chat_model_failed: "side_chat_model_failed";
            side_chat_interrupt_failed: "side_chat_interrupt_failed";
            side_chat_destroy_failed: "side_chat_destroy_failed";
            transport_error: "transport_error";
            invalid_request: "invalid_request";
            internal_error: "internal_error";
        }>;
        message: z.ZodString;
        recoverable: z.ZodBoolean;
    }, z.core.$strict>;
}, z.core.$strict>], "ok">;
