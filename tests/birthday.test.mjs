import assert from "node:assert/strict";
import test from "node:test";
import { BIRTHDAY_MONTH, BIRTHDAY_DAY, BIRTHDAY_REPLAY_DAYS, getBirthdayAvailability, getBirthdayDateKey, localDayKey, millisecondsUntilNextDay } from "../src/birthday/calendar.ts";
import { createBirthdayMusic } from "../src/birthday/music.ts";

test("birthday is annual; exactly the seven following local dates offer replay", () => {
  for (const year of [2025, 2026, 2027, 2028, 2030]) {
    const expectedKey = `${year}-${String(BIRTHDAY_MONTH + 1).padStart(2, "0")}-${String(BIRTHDAY_DAY).padStart(2, "0")}`;
    assert.equal(getBirthdayDateKey(year), expectedKey);
    let birthdays = 0;
    let replayDays = 0;
    for (let month = 0; month < 12; month++) {
      for (let day = 1; day <= new Date(year, month + 1, 0).getDate(); day++) {
        const expected = month === BIRTHDAY_MONTH && day === BIRTHDAY_DAY ? "birthday"
          : month === BIRTHDAY_MONTH && day > BIRTHDAY_DAY && day <= BIRTHDAY_DAY + BIRTHDAY_REPLAY_DAYS ? "replay" : "none";
        assert.equal(getBirthdayAvailability(new Date(year, month, day, 12)), expected);
        if (expected === "birthday") birthdays++;
        if (expected === "replay") replayDays++;
      }
    }
    assert.equal(birthdays, 1);
    assert.equal(replayDays, 7);
  }
});

test("window boundaries use the device's local day, not UTC", () => {
  const original = process.env.TZ;
  try {
    process.env.TZ = "Pacific/Kiritimati";
    const pacificBirthday = new Date(Date.UTC(2026, BIRTHDAY_MONTH, BIRTHDAY_DAY - 1, 10));
    assert.equal(getBirthdayAvailability(pacificBirthday), "birthday");
    assert.equal(localDayKey(pacificBirthday), getBirthdayDateKey(2026));
    process.env.TZ = "America/Los_Angeles";
    assert.equal(getBirthdayAvailability(new Date(Date.UTC(2026, BIRTHDAY_MONTH, BIRTHDAY_DAY + 1, 7, 59, 59))), "birthday");
    assert.equal(getBirthdayAvailability(new Date(Date.UTC(2026, BIRTHDAY_MONTH, BIRTHDAY_DAY + 1, 8))), "replay");
    assert.equal(getBirthdayAvailability(new Date(Date.UTC(2026, BIRTHDAY_MONTH, BIRTHDAY_DAY + BIRTHDAY_REPLAY_DAYS + 1, 7, 59, 59))), "replay");
    assert.equal(getBirthdayAvailability(new Date(Date.UTC(2026, BIRTHDAY_MONTH, BIRTHDAY_DAY + BIRTHDAY_REPLAY_DAYS + 1, 8))), "none");
  } finally {
    if (original === undefined) delete process.env.TZ;
    else process.env.TZ = original;
  }
});

test("next-day scheduling respects midnight and daylight-saving changes", () => {
  const original = process.env.TZ;
  try {
    process.env.TZ = "America/New_York";
    for (const day of [BIRTHDAY_DAY - 1, BIRTHDAY_DAY, BIRTHDAY_DAY + BIRTHDAY_REPLAY_DAYS]) {
      assert.equal(millisecondsUntilNextDay(new Date(2026, BIRTHDAY_MONTH, day, 23, 59, 59)), 1000);
    }
    assert.equal(millisecondsUntilNextDay(new Date(2026, 2, 8)), 23 * 60 * 60 * 1000);
    assert.equal(millisecondsUntilNextDay(new Date(2026, 10, 1)), 25 * 60 * 60 * 1000);
  } finally {
    if (original === undefined) delete process.env.TZ;
    else process.env.TZ = original;
  }
});

test("music lifecycle, browser autoplay policy and explicit pause", async t => {
  const original = Object.fromEntries(["document", "Element", "KeyboardEvent"].map(key => [key, globalThis[key]]));
  let policy = "allow";
  const created = [];
  class FakeElement extends EventTarget { closest() { return null; } }
  class FakeKeyboardEvent extends Event { key = "Enter"; }
  class FakeAudio extends EventTarget {
    dataset = {};
    paused = true;
    currentTime = 37;
    calls = 0;
    removed = false;
    resolvePlay;
    play() {
      this.calls++;
      if (policy === "block" && this.calls === 1) {
        return Promise.reject(Object.assign(new Error(), { name: "NotAllowedError" }));
      }
      if (policy === "unsupported") {
        return Promise.reject(Object.assign(new Error(), { name: "NotSupportedError" }));
      }
      this.paused = false;
      if (policy === "pending") {
        return new Promise(resolve => { this.resolvePlay = () => { this.dispatchEvent(new Event("playing")); resolve(); }; });
      }
      this.dispatchEvent(new Event("playing"));
      return Promise.resolve();
    }
    pause() { this.paused = true; this.dispatchEvent(new Event("pause")); }
    removeAttribute(name) { delete this[name]; }
    load() {}
    remove() { this.removed = true; }
  }
  const document = new EventTarget();
  document.body = { append() {} };
  document.createElement = () => { const audio = new FakeAudio(); created.push(audio); return audio; };
  globalThis.document = document;
  globalThis.Element = FakeElement;
  globalThis.KeyboardEvent = FakeKeyboardEvent;
  const flush = async () => { await Promise.resolve(); await Promise.resolve(); };
  try {
    await t.test("ordinary calendar does not create or request audio", () => {
      const music = createBirthdayMusic("/birthday/test.mp3");
      music.stop();
      assert.equal(created.length, 0);
    });
    await t.test("start plays immediately, pause is sticky, resume preserves time", async () => {
      policy = "allow";
      const music = createBirthdayMusic("/birthday/test.mp3");
      music.start();
      assert.equal(created.at(-1).calls, 1, "play is invoked in the click stack");
      await flush();
      const audio = created.at(-1);
      assert.equal(music.getSnapshot(), "playing");
      assert.equal(audio.loop, true);
      assert.equal(audio.volume, .5);
      music.toggle();
      document.dispatchEvent(new Event("click"));
      await flush();
      assert.equal(audio.paused, true);
      assert.equal(audio.calls, 1);
      assert.equal(audio.currentTime, 37);
      music.toggle();
      await flush();
      assert.equal(audio.paused, false);
      assert.equal(audio.currentTime, 37);
      music.stop();
      assert.equal(audio.removed, true);
      assert.equal(audio.paused, true);
      assert.equal("src" in audio, false);
    });
    await t.test("blocked autoplay starts on the first interaction", async () => {
      policy = "block";
      const music = createBirthdayMusic("/birthday/test.mp3");
      music.start();
      await flush();
      assert.equal(music.getSnapshot(), "blocked");
      document.dispatchEvent(new Event("click"));
      await flush();
      assert.equal(music.getSnapshot(), "playing");
      music.stop();
    });
    await t.test("late play promises cannot resurrect a closed surprise", async () => {
      policy = "pending";
      const music = createBirthdayMusic("/birthday/test.mp3");
      music.start();
      const audio = created.at(-1);
      music.stop();
      audio.resolvePlay();
      await flush();
      assert.equal(audio.paused, true);
      assert.equal(audio.removed, true);
      assert.equal(music.getSnapshot(), "paused");
    });
    await t.test("unsupported media stops retrying safely", async () => {
      policy = "unsupported";
      const music = createBirthdayMusic("/birthday/test.mp3");
      music.start();
      await flush();
      const audio = created.at(-1);
      assert.equal(music.getSnapshot(), "error");
      document.dispatchEvent(new Event("click"));
      music.start();
      assert.equal(audio.calls, 1);
      music.stop();
    });
  } finally {
    for (const [key, value] of Object.entries(original)) {
      if (value === undefined) delete globalThis[key];
      else globalThis[key] = value;
    }
  }
});
