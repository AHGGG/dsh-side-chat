import { z } from 'zod';
export declare const modelSelectionSchema: z.ZodObject<{
    provider: z.ZodString;
    model: z.ZodString;
    reasoningEffort: z.ZodOptional<z.ZodString>;
}, z.core.$strict>;
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
        context_unavailable: "context_unavailable";
        context_too_large: "context_too_large";
        side_chat_already_open: "side_chat_already_open";
        side_chat_not_found: "side_chat_not_found";
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
export declare const createRequestSchema: z.ZodObject<{
    parentSessionId: z.ZodString;
    atSeq: z.ZodNumber;
    selectedText: z.ZodOptional<z.ZodString>;
    modelSelection: z.ZodOptional<z.ZodObject<{
        provider: z.ZodString;
        model: z.ZodString;
        reasoningEffort: z.ZodOptional<z.ZodString>;
    }, z.core.$strict>>;
}, z.core.$strict>;
export declare const chatRequestSchema: z.ZodObject<{
    chatId: z.ZodString;
}, z.core.$strict>;
export declare const selectModelRequestSchema: z.ZodObject<{
    chatId: z.ZodString;
    provider: z.ZodString;
    model: z.ZodString;
    reasoningEffort: z.ZodOptional<z.ZodString>;
}, z.core.$strict>;
export declare const sendRequestSchema: z.ZodObject<{
    chatId: z.ZodString;
    requestId: z.ZodString;
    text: z.ZodString;
}, z.core.$strict>;
export declare const createResultSchema: z.ZodDiscriminatedUnion<[z.ZodObject<{
    ok: z.ZodLiteral<true>;
    value: z.ZodObject<{
        parentSessionId: z.ZodString;
        chatId: z.ZodString;
        boundarySeq: z.ZodNumber;
        modelSelection: z.ZodObject<{
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
            context_unavailable: "context_unavailable";
            context_too_large: "context_too_large";
            side_chat_already_open: "side_chat_already_open";
            side_chat_not_found: "side_chat_not_found";
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
export declare const selectModelResultSchema: z.ZodDiscriminatedUnion<[z.ZodObject<{
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
            context_unavailable: "context_unavailable";
            context_too_large: "context_too_large";
            side_chat_already_open: "side_chat_already_open";
            side_chat_not_found: "side_chat_not_found";
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
export declare const closeResultSchema: z.ZodDiscriminatedUnion<[z.ZodObject<{
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
            context_unavailable: "context_unavailable";
            context_too_large: "context_too_large";
            side_chat_already_open: "side_chat_already_open";
            side_chat_not_found: "side_chat_not_found";
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
export declare const cancelResultSchema: z.ZodDiscriminatedUnion<[z.ZodObject<{
    ok: z.ZodLiteral<true>;
    value: z.ZodObject<{
        cancelled: z.ZodLiteral<true>;
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
            context_unavailable: "context_unavailable";
            context_too_large: "context_too_large";
            side_chat_already_open: "side_chat_already_open";
            side_chat_not_found: "side_chat_not_found";
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
export declare const streamEventSchema: z.ZodDiscriminatedUnion<[z.ZodObject<{
    type: z.ZodLiteral<"started">;
    requestId: z.ZodString;
    modelSelection: z.ZodObject<{
        provider: z.ZodString;
        model: z.ZodString;
        reasoningEffort: z.ZodOptional<z.ZodString>;
    }, z.core.$strict>;
}, z.core.$strict>, z.ZodObject<{
    type: z.ZodLiteral<"content">;
    text: z.ZodString;
    reasoning: z.ZodString;
}, z.core.$strict>, z.ZodObject<{
    type: z.ZodLiteral<"finished">;
    status: z.ZodEnum<{
        complete: "complete";
        stopped: "stopped";
    }>;
}, z.core.$strict>, z.ZodObject<{
    type: z.ZodLiteral<"error">;
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
            context_unavailable: "context_unavailable";
            context_too_large: "context_too_large";
            side_chat_already_open: "side_chat_already_open";
            side_chat_not_found: "side_chat_not_found";
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
}, z.core.$strict>], "type">;
