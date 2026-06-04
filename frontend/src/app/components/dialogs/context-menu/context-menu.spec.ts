import { ComponentFixture, TestBed } from '@angular/core/testing';
import { userEvent } from 'vitest/browser';

import { ContextMenu } from './context-menu';
import { eventsSpy } from '@/../test/mockServices';
import { UserEvents } from '@/services/user-events';
import { mockEventSimple } from '@/../test/mocks';

describe('ContextMenu', () => {
  let component: ContextMenu;
  let fixture: ComponentFixture<ContextMenu>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ContextMenu],
      providers: [{ provide: UserEvents, useValue: eventsSpy }],
    }).compileComponents();

    fixture = TestBed.createComponent(ContextMenu);
    component = fixture.componentInstance;
    eventsSpy.eventWithContextMenuOpen.current.set(mockEventSimple.id);
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should contain 2 menu items', () => {
    expect(component.contextMenuItems.length).toBe(2);
  });

  it('should open the event edit dialog when Edit menu is selected and close self', () => {
    component.contextMenuItems[0].command!({});

    expect(eventsSpy.eventWithEditMenuOpen()).toBe(mockEventSimple.id);
    expect(eventsSpy.eventWithContextMenuOpen.current()).toBeNull();
  });

  it('should delete event via service, emit remove event and close self', () => {
    const onRemoveEventSpy = vi.spyOn(component.onRemoveEvent, 'emit');

    component.contextMenuItems[1].command!({});

    expect(eventsSpy.removeEvent).toHaveBeenCalledWith(mockEventSimple.id);
    expect(onRemoveEventSpy).toHaveBeenCalledWith(mockEventSimple.id);
  });

  it('should close if users clicks outside component', async () => {
    await userEvent.click(fixture.nativeElement.parentElement);

    expect(eventsSpy.eventWithContextMenuOpen.current()).toBeNull();
  });

  afterEach(() => {
    eventsSpy.eventWithContextMenuOpen.current.set(null);
  });
});
