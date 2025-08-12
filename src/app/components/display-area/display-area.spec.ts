import { ComponentFixture, TestBed } from "@angular/core/testing";

import { DisplayArea } from "./display-area";

describe("DisplayArea", () => {
  let component: DisplayArea;
  let fixture: ComponentFixture<DisplayArea>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DisplayArea],
    }).compileComponents();

    fixture = TestBed.createComponent(DisplayArea);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
