import { useRef } from 'react';
import * as Y from 'yjs';
import { WebsocketProvider } from 'y-websocket';
import { MonacoBinding } from 'y-monaco';
import * as monaco from 'monaco-editor';
import Editor, { OnMount } from '@monaco-editor/react';

export default function CodeEditor() {
    const editorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);

    const handleEditorDidMount: OnMount = (editor, monacoInstance) => {
        editorRef.current = editor;

        const doc = new Y.Doc();
        const provider = new WebsocketProvider('ws://collab-service/code-collab', 'id', doc);
        const type = doc.getText('monaco');

        const binding = new MonacoBinding(type, editor.getModel()!, new Set([editor]), provider.awareness);

        return () => {
            provider.disconnect();
            binding.destroy();
        };
    };

    return (
        <Editor
            defaultLanguage="javascript"
            defaultValue="// Start coding here"
            onMount={handleEditorDidMount}
        />
    );
}
