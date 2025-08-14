import { TestBed } from '@angular/core/testing';

import { VfxService } from './vfx-service';

describe('VfxService', () => {
  let service: VfxService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(VfxService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
