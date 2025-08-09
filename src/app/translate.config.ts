import { TranslateService } from '@ngx-translate/core';
import { inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';

export function initializeTranslations(translate = inject(TranslateService)) {
  translate.setFallbackLang('en');
  return firstValueFrom(translate.use('en'));
}
