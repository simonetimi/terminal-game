import { Injectable, isDevMode } from "@angular/core";
import gsap from "gsap";

@Injectable({ providedIn: "root" })
export class VfxService {
  play(effectName: string, options: any = {}) {
    const effects: Record<string, () => void> = {
      shake: () => this.#shake(options.selector || ".game-screen"),
      fadeIn: () =>
        this.#fadeIn(
          options.selector || ".game-screen",
          options.duration || 0.8,
        ),
      fadeOut: () =>
        this.#fadeOut(
          options.selector || ".game-screen",
          options.duration || 0.8,
        ),
      grayscale: () =>
        this.#grayscale(
          options.selector || ".game-screen",
          options.duration || 0.5,
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
    gsap.to(selector, { filter: "grayscale(100%)", duration });
  }
}
