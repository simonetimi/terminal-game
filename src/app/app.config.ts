import {
  ApplicationConfig,
  provideAppInitializer,
  provideBrowserGlobalErrorListeners,
  provideZonelessChangeDetection,
} from "@angular/core";
import { provideRouter } from "@angular/router";

import { routes } from "./app.routes";

import { provideTranslateService } from "@ngx-translate/core";
import { provideTranslateHttpLoader } from "@ngx-translate/http-loader";
import { provideHttpClient } from "@angular/common/http";
import { initializeTranslations } from "./translate.config";
import { ASSET_PATHS } from "./lib/constants";

export const appConfig: ApplicationConfig = {
  providers: [
    provideZonelessChangeDetection(),
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideHttpClient(),
    provideTranslateService({
      loader: provideTranslateHttpLoader({
        prefix: ASSET_PATHS.i18nPrefix,
        suffix: ASSET_PATHS.i18nSuffix,
      }),
    }),
    provideAppInitializer(initializeTranslations),
  ],
};
