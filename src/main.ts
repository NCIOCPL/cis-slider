/**
 * @file This is the main import, and the file that will be called from launch.
 *
 * The purpose of this file is to inject a NCIDS/USWDS button into that page that
 * will stick to the right side of the page and allow a user to click it. When the
 * user clicks the button, a modal will appear that will give information on how to
 * contact the Cancer Information Service (CIS).
 */

// HTML Content of the modal dialog.
import content from './slider.html?raw';
// Styles to inject for the slider button and modal content.
import css from './slider.scss?inline';

// Import USA Modal component from the NCIDS.
import { USAModal } from '@nciocpl/ncids-js/usa-modal';

/**
 * Defines the possible causes for closing a modal.
 * These values should match the ones defined in the USAModal component.
 * (Used for Analytics tracking.)
 */
enum ModalCloseActions {
	/** The modal was closed by clicking the X button. */
	CloseButton = 'close',
	/** The modal was closed by clicking outside the modal. */
	OutsideModal = 'outside',
	/** The modal was closed because the user interacted with one of the buttons. */
	ClickedButton = 'ButtonClick',
	/** The modal was closed by pressing the escape key. */
	EscapeKey = 'escape',
	/** Neither of the two methods. Probably escape. */
	Other = 'other',
}

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

// Function to track Other events to the EDDL data layer.
// (Used for Analytics tracking.)
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

// Creates and injects the button element into the page
// that is used to open the "Questions?" cis slider modal.
const createButtonElement = (): void => {
	const buttonText = document.createElement('span');
	buttonText.textContent = 'Questions?';

	const button = document.createElement('button');
	//button.href = '#cis-slider-modal';
	button.classList.add('usa-button', 'usa-button--slider-button', 'usa-button--nci-icon');

	button.appendChild(buttonText);
	button.addEventListener('click', () => {
		trackOther('ButtonClick', 'Button Click', button.innerText);
	});
	document.body.appendChild(button);

	// Track display of the button.
	trackOther('Display', 'Display');
};

// Create USA Modal (Empty for now, content will be injected later).
const createEmptyModal = (): USAModal => {
	const modal = USAModal.createConfig({
		id: 'cis-slider-modal',
		forced: false,
		modifier: '',
	});
	return modal;
};

// Injects the content into the modal dialog.
const injectModalContent = (modal: USAModal): void => {
	// Create modal content from parsed HTML.
	const parser = new DOMParser();
	const dialog = parser.parseFromString(content, 'text/html');
	modal.updateDialog({
		title: 'Have Questions?',
		content: dialog.body.children[0] as HTMLElement,
	});
};

// Adds event handlers to the modal for analytics tracking.
// Analytics tracking listens for CustomEvents from the modal instance.
const addModalCloseEventHandlers = () => {
	// Analytics tracking which listens for modal close event.
	document.addEventListener('usa-modal:close', (e) => {
		const eventDetail = (e as CustomEvent).detail;
		switch (eventDetail.closeAction) {
			case ModalCloseActions.CloseButton:
				trackOther('ModalDismissClick', 'Modal Dismiss', 'X Button');
				break;
			case ModalCloseActions.OutsideModal:
				trackOther('ModalDismissClick', 'Modal Dismiss', 'Outside Modal');
				break;
			case ModalCloseActions.EscapeKey:
				trackOther('ModalDismissClick', 'Modal Dismiss', 'Escape Key');
				break;
			default:
				break;
		}
	});
};

// Add the Analytics event handlers to the modal and its elements.
// This is called after the modal is opened to ensure the content is present.
const addModalContentEventHandlers = (modalInstance: USAModal) => {
	const modalElement = modalInstance.getModalElement() as HTMLElement;
	// Analytics tracking for chat and email buttons within the modal content.
	const buttons = Array.from(modalElement.querySelectorAll('.cis-slider-contents__button-row a')) as HTMLElement[];
	// For each button in the modal, add click listener for analytics tracking.
	for (const link of buttons) {
		link.addEventListener('click', (e) => {
			trackOther('ModalLinkClick', 'Modal Link Click', link.dataset.cisAnalyticsBtn);
			if (link.dataset.cisAnalyticsBtn === 'Chat') {
				window.open('https://livehelp.cancer.gov/app/chat/chat_launch', 'LiveHelp', 'scrollbars=yes,resizable=yes,menubar=yes,toolbar=yes,location=yes,width=650,height=600');
				e.preventDefault();
			}
			// Close the modal after handling button interaction.
			modalInstance.handleModalClose(e);
		});
	}

	// Long press tracking for phone number - ish. So let's keep track if the context menu
	// for the text is opened.
	//https://developer.mozilla.org/en-US/docs/Web/API/Element/contextmenu_event
	modalElement.querySelector('.cis-slider-contents__phone span')?.addEventListener('contextmenu', () => {
		trackOther('ModalLinkClick', 'Modal Link Click', 'Phone');
	});

	// On IOS phone number text is turned into a tel: link for free. So let's listen for
	// a click of a link.
	modalElement.querySelector('.cis-slider-contents__phone span')?.addEventListener('click', (event) => {
		if (event.target instanceof HTMLAnchorElement) {
			trackOther('ModalLinkClick', 'Modal Link Click', 'Phone');
		}
	});
};

// Inject slider styles.
const sliderStyles = document.createElement('style');
document.head.appendChild(sliderStyles);
sliderStyles.appendChild(document.createTextNode(css));

// Initialize function to set up the CIS Questions slider button
// and accompanying modal.
const initCisSliderWithModal = () => {
	// Create "Questions?" button and the modal it opens.
	createButtonElement();
	const modal = createEmptyModal();
	injectModalContent(modal);

	// Add event handler to open the modal when the button is clicked.
	const questionButton = document.querySelector('.usa-button--slider-button') as HTMLElement;
	questionButton.addEventListener('click', (e) => {
		modal.handleModalOpen(e);
	});

	// Add analytics event handlers.
	addModalCloseEventHandlers();
	addModalContentEventHandlers(modal);
};

if (document.readyState === 'loading') {
	document.addEventListener('DOMContentLoaded', initCisSliderWithModal, { once: true });
} else {
	initCisSliderWithModal();
}
