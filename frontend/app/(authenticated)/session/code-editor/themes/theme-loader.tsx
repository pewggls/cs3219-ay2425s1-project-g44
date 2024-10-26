import * as monaco from 'monaco-editor';
import themeList from './theme-list.json';

export let themes: { value: string; label: string }[] = [
    { value: 'light', label: 'VS Light' },
    { value: 'vs-dark', label: 'VS Dark' },
    { value: 'hc-black', label: 'High Contrast' },
];

export async function loadThemes(monacoInstance: typeof monaco) {
    for (const themeGroup of themeList.themes) {
        for (const [key, label] of Object.entries(themeGroup)) {
            await import(`./${label}.json`).then(data => {
                monacoInstance.editor.defineTheme(key, data);
                themes.push({ value: key, label });
            });
        }
    }

    themes.sort((a, b) => a.label.localeCompare(b.label));
}
