import { useRef, useState } from 'react';
import * as Y from 'yjs';
import { WebsocketProvider } from 'y-websocket';
import { MonacoBinding } from 'y-monaco';
import * as monaco from 'monaco-editor';
import Editor, { BeforeMount, OnMount } from '@monaco-editor/react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Command, CommandInput, CommandList, CommandEmpty, CommandGroup, CommandItem } from "@/components/ui/command";
import { ChevronsUpDown, Check, Palette, Code } from 'lucide-react';
import { loadThemes, themes } from './themes/theme-loader';
import { langs } from './lang-loader';

export default function CodeEditor() {
    const editorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);

    const handleEditorWillMount: BeforeMount = async (monacoInstance) => {
        monacoInstance.languages.typescript.typescriptDefaults.setDiagnosticsOptions({
            noSemanticValidation: true,
            noSyntaxValidation: true
        });

        monacoInstance.languages.typescript.typescriptDefaults.setCompilerOptions({
            tsx: 'react'
        });

        await loadThemes(monacoInstance);
    }

    const handleEditorDidMount: OnMount = (editor, monacoInstance) => {
        editorRef.current = editor;

        const doc = new Y.Doc();
        const provider = new WebsocketProvider('ws://collab-service/code-collab', 'id', doc);
        const type = doc.getText('monaco');
        type.insert(0, "// Start coding here");

        const binding = new MonacoBinding(type, editor.getModel()!, new Set([editor]), provider.awareness);

        return () => {
            provider.disconnect();
            binding.destroy();
        };
    };

    const [themeOpen, setThemeOpen] = useState(false)
    const [theme, setTheme] = useState("vs-dark")
    function themeCombobox() {
        return <Popover open={themeOpen} onOpenChange={setThemeOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={themeOpen}
                    size="sm"
                    className="w-[200px] justify-between text-black"
                >
                    {theme
                        ? themes.find((th) => th.value === theme)?.label
                        : "Editor theme"}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[200px] p-0">
                <Command>
                    <CommandInput placeholder="Search" />
                    <CommandList>
                        <CommandEmpty>No theme found.</CommandEmpty>
                        <CommandGroup>
                            {themes.map((th) => (
                                <CommandItem
                                    key={th.value}
                                    value={th.value}
                                    onSelect={(currentValue) => {
                                        setTheme(currentValue);
                                        monaco.editor.setTheme(currentValue);
                                        setThemeOpen(false);
                                    }}                                    
                                >
                                    <Check
                                        className={cn(
                                            "mr-2 h-4 w-4",
                                            theme === th.value ? "opacity-100" : "opacity-0"
                                        )} />
                                    {th.label}
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>;
    }

    const [langOpen, setLangOpen] = useState(false)
    const [lang, setLang] = useState("javascript")
    function langCombobox() {
        return <Popover open={langOpen} onOpenChange={setLangOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={langOpen}
                    size="sm"
                    className="w-[150px] justify-between text-black"
                >
                    {lang
                        ? langs.find((l) => l.value === lang)?.label
                        : "Language"}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[150px] p-0">
                <Command>
                    <CommandInput placeholder="Search" />
                    <CommandList>
                        <CommandEmpty>No language found.</CommandEmpty>
                        <CommandGroup>
                            {langs.map((l) => (
                                <CommandItem
                                    key={l.value}
                                    value={l.value}
                                    onSelect={(currentValue) => {
                                        monaco.editor.setModelLanguage(editorRef.current!.getModel()!, currentValue);
                                        setLang(currentValue);
                                        setLangOpen(false);
                                    }}                                    
                                >
                                    <Check
                                        className={cn(
                                            "mr-2 h-4 w-4",
                                            lang === l.value ? "opacity-100" : "opacity-0"
                                        )} />
                                    {l.label}
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>;
    }

    return (
        <div className="flex flex-col gap-2 h-full">
            <div className="flex justify-end mr-8 gap-8">
                <div className="flex items-center gap-2">
                    <Code className="size-4 text-muted-foreground" />
                    {langCombobox()} 
                </div>
                <div className="flex items-center gap-2">
                    <Palette className="size-4 text-muted-foreground" />
                    {themeCombobox()}
                </div>
            </div>
            <Editor
                defaultLanguage="javascript"
                beforeMount={handleEditorWillMount}
                onMount={handleEditorDidMount}
                theme={theme}
                options={{
                    fontSize: 13,
                    fontFamily: 'monospace',
                    bracketPairColorization: {
                        enabled: true
                    },
                    formatOnPaste: true,
                    suggest: {
                        showFields: true,
                        showFunctions: true,
                        showVariables: true,
                        showWords: true,
                        showMethods: true,
                    },
                    minimap: { enabled: true },
                    renderLineHighlight: 'all',
                    rulers: [80, 120],
                    folding: true,
                    scrollbar: {
                        verticalScrollbarSize: 17,
                        horizontalScrollbarSize: 17,
                        alwaysConsumeMouseWheel: false,
                    },
                    // model: monaco.editor.createModel(ytext.toString(), language),
                }}
            />
        </div>
    );
}
