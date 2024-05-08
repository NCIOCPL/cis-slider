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

	const button = document.createElement('a');
	button.href = '#cis-slider-modal';
	button.classList.add('usa-button', 'usa-button--slider-button', 'usa-button--nci-icon');
	button.setAttribute('data-modal-open', '');
	button.setAttribute('aria-controls', 'cis-slider-modal');

	button.appendChild(buttonIcon);
	button.appendChild(buttonText);
	document.body.appendChild(button);

	// Inject modal dialog.
	const parser = new DOMParser();
	const dialog = parser.parseFromString(content, 'text/html');
	document.body.appendChild(dialog.body);

	const target = document.body;
	modal.on(target);
};

if (document.readyState === 'loading') {
	document.addEventListener('DOMContentLoaded', initComponents, { once: true });
} else {
	initComponents();
}
