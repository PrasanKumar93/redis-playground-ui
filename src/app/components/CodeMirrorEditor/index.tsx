import './index.css';

import React, { useRef, useEffect, useImperativeHandle, useState } from 'react';
import { EditorView, basicSetup } from 'codemirror';
import { EditorState } from '@codemirror/state';
import { javascript } from '@codemirror/lang-javascript';
import { StreamLanguage } from '@codemirror/language';
import { shell as shellMode } from '@codemirror/legacy-modes/mode/shell';
import { oneDark } from '@codemirror/theme-one-dark';


import { redisSyntaxSupport } from './redis-syntax-support';

enum CodeMirrorMode {
    javascript = 'javascript',
    shell = 'shell',
    redis = 'redis'
}

interface CodeMirrorEditorProps {
    initialValue?: string;
    className?: string;
    tabIndex?: number;
    onBlur?: (code: string) => void;
    disabled?: boolean;
    mode?: CodeMirrorMode;
}


const CodeMirrorEditor = React.forwardRef<EditorView | null, CodeMirrorEditorProps>(
    ({
        initialValue = '',
        className = '',
        tabIndex = 99,
        onBlur,
        disabled = false,
        mode = CodeMirrorMode.javascript
    }, ref) => {
        const editorContainerRef = useRef<HTMLDivElement>(null);
        const editorViewRef = useRef<EditorView | null>(null);

        const onEditorBlur = () => {
            if (onBlur) {
                const code = editorViewRef.current?.state.doc.toString() || '';
                onBlur(code);
            }
        };

        // Expose the editor view ref to the parent component
        //@ts-ignore
        useImperativeHandle(ref, () => editorViewRef.current, []);

        useEffect(() => {
            // Check if the editor container ref exists or the editor view is already initialized
            if (!editorContainerRef.current || editorViewRef.current) {
                return;
            }

            let modeElm: any = javascript(); // default mode
            if (mode === CodeMirrorMode.shell) {
                modeElm = StreamLanguage.define(shellMode);
            } else if (mode === CodeMirrorMode.redis) {
                modeElm = redisSyntaxSupport;
            }

            // Create a new editor state with initial value and extensions
            const state = EditorState.create({
                doc: initialValue,
                extensions: [
                    basicSetup,
                    modeElm,
                    oneDark,
                    EditorView.editable.of(!disabled), // editor read-only if disabled
                ],
            });

            // Create a new editor view with the state and parent container
            editorViewRef.current = new EditorView({
                state,
                parent: editorContainerRef.current,
            });

            // Update the ref for external access
            if (ref) {
                (ref as React.MutableRefObject<EditorView | null>).current = editorViewRef.current;
            }

            return () => {
                editorViewRef.current?.destroy();
                editorViewRef.current = null;
            };
            // eslint-disable-next-line react-hooks/exhaustive-deps
        }, [ref, disabled]);


        return (
            <div ref={editorContainerRef}
                className={`comp-code-mirror ${className}`}
                tabIndex={tabIndex}
                onBlur={onEditorBlur}
            />
        )

    }
);

CodeMirrorEditor.displayName = 'CodeMirrorEditor';

export default React.memo(CodeMirrorEditor);

export { CodeMirrorMode };


/**
 * Usage in the parent component
 
import CodeMirrorEditor from '../components/CodeMirrorEditor';

const evtBlur = (code: string) => {
    if (code) {
    }
}

<CodeMirrorEditor
    initialValue=""
    onBlur={evtBlur}

    className=""
    tabIndex={6}
/>    

----------------------------------------

* Usage in the parent component with ref access
 
import React, { useRef } from "react";
import { EditorView } from 'codemirror';

import CodeMirrorEditor from '../components/CodeMirrorEditor';


const editorRef = useRef<EditorView | null>(null);
// ref access to get the code at any time or for other operations
const codeByRef = editorRef?.current?.state?.doc.toString();


const evtBlur = async (code: string) => {
    
    if (code) {
    }
}

<CodeMirrorEditor
    ref={editorRef}

    initialValue=""
    onBlur={evtBlur}

    className=""
    tabIndex={6}
/>   


 */