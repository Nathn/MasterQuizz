import { TestBed } from '@angular/core/testing';

import { WebsocketsService } from './websockets.service';

describe('WebsocketsService', () => {
  let service: WebsocketsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(WebsocketsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
