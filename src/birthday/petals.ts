/** Imperative animation island with full cleanup, safe under React StrictMode. */
export function mountBirthdayPetals(ambience: HTMLDivElement, app: HTMLElement): () => void {
  const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
  const layer = document.createElement("div");
  layer.className = "birthdayDepthLayer";
  ambience.append(layer);
  // Longer flights for distant petals; keep the largest petals' speed unchanged.
  const streams = [
    { size: 9, duration: 110 }, { size: 13, duration: 80 },
    { size: 17, duration: 52 }, { size: 21, duration: 36 }, { size: 25, duration: 23 }
  ];
  const colors = ["#fffef8", "#f5f4e9", "#fffffb", "#edeedc"];
  const petalCount = 30;
  const petals: Array<{ element: HTMLSpanElement; depth: number; count: number }> = [];
  for (let index = 0; index < petalCount; index++) {
    const stream = index % streams.length;
    const { size, duration } = streams[stream];
    const count = Math.ceil((petalCount - stream) / streams.length);
    const phase = (Math.floor(index / streams.length) / count + .11 + stream * .137) % 1;
    const depth = .95 - (size - 9) / 16 * .92;
    const spawnX = (index * 17 % petalCount) / (petalCount - 1) * 100;
    const wrapper = document.createElement("span");
    wrapper.className = "birthdayPetalDepth";
    wrapper.style.setProperty("--depth", depth.toFixed(4));
    const petal = document.createElement("span");
    petal.className = `birthdayAirPetal ${size >= 21 ? "near" : "far"}`;
    petal.style.cssText = `--x:calc(${spawnX}% - ${size / 2}px);--size:${size}px;--duration:${duration}s;--delay:${-duration * phase}s;--rotation:${index * 47}deg;--petal-color:${colors[index % colors.length]};--drift:${index * 17 % 73 - 36}px;--sway:${(index % 2 ? -1 : 1) * (8 + index * 7 % 15)}px;--turn-duration:${6 + index * 5 % 11}s;--turn-delay:${-index * .83}s;--spin:${index % 2 ? -360 : 360}deg`;
    wrapper.append(petal);
    layer.append(wrapper);
    petals.push({ element: wrapper, depth, count });
  }

  let frame = 0;
  let geometryDirty = true;
  let scrollRange = 0;
  let disposed = false;
  function schedule(refreshGeometry = false): void {
    geometryDirty ||= refreshGeometry;
    if (disposed || frame || preference.matches || document.hidden) return;
    frame = requestAnimationFrame(() => {
      frame = 0;
      if (disposed || preference.matches || document.hidden) return;
      if (geometryDirty) {
        const viewport = ambience.clientHeight;
        scrollRange = Math.max(0, document.documentElement.scrollHeight - document.documentElement.clientHeight);
        for (const { element, depth, count } of petals) {
          const minimum = viewport + 104 + scrollRange * depth;
          const slots = Math.floor(count * viewport / minimum);
          const flight = slots > 0 ? count * viewport / slots : minimum;
          element.style.setProperty("--flight-distance", `${flight}px`);
          element.style.setProperty("--flight-scale", (flight / (viewport + 104)).toFixed(5));
        }
        geometryDirty = false;
      }
      layer.style.setProperty("--petal-scroll", `${-Math.max(0, Math.min(window.scrollY, scrollRange))}px`);
    });
  }
  const scroll = (): void => schedule();
  const resize = (): void => schedule(true);
  function updateMotion(): void {
    app.classList.toggle("birthdayMotionPaused", preference.matches || document.hidden);
    if (preference.matches || document.hidden) { cancelAnimationFrame(frame); frame = 0; }
    else schedule(true);
  }
  const observer = new ResizeObserver(resize);
  observer.observe(app);
  window.addEventListener("scroll", scroll, { passive: true });
  window.addEventListener("resize", resize, { passive: true });
  document.addEventListener("visibilitychange", updateMotion);
  preference.addEventListener("change", updateMotion);
  updateMotion();
  return () => {
    disposed = true;
    cancelAnimationFrame(frame);
    observer.disconnect();
    window.removeEventListener("scroll", scroll);
    window.removeEventListener("resize", resize);
    document.removeEventListener("visibilitychange", updateMotion);
    preference.removeEventListener("change", updateMotion);
    app.classList.remove("birthdayMotionPaused");
    layer.remove();
  };
}
