import { TestBed } from '@angular/core/testing';

import { SfxService } from './sfx-service';

describe('SfxService', () => {
  let service: SfxService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SfxService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
