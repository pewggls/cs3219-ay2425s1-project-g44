import { useEffect, useState } from 'react'
import { Content } from '@tiptap/react'
import { MinimalTiptapEditor } from '@/components/minimal-tiptap/minimal-tiptap'
import { TooltipProvider } from '@radix-ui/react-tooltip'
import * as Y from 'yjs';
import Collaboration from '@tiptap/extension-collaboration'
import CollaborationCursor from '@tiptap/extension-collaboration-cursor'
import { getUsername } from '@/app/utils/cookie-manager';
import { HocuspocusProvider } from '@hocuspocus/provider';

interface TextEditorProps {
    sessionId: string;
}

export default function TextEditor({ sessionId }: TextEditorProps) {
    const [value, setValue] = useState<Content>('')
    const [collaborationExtensions, setCollaborationExtensions] = useState<any[]>([]);

    useEffect(() => {
        // Create a new Y.js document
        const ydoc = new Y.Doc()

        const provider = new HocuspocusProvider({
            url: process.env.NEXT_PUBLIC_COLLAB_API_URL || 'ws://localhost:3003',
            name: `text-${sessionId}`,
            document: ydoc
        })

        // Set up awareness for cursor information
        const awareness = provider.awareness!
        awareness.setLocalStateField('user', {
            name: getUsername(),
            color: '#' + Math.floor(Math.random()*16777215).toString(16)
        })

        const collaborationExtensions = [
            Collaboration.configure({
                document: ydoc,
            }),
            CollaborationCursor.configure({
                provider: provider,
                user: { name: getUsername(), color: '#f783ac' },
            }),
        ]

        setCollaborationExtensions(collaborationExtensions);

        return () => {
            provider.disconnect()
        }
    }, [sessionId])


    return (
        <TooltipProvider>
            <MinimalTiptapEditor
                value={value}
                onChange={setValue}
                className="w-full text-black"
                editorContentClassName="p-5"
                output="html"
                placeholder="Type your notes here..."
                autofocus={false}
                editable={true}
                editorClassName="focus:outline-none"
                immediatelyRender={false}
                extensions={collaborationExtensions}
            />
        </TooltipProvider>
    )
}
