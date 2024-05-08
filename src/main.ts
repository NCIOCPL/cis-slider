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
	const button = document.createElement('a');
	button.href = '#cis-slider-modal';
	button.classList.add('usa-button', 'usa-button--slider-button');
	button.textContent = 'Have Questions?';
	button.setAttribute('data-modal-open', '');
	button.setAttribute('aria-controls', 'cis-slider-modal');
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
