import { TranslateService } from "@ngx-translate/core";
import { inject } from "@angular/core";
import { firstValueFrom } from "rxjs";
import { environment } from "@environments/environment.development";

export function initializeTranslations(translate = inject(TranslateService)) {
  return firstValueFrom(translate.use(environment.language));
}
