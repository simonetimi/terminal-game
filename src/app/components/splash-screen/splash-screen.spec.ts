import { ComponentFixture, TestBed } from "@angular/core/testing";
import { provideHttpClient } from "@angular/common/http";
import { provideTranslateService } from "@ngx-translate/core";

import { SplashScreen } from "./splash-screen";

describe("SplashScreen", () => {
  let component: SplashScreen;
  let fixture: ComponentFixture<SplashScreen>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SplashScreen],
      providers: [provideHttpClient(), provideTranslateService()],
    }).compileComponents();

    fixture = TestBed.createComponent(SplashScreen);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
