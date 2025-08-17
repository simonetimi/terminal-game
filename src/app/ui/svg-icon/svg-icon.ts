import { Component, computed, inject, input } from "@angular/core";
import { httpResource } from "@angular/common/http";
import { DomSanitizer } from "@angular/platform-browser";

@Component({
  selector: "app-svg-icon",
  imports: [],
  templateUrl: "./svg-icon.html",
  styleUrl: "./svg-icon.css",
})
export class SvgIcon {
  #domSanitizer = inject(DomSanitizer);
  iconUrl = input.required<string>();
  svgClass = input<string>("");

  svgResource = httpResource.text(() => this.iconUrl());

  sanitizedSvg = computed(() =>
    this.#domSanitizer.bypassSecurityTrustHtml(this.svgResource.value() ?? ""),
  );
}
