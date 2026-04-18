import m from "mithril";
import "./app.css";
import { AppShell } from "./app-shell";
import { loadSnapshot, saveSnapshot } from "./persistence/local-storage";
import { createStore, makePersistenceSubscriber } from "./state/store";

const store = createStore(loadSnapshot());

store.subscribe(makePersistenceSubscriber(saveSnapshot));

m.mount(document.getElementById("app")!, {
  view: () => m(AppShell, { store })
});
