<!-- src/lib/components/Editor.svelte -->

<script>
  import { onMount } from 'svelte';
  import { EditorView, basicSetup } from 'codemirror';
  import { markdown } from '@codemirror/lang-markdown';
  import type { Note } from '../types';

  let { note, onSave } = $props();

  let editorContainer;
  let view = $state(null);
  let currentContent = $state(note.content);

  onMount(() => {
    const extensions = [
      basicSetup,
      markdown(),
      EditorView.updateListener.of((update) => {
        if (update.docChanged) {
          const newContent = update.state.doc.toString();
          currentContent = newContent;
          // Debounced via parent
          onSave(newContent);
        }
      })
    ];

    view = new EditorView({
      doc: note.content,
      extensions,
      parent: editorContainer
    });

    return () => {
      view?.destroy();
    };
  });

  $effect(() => {
    if (view && note.id) {
      // Note switched: update editor doc without losing cursor if content is different
      const docContent = view.state.doc.toString();
      if (docContent !== note.content) {
        view.dispatch({
          changes: {
            from: 0,
            to: docContent.length,
            insert: note.content
          }
        });
      }
    }
  });
</script>

<div bind:this={editorContainer} class="editor"></div>

<style>
  .editor {
    flex: 1;
    overflow: auto;
    font-family: 'Menlo', 'Monaco', monospace;
    font-size: 14px;
  }

  :global(.cm-editor) {
    height: 100%;
  }
</style>
