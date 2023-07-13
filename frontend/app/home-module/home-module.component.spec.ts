import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HomeModuleComponent } from './home-module.component';

describe('QuizzComponent', () => {
  let component: HomeModuleComponent;
  let fixture: ComponentFixture<HomeModuleComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [HomeModuleComponent]
    });
    fixture = TestBed.createComponent(HomeModuleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
