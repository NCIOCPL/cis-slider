/**
 * @file This is the main import, and the file that will be called from launch.
 *
 * The purpose of this file is to inject a NCIDS/USWDS button into that page that
 * will stick to the right side of the page and allow a user to click it. When the
 * user clicks the button, a modal will appear that will give information on how to
 * contact the Cancer Information Service (CIS).
 */

import content from './slider.html?raw';
import css from './slider.scss?inline';

import modal from '@uswds/uswds/js/usa-modal';

/**
 * Defines the possible Event-driven Data Layer (EDDL) Event Types.
 */
enum EDDLEventTypes {
	/** Other is used for a click-type events event (i.e. s.tl) */
	Other = 'Other',
}

/**
 * The common properties for an EDDL event data.
 */
type EDDLEventData = {
	/** The Event Type */
	type: EDDLEventTypes;
};

/**
 * The properties of an Other event.
 */
type EDDLOtherEventData = EDDLEventData & {
	/** The name of the event as used in Launch */
	event: string;
	/** The name of the link as used in debugging */
	linkName: string;
	/** The data for the event.  */
	data: object;
};

//Defines the EDDL Object on the window
declare global {
	interface Window {
		/** Defines the EDDL data layer queue on the window. */
		NCIDataLayer: {
			/**
			 * Pushes an event on the EDDL queue
			 * @param eventData The data for the event.
			 */
			push(eventData: EDDLOtherEventData): void;
		};
	}
}

const trackOther = (eventName: string, action: string, actionDetails?: string) => {
	window.NCIDataLayer = window.NCIDataLayer || [];

	const eventLinkName = `CISQuestionsButton:${eventName}`;
	window.NCIDataLayer.push({
		type: EDDLEventTypes.Other,
		event: eventLinkName,
		linkName: eventLinkName,
		data: {
			launchableName: 'CIS Questions Button',
			action,
			actionDetails,
		},
	});
};

/**
 * Defines the possible causes for closing a modal.
 */
enum ModalCloseCause {
	/** The modal was closed by clicking the X button */
	XButton = 'XButton',
	/** The modal was closed by clicking outside the modal */
	OutsideModal = 'OutsideModal',
	/** Neither of the two methods. Probably escape. */
	Other = 'Other',
}

// Inject slider styles.
const sliderStyles = document.createElement('style');
document.head.appendChild(sliderStyles);
sliderStyles.appendChild(document.createTextNode(css));

// Modal initialization.
const initComponents = () => {
	// Inject button
	const buttonText = document.createElement('span');
	buttonText.textContent = 'Questions?';

	const buttonIcon = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
	buttonIcon.setAttribute('width', '24');
	buttonIcon.setAttribute('height', '24');
	buttonIcon.classList.add('usa-icon');
	buttonIcon.setAttribute('role', 'img');
	buttonIcon.setAttribute('aria-hidden', 'true');
	const iconPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
	iconPath.setAttribute('d', `M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 17h-2v-2h2v2zm2.07-7.75-.9.92C13.45 12.9 13 13.5 13 15h-2v-.5c0-1.1.45-2.1 1.17-2.83l1.24-1.26c.37-.36.59-.86.59-1.41 0-1.1-.9-2-2-2s-2 .9-2 2H8c0-2.21 1.79-4 4-4s4 1.79 4 4c0 .88-.36 1.68-.93 2.25z`);
	buttonIcon.appendChild(iconPath);

	const button = document.createElement('button');
	//button.href = '#cis-slider-modal';
	button.classList.add('usa-button', 'usa-button--slider-button', 'usa-button--nci-icon');
	button.setAttribute('data-modal-open', '');
	button.setAttribute('aria-controls', 'cis-slider-modal');

	button.appendChild(buttonIcon);
	button.appendChild(buttonText);
	button.addEventListener('click', () => {
		trackOther('ButtonClick', 'Button Click', button.innerText);
	});
	document.body.appendChild(button);

	// Inject modal dialog.
	const parser = new DOMParser();
	const dialog = parser.parseFromString(content, 'text/html');
	const modalContents = document.body.appendChild(dialog.body);

	// Analytics tracking for chat and email buttons.
	const buttons = Array.from(modalContents.querySelectorAll('.cis-slider-contents__button-row a')) as HTMLElement[];
	for (const link of buttons) {
		link.addEventListener('click', () => {
			trackOther('ModalLinkClick', 'Modal Link Click', link.dataset.cisAnalyticsBtn);
		});
	}

	// Long press tracking for phone number - ish. So let's keep track if the context menu
	// for the text is opened.
	//https://developer.mozilla.org/en-US/docs/Web/API/Element/contextmenu_event
	modalContents.querySelector('.cis-slider-contents__phone span')?.addEventListener('contextmenu', () => {
		trackOther('ModalLinkClick', 'Modal Link Click', 'Phone');
	});

	// On IOS phone number text is turned into a tel: link for free. So let's listen for
	// a click of a link.
	modalContents.querySelector('.cis-slider-contents__phone span')?.addEventListener('click', (event) => {
		if (event.target instanceof HTMLAnchorElement) {
			trackOther('ModalLinkClick', 'Modal Link Click', 'Phone');
		}
	});

	// Setup state tracking for our mutation checking. USWDS does not offer any custom
	// events to know if the modal was closed, so we must make a mutation observer to
	// watch for the modal to hide/show.
	const modalState = {
		isDisplaying: false,
		closeCause: ModalCloseCause.Other,
	};

	// This tracks click of the modal close button as we can be 100 sure it is the
	// cause of the modal to close. The mutation observer below will actually handle
	// the analytics tracking.
	modalContents.querySelector('.usa-modal__close')?.addEventListener('click', () => {
		modalState.closeCause = ModalCloseCause.XButton;
	});

	// Turn on the USWDS modal.
	const target = document.body;
	modal.on(target);

	// The modal code actually moves the ID of the modal to a wrapper div. So we
	// need to go get the element for this to add the mutation observer.
	const modalWrapper = document.getElementById('cis-slider-modal');

	// The modal overlay that covers the page can be clicked on to dismiss. The overlay
	// is a child of the overall modal wrapper. So we are adding a clickListener.
	modalWrapper?.querySelector('.usa-modal-overlay')?.addEventListener(
		'click',
		(event) => {
			// This can fire if the X button is clicked because that sits over the modal.
			if (event.currentTarget === event.target) {
				modalState.closeCause = ModalCloseCause.OutsideModal;
			}
		},
		{ capture: true }
	);

	const observer = new MutationObserver((mutations) => {
		for (const mutation of mutations) {
			if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
				const target = mutation.target as HTMLElement;
				const isVisible = target.classList.contains('is-visible');

				if (modalState.isDisplaying !== isVisible) {
					if (isVisible) {
						// No tracking on display.
						modalState.isDisplaying = true;
					} else {
						trackOther('ModalDismissClick', 'Dismiss Click', modalState.closeCause === ModalCloseCause.XButton ? 'X button' : modalState.closeCause === ModalCloseCause.OutsideModal ? 'Outside Modal' : 'Other');
						modalState.closeCause = ModalCloseCause.Other;
						modalState.isDisplaying = false;
					}
				}
			}
		}
	});

	if (modalWrapper) {
		observer.observe(modalWrapper, {
			attributes: true,
			attributeFilter: ['class'],
		});
	}

	// Track analytics for the display of the button.
	trackOther('Display', 'Display');
};

if (document.readyState === 'loading') {
	document.addEventListener('DOMContentLoaded', initComponents, { once: true });
} else {
	initComponents();
}
