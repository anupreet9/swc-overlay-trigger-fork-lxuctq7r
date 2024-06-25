// By Najika Yoo @najikahalsema

import {
  LitElement,
  html,
  TemplateResult,
render,
} from "lit";
import {
  customElement
} from 'lit/decorators.js';
import "@spectrum-web-components/overlay/overlay-trigger.js";
import "@spectrum-web-components/button/sp-button.js";
import "@spectrum-web-components/popover/sp-popover.js";
import "@spectrum-web-components/tooltip/sp-tooltip.js";
import "@spectrum-web-components/slider/sp-slider.js";
import "@spectrum-web-components/dialog/sp-dialog.js";
import "@spectrum-web-components/tooltip/sp-tooltip.js";
import { Overlay, OverlayOptionsV1, VirtualTrigger } from "node_modules/@spectrum-web-components/overlay/src";
import { Button } from "node_modules/@spectrum-web-components/button/src";

export interface PopoverLocation {
    top: number;
    left: number;
    width: number;
    height: number;
}

@customElement("my-overlay")
export default class MyOverlay extends LitElement {
 
    private _closeOverlayPromise?: Promise<() => void>;

  newVirtualTrigger(location: PopoverLocation) {
        const { left, top, width, height } = location;
        // To position our popover correctly we'd ideally pass in its trigger button.
        // Because it lives in an iframe, passing the element in directly comes
        // with some issues. Instead we can pass in this VirtualTrigger that
        // uses the same position and dimensions as the original button
        const virtualTrigger = new VirtualTrigger(left, top);
        virtualTrigger.getBoundingClientRect = () => {
            return new DOMRect(left, top, width, height);
        };

        return virtualTrigger;
    }

    openOverlay(
    owner: HTMLElement,
    template: TemplateResult,
    options: OverlayOptionsV1 = {}
): Promise<() => void> {
    const fragment = document.createDocumentFragment();
    render(template, fragment);

    const overlayElement = fragment.children[0] as HTMLElement;
    return Overlay.open(owner, "modal", overlayElement, options);
}


    protected _openOverlay = async () => {
      const button = this.shadowRoot.querySelector("sp-button") as Button;
const location:PopoverLocation = { top : button.getBoundingClientRect().top,
                  left: button.getBoundingClientRect().left, 
                  width: button.getBoundingClientRect().width,
                  height: button.getBoundingClientRect().height};
        const virtualTrigger = this.newVirtualTrigger(location);

        this._closeOverlayPromise = this.openOverlay(
            this as unknown as HTMLElement,
            this._renderPopover(),
            {
                placement: "top",
                receivesFocus: "auto",
                virtualTrigger
            }
        );
    };

    protected _closeOverlay = async () => {

        if (this._closeOverlayPromise) {
            (await this._closeOverlayPromise)();
            this._closeOverlayPromise = undefined;
            // this._gneissPopoverStore.closeLinkButtonDialog();
        }
    };

    protected _onCancel = async () => {
        await this._closeOverlay();
    };

    protected _renderContents(slot?: string) {
        return html`
        <sp-slider
                     value="5"
                     step="0.5"
                     min="0"
                     max="20"
                     label="Awesomeness"
                     editable
                  ></sp-slider>
                  <sp-button>Press me</sp-button>`;
    }

    onButtonClick() {
      void this._openOverlay();
    }

    protected _renderPopover(): TemplateResult {
        return html`
            <sp-popover size="m" @sp-overlay-closed=${this._onCancel}>
                ${this._renderContents()}
            </sp-popover>
        `;
    }

  protected render(): TemplateResult {
    return html`
          <sp-button variant="primary" style="position:absolute;bottom:50px" @click=${this.onButtonClick}>Button popover</sp-button>
          ${this._renderPopover()}
    `;
  }
}
