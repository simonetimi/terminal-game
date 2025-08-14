import { Injectable, isDevMode } from "@angular/core";
import gsap from "gsap";

@Injectable({ providedIn: "root" })
export class VfxService {
  #permanentEffects: Set<string> = new Set();
  defaultScreenSelector = "main";

  play(effectName: string, options: any = {}) {
    const effects: Record<string, () => void> = {
      shake: () => this.#shake(options.selector || this.defaultScreenSelector),
      fadeIn: () =>
        this.#fadeIn(
          options.selector || this.defaultScreenSelector,
          options.duration || 0.8,
        ),
      fadeOut: () =>
        this.#fadeOut(
          options.selector || this.defaultScreenSelector,
          options.duration || 0.8,
        ),
      grayscale: () =>
        this.#grayscale(
          options.selector || this.defaultScreenSelector,
          options.duration || 0.5,
        ),
      dark: () =>
        this.#dark(
          options.selector || this.defaultScreenSelector,
          options.duration || 0.5,
        ),
      glitch: () =>
        this.#glitch(
          options.selector || this.defaultScreenSelector,
          options.duration || 1,
        ),
    };

    if (effects[effectName]) {
      effects[effectName]();
    } else {
      if (isDevMode()) console.warn(`Visual effect "${effectName}" not found.`);
    }
  }

  #shake(selector: string) {
    gsap.fromTo(
      selector,
      { x: -5 },
      { x: 5, duration: 0.05, yoyo: true, repeat: 5 },
    );
  }

  #fadeIn(selector: string, duration: number) {
    gsap.fromTo(selector, { opacity: 0 }, { opacity: 1, duration });
  }

  #fadeOut(selector: string, duration: number) {
    gsap.to(selector, { opacity: 0, duration });
  }

  #grayscale(selector: string, duration: number) {
    this.#permanentEffects.add("grayscale");
    gsap.to(selector, { filter: "grayscale(100%)", duration });
  }

  #dark(selector: string, duration: number) {
    this.#permanentEffects.add("dark");
    gsap.to(selector, {
      filter: "grayscale(100%) brightness(0.8) contrast(1.2) saturate(0)",
      duration,
    });
  }

  #glitch(selector: string, duration: number) {
    const element = document.querySelector(selector) as HTMLElement | null;
    if (!element) return;

    element.dataset["glitching"] = "true";
    element.dispatchEvent(
      new CustomEvent("glitch-starting", {
        detail: { duration: duration * 1000 },
        bubbles: true,
        composed: true,
      }),
    );

    const cs = getComputedStyle(element);
    const prevPos = cs.position;
    if (prevPos === "static") {
      element.style.position = "relative";
    }

    const overlay = document.createElement("div");
    overlay.className = "vfx-glitch-overlay";
    Object.assign(overlay.style, {
      position: "absolute",
      inset: "0",
      pointerEvents: "none",
      zIndex: "999",
      color: "inherit",
      font: cs.font || "inherit",
      lineHeight: cs.lineHeight || "inherit",
      padding: cs.padding || "0",
      display: "flex",
      flexDirection: "column-reverse",
      justifyContent: "flex-start",
      overflow: "hidden",
      whiteSpace: "pre-wrap",
      mixBlendMode: "normal",
      willChange: "opacity, transform",
      // fast, stepped animations (robotic)
      animation:
        "vfx-flicker 70ms steps(2,end) infinite, vfx-shake 40ms steps(5,end) infinite",
    } as CSSStyleDeclaration);

    // horizontal-only shake (no rotation)
    overlay.style.setProperty("--vfx-shake-amp", "1px");
    overlay.style.setProperty("--vfx-shake-rot", "0deg");

    // irregular horizontal jitter on the container (random steps + pauses)
    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    const prevTransform = element.style.transform;
    let jitterTimer: number | null = null;

    const offsets = [-2, -1, 0, 1, 2];
    const rand = (min: number, max: number) =>
      Math.floor(Math.random() * (max - min + 1)) + min;

    const jitterStep = () => {
      // 50% chance to stay still (0) to create breaks, else pick small x
      const x =
        Math.random() < 0.5 ? 0 : offsets[(Math.random() * offsets.length) | 0];
      element.style.transform = `translate3d(${x}px,0,0)`;
      // occasional longer pauses for irregular feel
      const longPause = Math.random() < 0.18;
      const delay = longPause ? rand(90, 160) : rand(18, 55);
      jitterTimer = window.setTimeout(jitterStep, delay);
    };

    if (!reduceMotion) jitterStep();

    // only render noise so text isn't doubled
    const baseText = element.innerText;
    const glitchChars = ["█", "▓", "▒", "░", "▀", "▄", "■", "□", "▪", "▫"];
    const colors = [
      "#ff0080",
      "#00ff80",
      "#8000ff",
      "#ff8000",
      "#0080ff",
      "#80ff00",
    ];
    const randomGlitchChar = () =>
      glitchChars[(Math.random() * glitchChars.length) | 0];
    const randomColor = () => colors[(Math.random() * colors.length) | 0];

    const renderGlitchHtml = () => {
      const lines = baseText.split("\n");
      const glitchedLines = lines.map((line) => {
        const content = [...line]
          .map((ch) => {
            const space = "&nbsp;";
            if (ch === " ") return space;
            if (Math.random() < 0.1) {
              const g = randomGlitchChar();
              const c = randomColor();
              const dx = (Math.random() * 2 - 1).toFixed(0);
              return `<span style="position:relative;left:${dx}px;color:${c};text-shadow:1px 0 ${c}">${g}</span>`;
            }
            return space;
          })
          .join("");
        return `<div>${content}</div>`;
      });
      overlay.innerHTML = glitchedLines.join("");
    };

    element.appendChild(overlay);
    const interval = window.setInterval(renderGlitchHtml, 70);
    renderGlitchHtml();

    window.setTimeout(() => {
      window.clearInterval(interval);
      overlay.remove();

      if (jitterTimer !== null) {
        window.clearTimeout(jitterTimer);
        jitterTimer = null;
      }
      element.style.transform = prevTransform;

      if (prevPos === "static") {
        element.style.position = "";
      }
      delete element.dataset["glitching"];
      element.dispatchEvent(
        new CustomEvent("glitch-ended", { bubbles: true, composed: true }),
      );
    }, duration * 1000);
  }

  removeEffects(
    selector: string = this.defaultScreenSelector,
    duration: number = 0.5,
  ) {
    this.#permanentEffects.clear();
    gsap.to(selector, {
      filter: "none",
      duration,
    });
  }

  hasPermanentEffect(effectName: string): boolean {
    return this.#permanentEffects.has(effectName);
  }
}
