import assert from "node:assert/strict";
import test from "node:test";
import { createBackup, parseBackup } from "../src/utils/backup.ts";

const entry = { date: "2028-02-29", colorId: 0, note: "Note 🌷\nSecond line", updatedAt: 1700000000000 };
const parse = value => parseBackup(JSON.stringify(value), 10);

test("backups round-trip all months, colors, notes, timestamps and both themes", () => {
  const entries = [
    entry,
    { ...entry, date: "2020-01-01", colorId: null, note: "" },
    { ...entry, date: "2035-12-31", colorId: 9 }
  ];
  for (const theme of ["default", "dark"]) {
    const backup = createBackup(entries, theme);
    assert.deepEqual(parse(backup), backup);
    assert.ok(Number.isFinite(Date.parse(backup.exportedAt)));
  }
});

test("empty backups are valid for either theme", () => {
  for (const theme of ["default", "dark"]) {
    assert.deepEqual(parse(createBackup([], theme)).entries, []);
  }
});

test("invalid JSON, wrong formats, unsupported versions and invalid settings are rejected", () => {
  assert.throws(() => parseBackup("{", 10), /valid JSON/);
  const backup = createBackup([entry], "default");
  for (const value of [
    null, [], {}, { ...backup, format: "other" }, { ...backup, version: 2 },
    { ...backup, theme: "blue" }, { ...backup, exportedAt: "bad" },
    { ...backup, entries: {} }
  ]) assert.throws(() => parse(value));
});

test("bad dates, unknown colors, malformed entries and duplicate dates are rejected", () => {
  const backup = createBackup([entry], "default");
  for (const invalid of [
    null, [], {}, { ...entry, date: "2027-02-29" }, { ...entry, date: "2028-04-31" },
    { ...entry, date: "2028-2-29" }, { ...entry, colorId: -1 },
    { ...entry, colorId: 10 }, { ...entry, colorId: 0.5 }, { ...entry, colorId: "1" },
    { ...entry, note: null }, { ...entry, updatedAt: -1 }, { ...entry, updatedAt: "123" }
  ]) assert.throws(() => parse({ ...backup, entries: [entry, invalid] }));
  assert.throws(() => parse({ ...backup, entries: [entry, entry] }), /duplicate/);
});

test("import only retains supported entry fields", () => {
  const backup = createBackup([{ ...entry, extra: "ignored" }], "dark");
  assert.deepEqual(parse(backup).entries, [entry]);
});
