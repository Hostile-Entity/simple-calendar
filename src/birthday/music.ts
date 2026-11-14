export type MusicState = "paused" | "loading" | "playing" | "blocked" | "error";

/** Construction is inert: ordinary dates never create or request audio. */
export function createBirthdayMusic(source: string = `${import.meta.env.BASE_URL}birthday/white-roses.mp3`) {
  let audio: HTMLAudioElement | null = null;
  let state: MusicState = "paused";
  let wantsPlayback = false;
  let starting = false;
  let generation = 0;
  let listening = false;
  const subscribers = new Set<() => void>();

  function publish(next: MusicState): void {
    if (state === next) return;
    state = next;
    subscribers.forEach(listener => listener());
  }
  function stopListening(): void {
    document.removeEventListener("click", unlock, true);
    document.removeEventListener("keydown", unlock, true);
    listening = false;
  }
  function unlock(event: Event): void {
    if (event.target instanceof Element && event.target.closest("[data-birthday-music-toggle]")) return;
    if (event instanceof KeyboardEvent && event.key !== "Enter" && event.key !== " ") return;
    void play();
  }
  function listenForGesture(): void {
    if (listening) return;
    document.addEventListener("click", unlock, { capture: true, passive: true });
    document.addEventListener("keydown", unlock, { capture: true, passive: true });
    listening = true;
  }
  function ensureAudio(): HTMLAudioElement {
    if (audio) return audio;
    const element = document.createElement("audio");
    element.dataset.birthdayMusic = "true";
    element.src = source;
    element.preload = "auto";
    element.loop = true;
    element.volume = .5;
    element.addEventListener("playing", () => {
      if (audio !== element) return;
      if (!wantsPlayback) { element.pause(); return; }
      stopListening();
      publish("playing");
    });
    element.addEventListener("pause", () => {
      if (audio === element && !starting) publish("paused");
    });
    element.addEventListener("error", () => {
      if (audio !== element) return;
      stopListening();
      publish("error");
    });
    document.body.append(element);
    audio = element;
    return element;
  }
  async function play(): Promise<void> {
    if (!wantsPlayback || starting || state === "error") return;
    const element = ensureAudio();
    const attempt = ++generation;
    starting = true;
    publish("loading");
    try {
      // Called synchronously from the replay button, preserving user activation.
      await element.play();
      if (attempt !== generation) return;
      stopListening();
      publish("playing");
    } catch (error) {
      if (attempt !== generation) return;
      if ((error as DOMException).name === "NotSupportedError") {
        stopListening();
        publish("error");
      } else {
        publish("blocked");
      }
    } finally {
      if (attempt === generation) starting = false;
    }
  }
  function start(): void {
    if (state === "error") return;
    wantsPlayback = true;
    if (state === "playing" || starting) return;
    listenForGesture();
    void play();
  }
  function pause(): void {
    wantsPlayback = false;
    generation += 1;
    starting = false;
    stopListening();
    audio?.pause();
    publish("paused");
  }
  function stop(): void {
    pause();
    const previous = audio;
    audio = null;
    if (previous) {
      previous.removeAttribute("src");
      previous.load();
      previous.remove();
    }
  }
  return {
    start,
    stop,
    toggle(): void {
      if (state === "playing" || state === "loading") pause();
      else start();
    },
    subscribe(listener: () => void): () => void {
      subscribers.add(listener);
      return () => subscribers.delete(listener);
    },
    getSnapshot: (): MusicState => state
  };
}

export type BirthdayMusic = ReturnType<typeof createBirthdayMusic>;
