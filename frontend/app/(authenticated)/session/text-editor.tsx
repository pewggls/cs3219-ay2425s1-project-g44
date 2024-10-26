import { useState, useEffect } from 'react'
import { Content } from '@tiptap/react'
import { MinimalTiptapEditor } from '@/components/minimal-tiptap/minimal-tiptap'
import * as Y from 'yjs'
import { WebsocketProvider } from 'y-websocket'
import Collaboration from '@tiptap/extension-collaboration'
import CollaborationCursor from '@tiptap/extension-collaboration-cursor'
import { TooltipProvider } from '@radix-ui/react-tooltip'

export default function TextEditor() {
    const [value, setValue] = useState<Content>('')
    const [doc, setDoc] = useState<Y.Doc | null>(null)
    const [provider, setProvider] = useState<WebsocketProvider | null>(null)

    // useEffect(() => {
    //     const yDoc = new Y.Doc()
    //     const wsProvider = new WebsocketProvider('ws://your-backend-url/text-collab', 'room-id', yDoc)
    //     setDoc(yDoc)
    //     setProvider(wsProvider)

    //     return () => {
    //         wsProvider.disconnect()
    //     }
    // }, [])

    // const collaborationExtensions = [
    //     Collaboration.configure({
    //         document: doc,
    //     }),
    //     CollaborationCursor.configure({
    //         provider: provider,
    //         user: { name: 'User Name', color: '#f783ac' },
    //     }),
    // ]

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
                // extensions={collaborationExtensions}
            />
        </TooltipProvider>
    )
}
