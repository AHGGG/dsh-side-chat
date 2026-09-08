import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useRef, useState } from 'react';
/** Selected passage displayed separately from the user's first question. */
export function SelectionQuote({ selections, messages, onRemove, }) {
    const [expanded, setExpanded] = useState(false);
    const [hovered, setHovered] = useState(false);
    const quoteRef = useRef(null);
    const detailsRef = useRef(null);
    const leaveTimerRef = useRef();
    const keepHoverOpen = () => {
        if (leaveTimerRef.current !== undefined)
            window.clearTimeout(leaveTimerRef.current);
        leaveTimerRef.current = undefined;
        setHovered(true);
    };
    const closeHoverAfterGrace = () => {
        if (leaveTimerRef.current !== undefined)
            window.clearTimeout(leaveTimerRef.current);
        leaveTimerRef.current = window.setTimeout(() => {
            leaveTimerRef.current = undefined;
            setHovered(false);
        }, 220);
    };
    useEffect(() => () => {
        if (leaveTimerRef.current !== undefined)
            window.clearTimeout(leaveTimerRef.current);
    }, []);
    useEffect(() => {
        if (!expanded)
            return;
        const dismissOutside = (event) => {
            const quote = quoteRef.current;
            const target = event.target;
            if (quote !== null && target instanceof Node && quote.contains(target))
                return;
            if (leaveTimerRef.current !== undefined)
                window.clearTimeout(leaveTimerRef.current);
            leaveTimerRef.current = undefined;
            setHovered(false);
            setExpanded(false);
        };
        document.addEventListener('mousedown', dismissOutside, true);
        return () => { document.removeEventListener('mousedown', dismissOutside, true); };
    }, [expanded]);
    const constrainDetailsToBoundary = () => {
        const details = detailsRef.current;
        const boundary = quoteRef.current?.closest('.dsh-side-chat-panel, [data-composer-seat], [data-chat-flow-kind]');
        if (details === null)
            return;
        details.style.setProperty('--dsh-side-chat-quote-offset-x', '0px');
        const detailsRect = details.getBoundingClientRect();
        const boundaryRect = boundary?.getBoundingClientRect();
        const leftEdge = (boundaryRect?.left ?? 0) + 16;
        const rightEdge = (boundaryRect?.right ?? window.innerWidth) - 16;
        const offset = detailsRect.left < leftEdge
            ? leftEdge - detailsRect.left
            : detailsRect.right > rightEdge ? rightEdge - detailsRect.right : 0;
        details.style.setProperty('--dsh-side-chat-quote-offset-x', `${String(offset)}px`);
    };
    return (_jsxs("section", { ref: quoteRef, className: "dsh-side-chat-quote", "aria-label": messages.selectedPassage, "data-expanded": expanded || undefined, "data-hovered": hovered || undefined, onMouseEnter: () => {
            keepHoverOpen();
            constrainDetailsToBoundary();
        }, onMouseLeave: closeHoverAfterGrace, onFocusCapture: constrainDetailsToBoundary, children: [_jsxs("div", { className: "dsh-side-chat-quote-chip", children: [_jsxs("button", { type: "button", className: "dsh-side-chat-quote-trigger", "aria-expanded": expanded, "aria-label": `${expanded ? messages.collapse : messages.expand}: ${messages.selectedPassage}`, onClick: () => {
                            if (expanded) {
                                if (leaveTimerRef.current !== undefined)
                                    window.clearTimeout(leaveTimerRef.current);
                                leaveTimerRef.current = undefined;
                                setHovered(false);
                            }
                            setExpanded(value => !value);
                        }, children: [_jsxs("svg", { className: "dsh-side-chat-quote-icon", viewBox: "0 0 24 24", "aria-hidden": "true", children: [_jsx("path", { d: "M21 15a4 4 0 0 1-4 4H7l-4 4V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4Z" }), _jsx("path", { d: "M8 8h8M8 12h5" })] }), _jsx("strong", { children: messages.selectionAttachments(selections.length) })] }), onRemove !== undefined && (_jsx("button", { type: "button", className: "dsh-side-chat-quote-remove", "aria-label": messages.removeSelection, onClick: onRemove, children: "\u00D7" }))] }), _jsx("div", { ref: detailsRef, className: "dsh-side-chat-quote-details", role: "tooltip", children: selections.map((selection, index) => (_jsxs("div", { className: "dsh-side-chat-quote-detail", children: [_jsx("div", { className: "dsh-side-chat-quote-details-header", children: _jsxs("strong", { children: [String(index + 1), ". ", messages.selectionPreviewLabel, ":"] }) }), _jsx("pre", { children: selection.text }), selection.comment !== undefined && (_jsxs("div", { className: "dsh-side-chat-quote-comment", children: [_jsxs("strong", { children: [messages.selectionCommentLabel, ":"] }), _jsx("pre", { children: selection.comment })] }))] }, `${String(index)}-${selection.text}`))) })] }));
}
