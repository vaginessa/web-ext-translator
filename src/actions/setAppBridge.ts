/**
 * License: zlib/libpng
 * @author Santo Pfingsten
 * @see https://github.com/Lusito/web-ext-translator
 */

import { State } from "../shared";
import { WetAppBridge, MessagesFile } from "../wetInterfaces";
import { parseMessagesFile } from "../utils/parseMessagesFile";
import { normalizeLanguages } from "../utils/normalizeLanguages";
import store from "../store";
import { serializeMessages } from "../utils/exportToZip";
import { parseJsonFile } from "../utils/parseJsonFile";
import { createAlertDialog } from "../components/Dialogs/AlertDialog";

export interface WetActionSetAppBridge {
    type: "SET_APP_BRIDGE";
    payload: WetAppBridge;
}

export function loadFromAppBridge(bridge: WetAppBridge, showFolderDialog: boolean) {
    if (!showFolderDialog || bridge.openDirectory()) {
        const result = bridge.loadMessagesList();
        if (!result.error && result.files && result.manifest) {
            try {
                const manifest = parseJsonFile("manifest.json", result.manifest) as any;
                const languages = result.files.map((file) => parseMessagesFile(file.locale.replace("_", "-"), file.content));
                const mainLanguage = languages.find((r) => r.locale === manifest.default_locale) || null;
                if (mainLanguage) {
                    normalizeLanguages(languages, mainLanguage);
                    store.dispatch({ type: "LOAD", payload: { languages, mainLanguage } });
                }
            } catch (e) {
                console.error("error loading files: ", e);
                store.dispatch({ type: "SHOW_DIALOG", payload: createAlertDialog("Something went wrong!", `Failed to load folder. Reason: ${e.message}`) });
            }
        }
    }
}

export function saveToAppBridge(appBridge: WetAppBridge) {
    const extension = store.getState().extension;
    if (extension) {
        const list: MessagesFile[] = [];
        for (const key in extension.languages) {
            const lang = extension.languages[key];
            list.push({ locale: lang.locale.replace("-", "_"), content: serializeMessages(lang, extension.mainLanguage) });
        }
        appBridge.saveMessagesList(list);
    }
}

export function handleSetAppBridge(state: State, payload: WetAppBridge): State {
    setTimeout(() => loadFromAppBridge(payload, false), 10);
    return { ...state, appBridge: payload };
}
