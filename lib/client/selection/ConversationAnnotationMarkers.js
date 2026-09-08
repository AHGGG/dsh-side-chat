import { jsx as _jsx } from "react/jsx-runtime";
import { useEffect, useRef, useState } from 'react';
import { restoreDomConversationSelection } from './selection-controller.js';
const ANNOTATION_HIGHLIGHT = 'dsh-side-chat-annotations';
const ACTIVE_ANNOTATION_HIGHLIGHT = 'dsh-side-chat-active-annotation';
function clamp(value, minimum, maximum) {
    return Math.min(Math.max(minimum, value), Math.max(minimum, maximum));
}
function boundsOf(rect) {
    const left = Number.isFinite(rect.left) ? rect.left : rect.x;
    const top = Number.isFinite(rect.top) ? rect.top : rect.y;
    const right = Number.isFinite(rect.right) ? rect.right : left + rect.width;
    const bottom = Number.isFinite(rect.bottom) ? rect.bottom : top + rect.height;
    return [left, top, right, bottom].every(Number.isFinite)
        ? { left, top, right, bottom }
        : undefined;
}
function rangeBounds(ranges) {
    const boxes = [];
    for (const range of ranges) {
        const clientRects = typeof range.getClientRects === 'function'
            ? [...range.getClientRects()]
            : [];
        const rects = clientRects.length > 0
            ? clientRects
            : typeof range.getBoundingClientRect === 'function'
                ? [range.getBoundingClientRect()]
                : [];
        for (const rect of rects) {
            const bounds = boundsOf(rect);
            if (bounds !== undefined
                && (bounds.right > bounds.left || bounds.bottom > bounds.top))
                boxes.push(bounds);
        }
    }
    if (boxes.length === 0)
        return;
    return {
        left: Math.min(...boxes.map(box => box.left)),
        top: Math.min(...boxes.map(box => box.top)),
        right: Math.max(...boxes.map(box => box.right)),
        bottom: Math.max(...boxes.map(box => box.bottom)),
    };
}
function selectionRect(bounds) {
    return {
        x: bounds.left,
        y: bounds.top,
        width: bounds.right - bounds.left,
        height: bounds.bottom - bounds.top,
        viewportWidth: window.innerWidth,
        viewportHeight: window.innerHeight,
    };
}
function visibleViewport(range) {
    let viewport = {
        left: 0,
        top: 0,
        right: window.innerWidth,
        bottom: window.innerHeight,
    };
    const start = range.startContainer;
    const element = start.nodeType === Node.ELEMENT_NODE ? start : start.parentElement;
    const scrollport = element?.closest('[data-conversation-scroll]');
    if (scrollport === null || scrollport === undefined)
        return viewport;
    const scrollBounds = boundsOf(scrollport.getBoundingClientRect());
    if (scrollBounds !== undefined
        && scrollBounds.right > scrollBounds.left
        && scrollBounds.bottom > scrollBounds.top) {
        viewport = {
            left: Math.max(viewport.left, scrollBounds.left),
            top: Math.max(viewport.top, scrollBounds.top),
            right: Math.min(viewport.right, scrollBounds.right),
            bottom: Math.min(viewport.bottom, scrollBounds.bottom),
        };
    }
    const composer = scrollport.querySelector('[data-composer-seat]');
    const composerBounds = composer === null ? undefined : boundsOf(composer.getBoundingClientRect());
    if (composerBounds !== undefined
        && composerBounds.right > composerBounds.left
        && composerBounds.bottom > composerBounds.top
        && composerBounds.bottom > viewport.top
        && composerBounds.top < viewport.bottom) {
        viewport = { ...viewport, bottom: Math.min(viewport.bottom, composerBounds.top) };
    }
    return viewport;
}
function intersects(bounds, viewport) {
    return bounds.right > viewport.left
        && bounds.bottom > viewport.top
        && bounds.left < viewport.right
        && bounds.top < viewport.bottom;
}
function markerPositionsEqual(previous, next) {
    return previous.length === next.length && previous.every((position, index) => {
        const candidate = next[index];
        return candidate !== undefined
            && candidate.annotationIndex === position.annotationIndex
            && candidate.left === position.left
            && candidate.top === position.top;
    });
}
function clearHighlights() {
    if (typeof CSS === 'undefined' || CSS.highlights === undefined)
        return;
    CSS.highlights.delete(ANNOTATION_HIGHLIGHT);
    CSS.highlights.delete(ACTIVE_ANNOTATION_HIGHLIGHT);
}
function publishHighlights(ranges, activeRanges) {
    if (typeof CSS === 'undefined'
        || CSS.highlights === undefined
        || typeof Highlight === 'undefined')
        return;
    CSS.highlights.set(ANNOTATION_HIGHLIGHT, new Highlight(...ranges));
    if (activeRanges.length === 0) {
        CSS.highlights.delete(ACTIVE_ANNOTATION_HIGHLIGHT);
        return;
    }
    const active = new Highlight(...activeRanges);
    active.priority = 1;
    CSS.highlights.set(ACTIVE_ANNOTATION_HIGHLIGHT, active);
}
function restoreBrowserSelection(range) {
    const browserSelection = window.getSelection();
    if (browserSelection === null)
        return;
    browserSelection.removeAllRanges();
    browserSelection.addRange(range);
}
/** Persistent source markers for unsent parent-composer annotations. */
export function ConversationAnnotationMarkers({ annotations, activeAnnotationIndex, onEdit, }) {
    const resolvedRef = useRef(new Map());
    const [positions, setPositions] = useState([]);
    useEffect(() => {
        if (annotations.length === 0) {
            resolvedRef.current.clear();
            setPositions(previous => previous.length === 0 ? previous : []);
            clearHighlights();
            return;
        }
        let animationFrame;
        let observedConversationRoot = null;
        let resizeObserver;
        const refresh = () => {
            animationFrame = undefined;
            const conversationRoot = document.querySelector('[data-chat-flow]');
            if (conversationRoot !== observedConversationRoot) {
                resizeObserver?.disconnect();
                observedConversationRoot = conversationRoot;
                if (conversationRoot !== null)
                    resizeObserver?.observe(conversationRoot);
            }
            const resolved = new Map();
            const nextPositions = [];
            const highlightRanges = [];
            const activeRanges = [];
            if (conversationRoot !== null) {
                for (const annotation of annotations) {
                    const restored = restoreDomConversationSelection({
                        selection: annotation.selection,
                        conversationRoot,
                    });
                    if (restored === undefined)
                        continue;
                    highlightRanges.push(...restored.ranges);
                    if (annotation.annotationIndex === activeAnnotationIndex) {
                        activeRanges.push(...restored.ranges);
                    }
                    const bounds = rangeBounds(restored.ranges);
                    const viewport = visibleViewport(restored.browserRange);
                    if (bounds === undefined || !intersects(bounds, viewport))
                        continue;
                    const rect = selectionRect(bounds);
                    resolved.set(annotation.annotationIndex, {
                        browserRange: restored.browserRange,
                        rect,
                    });
                    nextPositions.push({
                        annotationIndex: annotation.annotationIndex,
                        left: clamp(bounds.right + 3, viewport.left + 4, viewport.right - 26),
                        top: clamp(bounds.top - 12, viewport.top + 4, viewport.bottom - 26),
                    });
                }
            }
            resolvedRef.current = resolved;
            setPositions(previous => markerPositionsEqual(previous, nextPositions) ? previous : nextPositions);
            publishHighlights(highlightRanges, activeRanges);
        };
        const scheduleRefresh = () => {
            if (animationFrame !== undefined)
                return;
            animationFrame = window.requestAnimationFrame(refresh);
        };
        resizeObserver = typeof ResizeObserver === 'undefined'
            ? undefined
            : new ResizeObserver(scheduleRefresh);
        refresh();
        const mutationObserver = new MutationObserver(scheduleRefresh);
        mutationObserver.observe(document.body, {
            childList: true,
            characterData: true,
            subtree: true,
        });
        document.addEventListener('scroll', scheduleRefresh, true);
        window.addEventListener('resize', scheduleRefresh);
        return () => {
            if (animationFrame !== undefined)
                window.cancelAnimationFrame(animationFrame);
            mutationObserver?.disconnect();
            resizeObserver?.disconnect();
            document.removeEventListener('scroll', scheduleRefresh, true);
            window.removeEventListener('resize', scheduleRefresh);
            clearHighlights();
        };
    }, [activeAnnotationIndex, annotations]);
    return positions.map((position) => {
        const annotation = annotations.find(candidate => candidate.annotationIndex === position.annotationIndex);
        if (annotation === undefined)
            return null;
        const style = { left: position.left, top: position.top };
        const number = annotation.annotationIndex + 1;
        const badge = number > 99 ? '99+' : String(number);
        const activate = () => {
            const resolved = resolvedRef.current.get(annotation.annotationIndex);
            if (resolved === undefined)
                return;
            restoreBrowserSelection(resolved.browserRange);
            onEdit(annotation, { ...annotation.selection, rect: resolved.rect });
            // The editor focuses its textarea after this click. Re-apply the document
            // range on the next frame so browsers without Custom Highlight support
            // still retain their native inactive-selection paint.
            window.requestAnimationFrame(() => { restoreBrowserSelection(resolved.browserRange); });
        };
        return (_jsx("button", { type: "button", className: "dsh-side-chat-annotation-marker", style: style, "data-active": annotation.annotationIndex === activeAnnotationIndex || undefined, "data-large": number > 99 || undefined, "aria-label": `Edit annotation ${String(number)}`, title: `Edit annotation ${String(number)}`, onMouseDown: (event) => {
                event.preventDefault();
                event.stopPropagation();
            }, onClick: activate, children: badge }, `${annotation.selection.parentSessionId}:${annotation.selection.fragments[0]?.nodeKey ?? ''}:${String(annotation.annotationIndex)}`));
    });
}
