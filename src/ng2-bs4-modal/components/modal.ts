import { Component, OnDestroy, Input, Output, EventEmitter, ElementRef, HostBinding } from '@angular/core';
import { ModalInstance, ModalResult } from './modal-instance';

@Component({
    selector: 'modal',
    host: {
        'class': 'modal',
        'role': 'dialog',
        'tabindex': '-1'
    },
    template: `
        <div class="modal-dialog" [ngClass]="{ 'modal-sm': isSmall(), 'modal-lg': isLarge() }">
            <div class="modal-content">
                <ng-content></ng-content>
            </div>
        </div>
    `
})
export class ModalComponent implements OnDestroy {

    private overrideSize: string = null;

    instance: ModalInstance;
    visible: boolean = false;

    @Input() animation: boolean = true;
    @Input() backdrop: string | boolean = true;
    @Input() keyboard: boolean = true;
    @Input() size: string;
    @Input() onBeforeClose: Function;
    @Input() onBeforeDismiss: Function;
    @Input() onBeforeOpen: Function;

    @Output() onClose: EventEmitter<any> = new EventEmitter(false);
    @Output() onDismiss: EventEmitter<any> = new EventEmitter(false);
    @Output() onOpen: EventEmitter<any> = new EventEmitter(false);

    @HostBinding('class.fade') get fadeClass(): boolean { return this.animation; }
    @HostBinding('attr.data-keyboard') get dataKeyboardAttr(): boolean { return this.keyboard; }
    @HostBinding('attr.data-backdrop') get dataBackdropAttr(): string | boolean { return this.backdrop; }

    constructor(private element: ElementRef) {
        this.instance = new ModalInstance(this.element);

        this.instance.hidden.subscribe((result) => {
            this.visible = this.instance.visible;
            if (result === ModalResult.Dismiss)
                this.onDismiss.emit(undefined);
        });

        this.instance.shown.subscribe(() => {
            this.onOpen.emit(undefined);
        });
    }

    ngOnDestroy() {
        return this.instance && this.instance.destroy();
    }

    open(size?: string): Promise<void> {
        let result: boolean = true;
        if (this.onBeforeOpen) {
            result = this.onBeforeOpen();
        }

        if (result) {
            if (ModalSize.validSize(size)) this.overrideSize = size;
            return this.instance.open().then(() => {
                this.visible = this.instance.visible;
            });
        } else {
            return new Promise<void>((resolve, reject) => resolve());
        }
    }

    close(): Promise<void> {
        let result: boolean = true;
        if (this.onBeforeClose) {
            result = this.onBeforeClose();
        }

        if (result) {
            return this.instance.close().then(() => {
                this.onClose.emit(undefined);
            });
        } else {
            return new Promise<void>((resolve, reject) => resolve());
        }
        
    }

    dismiss(event): Promise<void> {
        event.preventDefault();
        event.stopPropagation();

        let result: boolean = true;
        if (this.onBeforeDismiss) {
            result = this.onBeforeDismiss();
        }

        if (result) {
            return this.instance.dismiss();
        } else {
            return new Promise<void>((resolve, reject) => resolve());
        }
    }

    public isSmall() {
        return this.overrideSize !== ModalSize.Large
            && this.size === ModalSize.Small
            || this.overrideSize === ModalSize.Small;
    }

    public isLarge() {
        return this.overrideSize !== ModalSize.Small
            && this.size === ModalSize.Large
            || this.overrideSize === ModalSize.Large;
    }
}

export class ModalSize {
    static Small = 'sm';
    static Large = 'lg';

    static validSize(size: string) {
        return size && (size === ModalSize.Small || size === ModalSize.Large);
    }
}
