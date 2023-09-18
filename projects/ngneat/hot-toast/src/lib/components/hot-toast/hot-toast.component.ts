import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  EventEmitter,
  Injector,
  Input,
  NgZone,
  OnChanges,
  OnDestroy,
  OnInit,
  Output,
  Renderer2,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { DynamicViewModule, isComponent, isTemplateRef } from '@ngneat/overview';

import { ENTER_ANIMATION_DURATION, EXIT_ANIMATION_DURATION } from '../../constants';
import { HotToastRef } from '../../hot-toast-ref';
import { CreateHotToastRef, HotToastClose, Toast, ToastConfig } from '../../hot-toast.model';
import { animate } from '../../utils';
import { IndicatorComponent } from '../indicator/indicator.component';
import { AnimatedIconComponent } from '../animated-icon/animated-icon.component';

@Component({
  selector: 'hot-toast',
  templateUrl: 'hot-toast.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [CommonModule, DynamicViewModule, IndicatorComponent, AnimatedIconComponent],
})
export class HotToastComponent implements OnInit, AfterViewInit, OnDestroy, OnChanges {
  @Input() toast: Toast<unknown>;
  @Input() offset = 0;
  @Input() defaultConfig: ToastConfig;
  @Input() toastRef: CreateHotToastRef<unknown>;

  @Output() height = new EventEmitter<number>();
  @Output() beforeClosed = new EventEmitter();
  @Output() afterClosed = new EventEmitter<HotToastClose>();

  @ViewChild('hotToastBarBase') private toastBarBase: ElementRef<HTMLElement>;

  isManualClose = false;
  context: Record<string, any>;
  toastComponentInjector: Injector;

  private unlisteners: VoidFunction[] = [];

  constructor(private injector: Injector, private renderer: Renderer2, private ngZone: NgZone) {}

  get toastBarBaseHeight() {
    return this.toastBarBase.nativeElement.offsetHeight;
  }

  get containerPositionStyle() {
    const top = this.toast.position.includes('top');
    const verticalStyle = top ? { top: 0 } : { bottom: 0 };

    const horizontalStyle = this.toast.position.includes('left')
      ? {
          left: 0,
        }
      : this.toast.position.includes('right')
      ? {
          right: 0,
        }
      : {
          left: 0,
          right: 0,
          justifyContent: 'center',
        };
    return {
      transform: `translateY(${this.offset * (top ? 1 : -1)}px)`,
      ...verticalStyle,
      ...horizontalStyle,
    };
  }

  get toastBarBaseStyles() {
    const top = this.toast.position.includes('top');

    const enterAnimation = `hotToastEnterAnimation${
      top ? 'Negative' : 'Positive'
    } ${ENTER_ANIMATION_DURATION}ms cubic-bezier(0.21, 1.02, 0.73, 1) forwards`;

    const exitAnimation = `hotToastExitAnimation${
      top ? 'Negative' : 'Positive'
    } ${EXIT_ANIMATION_DURATION}ms forwards cubic-bezier(0.06, 0.71, 0.55, 1) ${this.toast.duration}ms`;

    const animation = this.toast.autoClose ? `${enterAnimation}, ${exitAnimation}` : enterAnimation;

    return { ...this.toast.style, animation };
  }

  get isIconString() {
    return typeof this.toast.icon === 'string';
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.toast && !changes.toast.firstChange && changes.toast.currentValue?.message) {
      requestAnimationFrame(() => {
        this.height.emit(this.toastBarBase.nativeElement.offsetHeight);
      });
    }
  }

  ngOnInit() {
    if (isTemplateRef(this.toast.message)) {
      this.context = { $implicit: this.toastRef };
    }
    if (isComponent(this.toast.message)) {
      this.toastComponentInjector = Injector.create({
        providers: [
          {
            provide: HotToastRef,
            useValue: this.toastRef,
          },
        ],
        parent: this.toast.injector || this.injector,
      });
    }
  }

  ngAfterViewInit() {
    const nativeElement = this.toastBarBase.nativeElement;
    // Caretaker note: accessing `offsetHeight` triggers the whole layout update.
    // Macro tasks (like `setTimeout`) might be executed within the current rendering frame and cause a frame drop.
    requestAnimationFrame(() => {
      this.height.emit(nativeElement.offsetHeight);
    });

    // Caretaker note: `animationstart` and `animationend` events are event tasks that trigger change detection.
    // We'd want to trigger the change detection only if it's an exit animation.
    this.ngZone.runOutsideAngular(() => {
      this.unlisteners.push(
        // Caretaker note: we have to remove these event listeners at the end (even if the element is removed from DOM).
        // zone.js stores its `ZoneTask`s within the `nativeElement[Zone.__symbol__('animationstart') + 'false']` property
        // with callback that capture `this`.
        this.renderer.listen(nativeElement, 'animationstart', (event: AnimationEvent) => {
          if (this.isExitAnimation(event)) {
            this.ngZone.run(() => this.beforeClosed.emit());
          }
        }),
        this.renderer.listen(nativeElement, 'animationend', (event: AnimationEvent) => {
          if (this.isExitAnimation(event)) {
            this.ngZone.run(() => this.afterClosed.emit({ dismissedByAction: this.isManualClose, id: this.toast.id }));
          }
        })
      );
    });

    this.setToastAttributes();
  }

  close() {
    this.isManualClose = true;
    const top = this.toast.position.includes('top');

    const exitAnimation = `hotToastExitAnimation${
      top ? 'Negative' : 'Positive'
    } ${EXIT_ANIMATION_DURATION}ms forwards cubic-bezier(0.06, 0.71, 0.55, 1)`;

    const nativeElement = this.toastBarBase.nativeElement;

    animate(nativeElement, exitAnimation);
  }

  ngOnDestroy() {
    this.close();
    while (this.unlisteners.length) {
      this.unlisteners.pop()();
    }
  }

  private isExitAnimation(ev: AnimationEvent) {
    return ev.animationName.includes('hotToastExitAnimation');
  }

  private setToastAttributes() {
    const toastAttributes: Record<string, string> = this.toast.attributes;
    for (const [key, value] of Object.entries(toastAttributes)) {
      this.renderer.setAttribute(this.toastBarBase.nativeElement, key, value);
    }
  }
}
