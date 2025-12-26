import { inject, Injectable } from "@angular/core";
import { SfxService } from "./sfx-service";
import { VfxService } from "./vfx-service";
import { GameNode } from "../models/game-state";

@Injectable({ providedIn: "root" })
export class EffectsManagerService {
  #vfxService = inject(VfxService);
  #sfxService = inject(SfxService);

  playNodeEffects(node: GameNode) {
    // play audio if specified, else play blip
    if (node.sfx) {
      this.#sfxService.playAudio(node.sfx);
    } else {
      this.#sfxService.playAudio("blip");
    }

    // play visual effect if specified
    if (node.vfx) {
      this.#vfxService.play(node.vfx);
    }
  }

  clearEffects() {
    this.#vfxService.removeEffects();
  }
}
