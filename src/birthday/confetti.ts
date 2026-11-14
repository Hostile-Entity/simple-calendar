/** One small shower per opening. CSS handles flight; no scheduling or frame loop. */
export function showBirthdayConfetti(layer: HTMLDivElement): void {
  layer.replaceChildren();
  if (document.hidden) return;
  const fragment = document.createDocumentFragment();
  const colors = ["#9b72bd", "#c5a6de", "#d6b46c", "#c989a4", "#93b0a0"];
  for (let index = 0; index < 24; index++) {
    const piece = document.createElement("span");
    piece.className = "birthdayConfetti";
    const direction = Math.random() < .5 ? -1 : 1;
    piece.style.cssText = `--left:${2 + (index + Math.random()) / 24 * 96}%;--delay:${Math.random() * .6}s;--duration:${5.6 + Math.random() * 1.6}s;--drift:${Math.random() * 80 - 40}px;--sway:${direction * (12 + Math.random() * 18)}px;--start-turn:${Math.random() * 360}deg;--turn:${direction * (240 + Math.random() * 420)}deg;--confetti-color:${colors[index % colors.length]};--radius:${index % 4 ? "1px" : "50%"};--height:${index % 4 ? 11 : 7}px`;
    piece.addEventListener("animationend", () => piece.remove(), { once: true });
    fragment.append(piece);
  }
  layer.append(fragment);
}
