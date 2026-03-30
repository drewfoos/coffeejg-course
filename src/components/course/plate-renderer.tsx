"use client";

import * as React from "react";
import type { Value } from "platejs";
import { Plate, usePlateEditor } from "platejs/react";
import { CodeBlockPlugin, CodeLinePlugin, CodeSyntaxPlugin } from "@platejs/code-block/react";
import { CalloutPlugin } from "@platejs/callout/react";
import { ColumnPlugin, ColumnItemPlugin } from "@platejs/layout/react";
import { LinkPlugin } from "@platejs/link/react";
import { IndentPlugin } from "@platejs/indent/react";
import { ListPlugin } from "@platejs/list/react";
import { ImagePlugin, VideoPlugin } from "@platejs/media/react";
import { TogglePlugin } from "@platejs/toggle/react";
import { TablePlugin, TableCellPlugin, TableRowPlugin } from "@platejs/table/react";
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
import { ParagraphPlugin } from "platejs/react";

import { Editor, EditorContainer } from "@/components/ui/editor";
import { CodeBlockElement, CodeLineElement, CodeSyntaxLeaf } from "@/components/ui/code-block-node";
import { CalloutElement } from "@/components/ui/callout-node";
import { ColumnElement, ColumnGroupElement } from "@/components/ui/column-node";
import { LinkElement } from "@/components/ui/link-node";
import { ImageElement } from "@/components/ui/media-image-node";
import { VideoElement } from "@/components/ui/media-video-node";
import { ToggleElement } from "@/components/ui/toggle-node";
import { BlockquoteElement } from "@/components/ui/blockquote-node";
import { H1Element, H2Element, H3Element } from "@/components/ui/heading-node";
import { HrElement } from "@/components/ui/hr-node";
import { ParagraphElement } from "@/components/ui/paragraph-node";
import { CodeLeaf } from "@/components/ui/code-node";

export function PlateRenderer({ value }: { value: Value }) {
  const editor = usePlateEditor({
    plugins: [
      ParagraphPlugin.withComponent(ParagraphElement),
      H1Plugin.configure({ node: { component: H1Element } }),
      H2Plugin.configure({ node: { component: H2Element } }),
      H3Plugin.configure({ node: { component: H3Element } }),
      BlockquotePlugin.configure({ node: { component: BlockquoteElement } }),
      HorizontalRulePlugin.withComponent(HrElement),
      BoldPlugin,
      ItalicPlugin,
      UnderlinePlugin,
      StrikethroughPlugin,
      CodePlugin.configure({ node: { component: CodeLeaf } }),
      CodeBlockPlugin.configure({ node: { component: CodeBlockElement } }),
      CodeLinePlugin.configure({ node: { component: CodeLineElement } }),
      CodeSyntaxPlugin.configure({ node: { component: CodeSyntaxLeaf } }),
      CalloutPlugin.configure({ node: { component: CalloutElement } }),
      ColumnPlugin.configure({ node: { component: ColumnGroupElement } }),
      ColumnItemPlugin.configure({ node: { component: ColumnElement } }),
      LinkPlugin.configure({ node: { component: LinkElement } }),
      IndentPlugin,
      ListPlugin,
      ImagePlugin.configure({ node: { component: ImageElement } }),
      VideoPlugin.configure({ node: { component: VideoElement } }),
      TogglePlugin.configure({ node: { component: ToggleElement } }),
      TablePlugin,
      TableRowPlugin,
      TableCellPlugin,
    ],
    value,
  });

  return (
    <Plate editor={editor} readOnly>
      <EditorContainer className="plate-article">
        <Editor readOnly variant="none" />
      </EditorContainer>
    </Plate>
  );
}

