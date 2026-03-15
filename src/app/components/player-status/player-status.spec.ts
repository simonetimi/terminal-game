import { ComponentFixture, TestBed } from "@angular/core/testing";
import { provideHttpClient } from "@angular/common/http";
import { provideTranslateService } from "@ngx-translate/core";

import { PlayerStatus } from "./player-status";

describe("PlayerStatus", () => {
  let component: PlayerStatus;
  let fixture: ComponentFixture<PlayerStatus>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PlayerStatus],
      providers: [provideHttpClient(), provideTranslateService()],
    }).compileComponents();

    fixture = TestBed.createComponent(PlayerStatus);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
