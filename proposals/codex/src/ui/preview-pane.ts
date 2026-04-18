import m from "mithril";
import { micromark } from "micromark";

interface PreviewPaneAttrs {
  body: string;
}

export const PreviewPane: m.Component<PreviewPaneAttrs> = {
  view: ({ attrs }) =>
    m("section.preview-pane", {
      oncreate: ({ dom }) => {
        dom.innerHTML = micromark(attrs.body);
      },
      onupdate: ({ dom }) => {
        dom.innerHTML = micromark(attrs.body);
      }
    })
};
