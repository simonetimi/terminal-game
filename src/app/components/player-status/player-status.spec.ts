import { ComponentFixture, TestBed } from "@angular/core/testing";

import { PlayerStatus } from "./player-status";

describe("PlayerStatus", () => {
  let component: PlayerStatus;
  let fixture: ComponentFixture<PlayerStatus>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PlayerStatus],
    }).compileComponents();

    fixture = TestBed.createComponent(PlayerStatus);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
