import { ComponentFixture, TestBed } from "@angular/core/testing";
import { provideHttpClient } from "@angular/common/http";
import { provideTranslateService } from "@ngx-translate/core";

import { DisplayArea } from "./display-area";

describe("DisplayArea", () => {
  let component: DisplayArea;
  let fixture: ComponentFixture<DisplayArea>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DisplayArea],
      providers: [provideHttpClient(), provideTranslateService()],
    }).compileComponents();

    fixture = TestBed.createComponent(DisplayArea);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
