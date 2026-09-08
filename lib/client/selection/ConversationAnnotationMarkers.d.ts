import type { ConversationSelection } from '../../shared/contracts.js';
import type { ConversationSelectionAnnotation } from '../parent-composer/add-to-conversation.js';
/** Persistent source markers for unsent parent-composer annotations. */
export declare function ConversationAnnotationMarkers({ annotations, activeAnnotationIndex, onEdit, }: {
    readonly annotations: readonly ConversationSelectionAnnotation[];
    readonly activeAnnotationIndex?: number;
    readonly onEdit: (annotation: ConversationSelectionAnnotation, selection: ConversationSelection) => void;
}): (import("react/jsx-runtime").JSX.Element | null)[];
