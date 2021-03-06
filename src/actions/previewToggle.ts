/**
 * License: zlib/libpng
 * @author Santo Pfingsten
 * @see https://github.com/Lusito/web-ext-translator
 */

import { State } from "../shared";
import { adjustAllHeights } from "../utils/adjustHeights";

export interface WetActionPreviewToggle {
    type: "PREVIEW_TOGGLE";
    payload: null;
}

export function handlePreviewToggle(state: State, payload: null): State {
    adjustAllHeights();
    return { ...state, previewVisible: !state.previewVisible };
}
