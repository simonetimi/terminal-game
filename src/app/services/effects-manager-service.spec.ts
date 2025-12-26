import { TestBed } from '@angular/core/testing';

import { EffectsManagerService } from './effects-manager-service';

describe('EffectsManagerService', () => {
  let service: EffectsManagerService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(EffectsManagerService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
