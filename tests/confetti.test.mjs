import assert from "node:assert/strict";
import test from "node:test";
import { showBirthdayConfetti } from "../src/birthday/confetti.ts";

test("letter confetti is one bounded shower without timers or repeat scheduling", () => {
  const previousWindow = globalThis.window;
  const previousDocument = globalThis.document;
  let reduced = false;
  class Node extends EventTarget {
    children = [];
    parent = null;
    style = {};
    constructor(fragment = false) { super(); this.fragment = fragment; }
    append(node) {
      if (node.fragment) { [...node.children].forEach(child => this.append(child)); return; }
      node.remove();
      this.children.push(node);
      node.parent = this;
    }
    replaceChildren() { [...this.children].forEach(child => child.remove()); }
    remove() {
      if (this.parent) this.parent.children = this.parent.children.filter(child => child !== this);
      this.parent = null;
    }
  }
  globalThis.window = {
    matchMedia: () => ({ matches: reduced }),
    setTimeout: () => assert.fail("One-shot confetti must not schedule timers"),
    setInterval: () => assert.fail("One-shot confetti must not repeat")
  };
  globalThis.document = {
    hidden: false,
    createElement: () => new Node(),
    createDocumentFragment: () => new Node(true)
  };
  try {
    const layer = new Node();
    showBirthdayConfetti(layer);
    assert.equal(layer.children.length, 24);
    showBirthdayConfetti(layer);
    assert.equal(layer.children.length, 24, "reopening replaces any unfinished shower");
    for (const piece of layer.children) {
      assert.ok(parseFloat(piece.style.cssText.match(/--delay:([^s]+)s/)[1]) >= 0);
      const duration = parseFloat(piece.style.cssText.match(/--duration:([^s]+)s/)[1]);
      assert.ok(duration >= 5.6 && duration < 7.2);
    }
    [...layer.children].forEach(piece => piece.dispatchEvent(new Event("animationend")));
    assert.equal(layer.children.length, 0, "finished pieces are removed, not respawned");
    reduced = true;
    showBirthdayConfetti(layer);
    assert.equal(layer.children.length, 0);
    reduced = false;
    document.hidden = true;
    showBirthdayConfetti(layer);
    assert.equal(layer.children.length, 0);
  } finally {
    if (previousWindow === undefined) delete globalThis.window;
    else globalThis.window = previousWindow;
    if (previousDocument === undefined) delete globalThis.document;
    else globalThis.document = previousDocument;
  }
});
