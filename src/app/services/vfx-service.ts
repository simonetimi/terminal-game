import { Injectable, isDevMode } from "@angular/core";
import gsap from "gsap";

@Injectable({ providedIn: "root" })
export class VfxService {
  #permanentEffects: Set<string> = new Set();
  #currentTimeline: gsap.core.Timeline | null = null;
  defaultScreenSelector = "main";

  play(effectName: string, options: any = {}) {
    const effects: Record<string, () => void> = {
      shake: () => this.#shake(options.selector || this.defaultScreenSelector),
      dark: () =>
        this.#dark(
          options.selector || this.defaultScreenSelector,
          options.duration || 2,
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

  #dark(selector: string, duration: number) {
    this.#permanentEffects.add("dark");

    if (this.#currentTimeline) {
      this.#currentTimeline.kill();
    }

    const element = document.querySelector(selector) as HTMLElement;
    if (!element) return;

    this.#createGrainOverlay(element);

    this.#currentTimeline = gsap.timeline();

    this.#currentTimeline
      // desaturate completely
      .to(element, {
        filter: "brightness(0.7) contrast(2.0) saturate(0)",
        duration: duration * 0.4,
        ease: "power2.inOut",
      })
      // pulsing shadow effect
      .to(
        element,
        {
          boxShadow: "inset 0 0 80px rgba(0, 0, 0, 0.7)",
          duration: duration * 0.3,
          ease: "power1.inOut",
        },
        "-=0.2",
      )
      // igh contrast black and white
      .to(
        element,
        {
          filter: "brightness(0.9) contrast(2.0) saturate(0)",
          duration: duration * 0.3,
          ease: "power1.out",
        },
        "-=0.1",
      );

    // breathing effect
    gsap.to(element, {
      filter: "brightness(0.6) contrast(3.5) saturate(0)",
      duration: 1.8,
      yoyo: true,
      repeat: -1,
      ease: "power2.inOut",
      delay: duration,
    });

    // shadow breathing
    gsap.to(element, {
      boxShadow: "inset 0 0 120px rgba(0, 0, 0, 0.9)",
      duration: 2.2,
      yoyo: true,
      repeat: -1,
      ease: "sine.inOut",
      delay: duration + 0.3,
    });
  }

  #createGrainOverlay(parentElement: HTMLElement) {
    const existingGrain = parentElement.querySelector(".vfx-grain-overlay");
    if (existingGrain) {
      existingGrain.remove();
    }

    const grain = document.createElement("div");
    grain.className = "vfx-grain-overlay";

    Object.assign(grain.style, {
      position: "absolute",
      inset: "0",
      pointerEvents: "none",
      zIndex: "998",
      opacity: "0.6",
      mixBlendMode: "screen",
      background: `
        radial-gradient(circle at 20% 80%, transparent 40%, rgba(255,255,255,0.1) 60%, transparent 80%),
        radial-gradient(circle at 80% 20%, transparent 30%, rgba(255,255,255,0.1) 50%, transparent 70%),
        radial-gradient(circle at 40% 40%, transparent 35%, rgba(255,255,255,0.3) 55%, transparent 75%),
        radial-gradient(circle at 60% 10%, transparent 45%, rgba(255,255,255,0.3) 65%, transparent 85%),
        radial-gradient(circle at 10% 60%, transparent 25%, rgba(255,255,255,0.1) 45%, transparent 65%)
      `,
      backgroundSize: "1px 1px, 1.5px 1.5px, 1px 1px, 1.5px 1.5px, 0.5px 0.5px",
      willChange: "transform, opacity",
    });

    parentElement.style.position = parentElement.style.position || "relative";
    parentElement.appendChild(grain);

    gsap.to(grain, {
      backgroundPosition: "2px 2px, 3px 3px, 1.5px 1.5px, 2.5px 2.5px, 1px 1px",
      duration: 0.08,
      repeat: -1,
      yoyo: true,
      ease: "none",
    });

    gsap.to(grain, {
      opacity: 0.8,
      duration: 1.2,
      repeat: -1,
      yoyo: true,
      ease: "sine.inOut",
    });

    // flicker
    gsap.to(grain, {
      opacity: 0.3,
      duration: 0.05,
      repeat: -1,
      repeatDelay: 2 + Math.random() * 3,
      yoyo: true,
      ease: "power2.inOut",
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
      animation:
        "vfx-flicker 70ms steps(2,end) infinite, vfx-shake 40ms steps(5,end) infinite",
    } as CSSStyleDeclaration);

    overlay.style.setProperty("--vfx-shake-amp", "1px");
    overlay.style.setProperty("--vfx-shake-rot", "0deg");

    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    const prevTransform = element.style.transform;
    let jitterTimer: number | null = null;

    const offsets = [-2, -1, 0, 1, 2];
    const rand = (min: number, max: number) =>
      Math.floor(Math.random() * (max - min + 1)) + min;

    const jitterStep = () => {
      const x =
        Math.random() < 0.5 ? 0 : offsets[(Math.random() * offsets.length) | 0];
      element.style.transform = `translate3d(${x}px,0,0)`;
      const longPause = Math.random() < 0.18;
      const delay = longPause ? rand(90, 160) : rand(18, 55);
      jitterTimer = window.setTimeout(jitterStep, delay);
    };

    if (!reduceMotion) jitterStep();

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
    duration: number = 1.5,
  ) {
    this.#permanentEffects.clear();

    // Kill any existing timeline
    if (this.#currentTimeline) {
      this.#currentTimeline.kill();
    }

    // Kill any infinite animations
    gsap.killTweensOf(selector);

    const element = document.querySelector(selector) as HTMLElement;
    if (!element) return;

    // Remove grain overlay
    const grain = element.querySelector(".vfx-grain-overlay");
    if (grain) {
      gsap.to(grain, {
        opacity: 0,
        duration: duration * 0.5,
        onComplete: () => grain.remove(),
      });
    }

    // Smooth transition back to normal
    this.#currentTimeline = gsap.timeline();

    this.#currentTimeline
      // Remove box shadow first
      .to(element, {
        boxShadow: "none",
        duration: duration * 0.3,
        ease: "power1.inOut",
      })
      // Gradually restore normal appearance
      .to(
        element,
        {
          filter: "brightness(0.8) contrast(1.2) saturate(0.8)",
          duration: duration * 0.4,
          ease: "power2.inOut",
        },
        "-=0.1",
      )
      // Final clean state
      .to(element, {
        filter: "none",
        duration: duration * 0.3,
        ease: "power1.out",
      });
  }

  hasPermanentEffect(effectName: string): boolean {
    return this.#permanentEffects.has(effectName);
  }
}
