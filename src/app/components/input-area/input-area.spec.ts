import { ComponentFixture, TestBed } from "@angular/core/testing";

import { InputArea } from "./input-area";

describe("InputArea", () => {
  let component: InputArea;
  let fixture: ComponentFixture<InputArea>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InputArea],
    }).compileComponents();

    fixture = TestBed.createComponent(InputArea);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
