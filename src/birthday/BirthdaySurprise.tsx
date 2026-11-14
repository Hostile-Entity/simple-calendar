import { useEffect, useLayoutEffect, useRef, useState, useSyncExternalStore } from "react";
import { applyTheme, getSavedTheme, type Theme } from "../utils/theme";
import type { BirthdayMusic } from "./music";
import { mountBirthdayPetals } from "./petals";
import { showBirthdayConfetti } from "./confetti";
import { BIRTHDAY_DAY } from "./calendar";
import "./birthday.css";

interface BirthdaySurpriseProps {
  music: BirthdayMusic;
  theme: Theme;
}

export default function BirthdaySurprise({ music, theme }: BirthdaySurpriseProps): JSX.Element {
  const ambience = useRef<HTMLDivElement>(null);
  const feature = useRef<HTMLDivElement>(null);
  const dialog = useRef<HTMLDialogElement>(null);
  const confetti = useRef<HTMLDivElement>(null);
  const [noteOpen, setNoteOpen] = useState(false);
  const musicState = useSyncExternalStore(music.subscribe, music.getSnapshot);
  const playing = musicState === "playing" || musicState === "loading";
  const asset = `${import.meta.env.BASE_URL}birthday/`;

  useLayoutEffect(() => {
    document.documentElement.dataset.birthdayActive = "true";
    document.querySelector('meta[name="theme-color"]')?.setAttribute("content", "#f5f3fa");
    return () => {
      delete document.documentElement.dataset.birthdayActive;
      applyTheme(getSavedTheme());
    };
  }, [theme]);

  useEffect(() => {
    const app = feature.current?.closest<HTMLElement>(".appShell");
    if (!ambience.current || !app) return;
    return mountBirthdayPetals(ambience.current, app);
  }, []);

  useEffect(() => {
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    const clear = (): void => { confetti.current?.replaceChildren(); };
    const reduce = (): void => { if (preference.matches) clear(); };
    const hide = (): void => { if (document.hidden) clear(); };
    preference.addEventListener("change", reduce);
    document.addEventListener("visibilitychange", hide);
    return () => {
      preference.removeEventListener("change", reduce);
      document.removeEventListener("visibilitychange", hide);
      clear();
    };
  }, []);

  function openNote(): void {
    dialog.current?.showModal();
    setNoteOpen(true);
    if (confetti.current) showBirthdayConfetti(confetti.current);
  }
  function closeNote(): void {
    if (dialog.current?.open) return;
    setNoteOpen(false);
    confetti.current?.replaceChildren();
  }

  return (
    <div className={`birthdayFeature${noteOpen ? " birthdayNoteOpen" : ""}`} ref={feature}>
      <div className="birthdayAmbience" ref={ambience} aria-hidden="true" />
      <div className="birthdayControls">
        <button type="button" className="birthdayMusicToggle" data-birthday-music-toggle
          lang="ru" onClick={music.toggle} disabled={musicState === "error"}
          aria-pressed={playing}
          aria-label={musicState === "error" ? "Не удалось загрузить музыку" : playing ? "Приостановить музыку" : "Включить музыку"}>
          {musicState === "error" ? "♫ Недоступно" : playing ? "Ⅱ Музыка" : "▷ Музыка"}
        </button>
      </div>
      <section className="birthdayHero" aria-labelledby="birthdayTitle">
        <div className="birthdayCopy" lang="ru">
          <p className="birthdayEyebrow"><span className="birthdayLiveDot" />{BIRTHDAY_DAY} ноября</p>
          <h1 id="birthdayTitle">Мама,<br /><em>С Днём Рождения!</em></h1>
          <button type="button" className="birthdaySurpriseButton" onClick={openNote}>
            <span aria-hidden="true">♡</span>Для тебя<span aria-hidden="true">↗</span>
          </button>
        </div>
        <div className="birthdayRoseArt" aria-hidden="true">
          <div className="birthdayRoseHalo" /><div className="birthdaySculptureRing" />
          <img className="birthdayRoseBouquet" src={`${asset}white-roses.webp`} alt="" width="1000" height="773" />
        </div>
      </section>
      <dialog ref={dialog} className="birthdayNote" aria-labelledby="birthdayLetterTitle" lang="ru"
        onClose={closeNote}
        onClick={event => {
          const bounds = event.currentTarget.getBoundingClientRect();
          if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) {
            event.currentTarget.close();
          }
        }}>
        <div className="birthdayLetterPaper">
          <button type="button" className="birthdayDialogClose" aria-label="Закрыть поздравление" onClick={() => dialog.current?.close()}>×</button>
          <div className="birthdayLetterContent">
            <span className="birthdayLetterRule" aria-hidden="true" />
            <h2 id="birthdayLetterTitle">С Днём Рождения,<br />Мама!</h2>
            <p>Желаю тебе крепкого здоровья и побольше радостных дней.</p>
            <p>Я очень по тебе скучаю.</p>
            <p>Спасибо за твою любовь и заботу.<br /><strong>Очень тебя люблю!</strong></p>
          </div>
        </div>
        <div className="birthdayConfettiLayer" ref={confetti} aria-hidden="true" />
      </dialog>
    </div>
  );
}
