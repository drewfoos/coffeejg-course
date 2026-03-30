"use client";

import * as React from "react";
import { useCallback, useRef, useEffect } from "react";
import type { Value } from "platejs";
import { KEYS, TrailingBlockPlugin, ExitBreakPlugin } from "platejs";
import { Plate, ParagraphPlugin, usePlateEditor } from "platejs/react";
import { DndPlugin } from "@platejs/dnd";
import { BlockSelectionPlugin } from "@platejs/selection/react";
import { SlashPlugin, SlashInputPlugin } from "@platejs/slash-command/react";
import { CodeBlockPlugin, CodeLinePlugin, CodeSyntaxPlugin } from "@platejs/code-block/react";
import { CalloutPlugin } from "@platejs/callout/react";
import { ColumnPlugin, ColumnItemPlugin } from "@platejs/layout/react";
import { LinkPlugin } from "@platejs/link/react";
import { IndentPlugin } from "@platejs/indent/react";
import { ListPlugin } from "@platejs/list/react";
import { ImagePlugin, VideoPlugin } from "@platejs/media/react";
import { TogglePlugin } from "@platejs/toggle/react";
import { TablePlugin, TableCellPlugin, TableRowPlugin } from "@platejs/table/react";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import {
  BoldPlugin,
  ItalicPlugin,
  UnderlinePlugin,
  StrikethroughPlugin,
  CodePlugin,
  H1Plugin,
  H2Plugin,
  H3Plugin,
  BlockquotePlugin,
  HorizontalRulePlugin,
} from "@platejs/basic-nodes/react";

import { Editor, EditorContainer } from "@/components/ui/editor";
import { FloatingToolbar } from "@/components/ui/floating-toolbar";
import { FixedToolbar } from "@/components/ui/fixed-toolbar";
import { MarkToolbarButton } from "@/components/ui/mark-toolbar-button";
import { ToolbarButton, ToolbarSeparator } from "@/components/ui/toolbar";
import { SlashInputElement } from "@/components/ui/slash-node";
import { CodeBlockElement, CodeLineElement, CodeSyntaxLeaf } from "@/components/ui/code-block-node";
import { CalloutElement } from "@/components/ui/callout-node";
import { ColumnElement, ColumnGroupElement } from "@/components/ui/column-node";
import { LinkElement } from "@/components/ui/link-node";
import { LinkFloatingToolbar } from "@/components/ui/link-toolbar";
import { ImageElement } from "@/components/ui/media-image-node";
import { VideoElement } from "@/components/ui/media-video-node";
import { ToggleElement } from "@/components/ui/toggle-node";
import { BlockquoteElement } from "@/components/ui/blockquote-node";
import { H1Element, H2Element, H3Element } from "@/components/ui/heading-node";
import { HrElement } from "@/components/ui/hr-node";
import { ParagraphElement } from "@/components/ui/paragraph-node";
import { CodeLeaf } from "@/components/ui/code-node";
import { insertBlock } from "@/components/transforms";

import {
  BoldIcon,
  ItalicIcon,
  UnderlineIcon,
  StrikethroughIcon,
  CodeIcon,
  Heading1Icon,
  Heading2Icon,
  Heading3Icon,
  QuoteIcon,
  ListIcon,
  ListOrderedIcon,
  ImageIcon,
  VideoIcon,
  Columns3Icon,
  LightbulbIcon,
  Code2Icon,
  MinusIcon,
  LinkIcon,
} from "lucide-react";

const DEFAULT_VALUE: Value = [
  { type: "p", children: [{ text: "" }] },
];

export function PlateContentEditor({
  initialValue,
  onChange,
}: {
  initialValue?: Value;
  onChange?: (value: Value) => void;
}) {
  const onChangeRef = useRef(onChange);
  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  const editor = usePlateEditor({
    plugins: [
      // Basic blocks
      ParagraphPlugin.withComponent(ParagraphElement),
      H1Plugin.configure({
        node: { component: H1Element },
        rules: { break: { empty: "reset" } },
        shortcuts: { toggle: { keys: "mod+alt+1" } },
      }),
      H2Plugin.configure({
        node: { component: H2Element },
        rules: { break: { empty: "reset" } },
        shortcuts: { toggle: { keys: "mod+alt+2" } },
      }),
      H3Plugin.configure({
        node: { component: H3Element },
        rules: { break: { empty: "reset" } },
        shortcuts: { toggle: { keys: "mod+alt+3" } },
      }),
      BlockquotePlugin.configure({
        node: { component: BlockquoteElement },
        shortcuts: { toggle: { keys: "mod+shift+period" } },
      }),
      HorizontalRulePlugin.withComponent(HrElement),

      // Marks
      BoldPlugin,
      ItalicPlugin,
      UnderlinePlugin,
      StrikethroughPlugin,
      CodePlugin.configure({
        node: { component: CodeLeaf },
        shortcuts: { toggle: { keys: "mod+e" } },
      }),

      // Code blocks
      CodeBlockPlugin.configure({ node: { component: CodeBlockElement } }),
      CodeLinePlugin.configure({ node: { component: CodeLineElement } }),
      CodeSyntaxPlugin.configure({ node: { component: CodeSyntaxLeaf } }),

      // Callout
      CalloutPlugin.configure({ node: { component: CalloutElement } }),

      // Columns
      ColumnPlugin.configure({ node: { component: ColumnGroupElement } }),
      ColumnItemPlugin.configure({ node: { component: ColumnElement } }),

      // Links
      LinkPlugin.configure({
        render: {
          node: LinkElement,
          afterEditable: () => <LinkFloatingToolbar />,
        },
      }),

      // Indent + Lists (indent-based)
      IndentPlugin,
      ListPlugin,

      // Media
      ImagePlugin.configure({ node: { component: ImageElement } }),
      VideoPlugin.configure({ node: { component: VideoElement } }),

      // Toggle
      TogglePlugin.configure({ node: { component: ToggleElement } }),

      // Table
      TablePlugin,
      TableRowPlugin,
      TableCellPlugin,

      // Slash commands
      SlashPlugin,
      SlashInputPlugin.configure({ node: { component: SlashInputElement } }),

      // Drag and drop
      DndPlugin.configure({ options: { enableScroller: true } }),

      // Block selection
      BlockSelectionPlugin,

      // Trailing block — ensures a paragraph always exists at the end
      TrailingBlockPlugin.configure({ options: { type: KEYS.p } }),

      // Exit break — Enter on void elements (images, HRs) creates paragraph below
      ExitBreakPlugin.configure({
        options: {
          rules: [
            { hotkey: "mod+enter" },
            { hotkey: "mod+shift+enter", before: true },
            {
              hotkey: "enter",
              query: { allow: [KEYS.img, KEYS.video, KEYS.hr] },
              relative: true,
              level: 0,
            },
          ],
        },
      }),
    ],
    value: initialValue && initialValue.length > 0 ? initialValue : DEFAULT_VALUE,
  });

  const handleChange = useCallback(({ value }: { value: Value }) => {
    onChangeRef.current?.(value);
  }, []);

  return (
    <DndProvider backend={HTML5Backend}>
      <Plate editor={editor} onChange={handleChange}>
        {/* Fixed toolbar */}
        <FixedToolbar className="sticky top-0 z-30 mb-1 rounded-lg border border-border/40 bg-card/95 px-1.5 py-0.5 backdrop-blur-sm">
          {/* Text formatting */}
          <MarkToolbarButton nodeType={BoldPlugin.key} tooltip="Bold (Ctrl+B)">
            <BoldIcon className="!size-4" />
          </MarkToolbarButton>
          <MarkToolbarButton nodeType={ItalicPlugin.key} tooltip="Italic (Ctrl+I)">
            <ItalicIcon className="!size-4" />
          </MarkToolbarButton>
          <MarkToolbarButton nodeType={UnderlinePlugin.key} tooltip="Underline (Ctrl+U)">
            <UnderlineIcon className="!size-4" />
          </MarkToolbarButton>
          <MarkToolbarButton nodeType={StrikethroughPlugin.key} tooltip="Strikethrough">
            <StrikethroughIcon className="!size-4" />
          </MarkToolbarButton>
          <MarkToolbarButton nodeType={CodePlugin.key} tooltip="Inline Code (Ctrl+E)">
            <CodeIcon className="!size-4" />
          </MarkToolbarButton>

          <ToolbarSeparator />

          {/* Block types */}
          <ToolbarButton
            tooltip="Heading 1"
            onClick={() => insertBlock(editor, KEYS.h1)}
          >
            <Heading1Icon className="!size-4" />
          </ToolbarButton>
          <ToolbarButton
            tooltip="Heading 2"
            onClick={() => insertBlock(editor, KEYS.h2)}
          >
            <Heading2Icon className="!size-4" />
          </ToolbarButton>
          <ToolbarButton
            tooltip="Heading 3"
            onClick={() => insertBlock(editor, KEYS.h3)}
          >
            <Heading3Icon className="!size-4" />
          </ToolbarButton>

          <ToolbarSeparator />

          {/* Block elements */}
          <ToolbarButton
            tooltip="Bulleted List"
            onClick={() => insertBlock(editor, KEYS.ul)}
          >
            <ListIcon className="!size-4" />
          </ToolbarButton>
          <ToolbarButton
            tooltip="Numbered List"
            onClick={() => insertBlock(editor, KEYS.ol)}
          >
            <ListOrderedIcon className="!size-4" />
          </ToolbarButton>
          <ToolbarButton
            tooltip="Blockquote"
            onClick={() => insertBlock(editor, KEYS.blockquote)}
          >
            <QuoteIcon className="!size-4" />
          </ToolbarButton>
          <ToolbarButton
            tooltip="Horizontal Rule"
            onClick={() => insertBlock(editor, KEYS.hr)}
          >
            <MinusIcon className="!size-4" />
          </ToolbarButton>

          <ToolbarSeparator />

          {/* Rich blocks */}
          <ToolbarButton
            tooltip="Code Block"
            onClick={() => insertBlock(editor, KEYS.codeBlock)}
          >
            <Code2Icon className="!size-4" />
          </ToolbarButton>
          <ToolbarButton
            tooltip="Callout"
            onClick={() => insertBlock(editor, KEYS.callout)}
          >
            <LightbulbIcon className="!size-4" />
          </ToolbarButton>
          <ToolbarButton
            tooltip="Image (paste URL)"
            onClick={() => insertBlock(editor, KEYS.img)}
          >
            <ImageIcon className="!size-4" />
          </ToolbarButton>
          <ToolbarButton
            tooltip="Video Embed"
            onClick={() => insertBlock(editor, KEYS.video)}
          >
            <VideoIcon className="!size-4" />
          </ToolbarButton>
          <ToolbarButton
            tooltip="3 Columns"
            onClick={() => insertBlock(editor, "action_three_columns")}
          >
            <Columns3Icon className="!size-4" />
          </ToolbarButton>
          <ToolbarButton
            tooltip="Link"
            onClick={() => {
              import("@platejs/link/react").then(({ triggerFloatingLink }) => {
                triggerFloatingLink(editor, { focused: true });
              });
            }}
          >
            <LinkIcon className="!size-4" />
          </ToolbarButton>
        </FixedToolbar>

        {/* Floating toolbar on text selection */}
        <FloatingToolbar>
          <MarkToolbarButton nodeType={BoldPlugin.key} tooltip="Bold">
            <BoldIcon className="!size-4" />
          </MarkToolbarButton>
          <MarkToolbarButton nodeType={ItalicPlugin.key} tooltip="Italic">
            <ItalicIcon className="!size-4" />
          </MarkToolbarButton>
          <MarkToolbarButton nodeType={UnderlinePlugin.key} tooltip="Underline">
            <UnderlineIcon className="!size-4" />
          </MarkToolbarButton>
          <MarkToolbarButton nodeType={StrikethroughPlugin.key} tooltip="Strikethrough">
            <StrikethroughIcon className="!size-4" />
          </MarkToolbarButton>
          <MarkToolbarButton nodeType={CodePlugin.key} tooltip="Code">
            <CodeIcon className="!size-4" />
          </MarkToolbarButton>
        </FloatingToolbar>

        {/* Editor area — matches article max-width */}
        <EditorContainer className="min-h-[500px]">
          <Editor
            variant="default"
            placeholder="Type / for commands, or start writing..."
          />
        </EditorContainer>
      </Plate>
    </DndProvider>
  );
}
