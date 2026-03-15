import { ComponentFixture, TestBed } from "@angular/core/testing";
import { provideHttpClient } from "@angular/common/http";
import { provideTranslateService } from "@ngx-translate/core";
import {
  CircleAlert,
  Download,
  LUCIDE_ICONS,
  LucideIconProvider,
  RotateCcw,
  Settings2,
  Upload,
} from "lucide-angular";

import { Settings } from "./settings";

describe("Settings", () => {
  let component: Settings;
  let fixture: ComponentFixture<Settings>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Settings],
      providers: [
        provideHttpClient(),
        provideTranslateService(),
        {
          provide: LUCIDE_ICONS,
          multi: true,
          useValue: new LucideIconProvider({
            Download,
            Upload,
            Settings2,
            RotateCcw,
            CircleAlert,
          }),
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(Settings);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
