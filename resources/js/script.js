'use strict';
const eventModal = document.getElementById('event_modal');
const modal = bootstrap.Modal.getOrCreateInstance(eventModal);
const eventSaveButton = document.getElementById('save_button');
const eventCloseButton = document.getElementById('close_button');
const forms = document.querySelectorAll('.needs-validation')
const eventForm = document.getElementById('event_form');
const eventModality = document.getElementById('event_modality');
const eventLocationContainer = document.getElementById('event_location_container');
const eventRemoteUrlContainer = document.getElementById('event_remote_url_container');
const eventLocation = document.getElementById('event_location');
const eventRemoteUrl = document.getElementById('event_remote_url');
let events = [];
let editingEvent = null;
let editingEventCard = null;

eventForm.addEventListener("submit", saveEvent);
eventModal.addEventListener("hidden.bs.modal", resetForm);

function resetForm() {
	eventForm.reset();
	updateLocationOptions();
	eventForm.classList.remove('was-validated')
}

function saveEvent(event) {
	event.preventDefault();
	if (!eventForm.checkValidity()) {
		eventForm.classList.add('was-validated')
		return;
	}
	/* Form is valid */
	
	/* Add/save event */
	const formData = new FormData(eventForm);
	const formValues = Object.fromEntries(formData);
	if (editingEvent != null) {
		editingEvent = formValues; /* Update values of editingEvent */
		editEventCard();
		events[editingEventCard.id] = formValues;
		editingEvent = null;
		editingEventCard = null;
	} else {
		events.push(formValues);
		addEventToCalendarUI(formValues);
	}

	/* Close & reset form */
	modal.hide();
}


function updateLocationOptions() {
	if (eventModality.value == "Remote") {
		eventLocationContainer.classList.add('d-none');
		eventLocation.required = false;
		eventLocation.value = null;
		eventRemoteUrlContainer.classList.remove('d-none');
		eventRemoteUrl.required = true;
	} else {
		eventLocationContainer.classList.remove('d-none');
		eventLocation.required = true;
		eventRemoteUrlContainer.classList.add('d-none');
		eventRemoteUrl.required = false;
		eventRemoteUrl.value = null;
	}
}

function createEventCard(eventDetails) {
	const parentElement = document.createElement('div');
	parentElement.className = 'event row border rounded m-1 py-1 ' + eventDetails.category;
	parentElement.addEventListener('click', updateEvent);
	parentElement.id = events.length - 1;
	const descElement = document.createElement('div');
	const nameElement = document.createElement('h3');

	nameElement.textContent = eventDetails.name;

	descElement.innerText = eventDetails.category       + '\n'
	                      + eventDetails.time           + '\n'
	                      + eventDetails.modality       + " @ "
	                      + (eventDetails.location   != "" ?
	                           (eventDetails.location   + '\n\n') : "")
	                      + (eventDetails.remote_url != "" ?
	                           (eventDetails.remote_url + '\n\n') : "")
	                      + eventDetails.attendees;

	parentElement.appendChild(nameElement);
	parentElement.appendChild(descElement);
	return parentElement;
}

function addEventToCalendarUI(eventInfo) {
	/* Append event card to weekday column */
	document.getElementById(eventInfo.weekday)
	        .appendChild(createEventCard(eventInfo));
}

function editEventCard() {
	const old_event = events[editingEventCard.id];
	/* Weekday was changed */
	if (editingEvent.weekday !== old_event.weekday) {
		document.getElementById(old_event.weekday)
		        .removeChild(editingEventCard);
		document.getElementById(editingEvent.weekday)
		        .appendChild(editingEventCard);
	}

	/* Category was changed */
	if (editingEvent.category !== old_event.category) {
		editingEventCard.classList.remove(old_event.category);
		editingEventCard.classList.add(editingEvent.category);
	}
	editingEventCard.getElementsByTagName('h3')[0].textContent = editingEvent.name;

	editingEventCard.getElementsByTagName('div')[0].innerText
	                       = editingEvent.category       + '\n'
	                       + editingEvent.time           + '\n'
	                       + editingEvent.modality       + " @ "
	                       + (editingEvent.location   != "" ?
	                         	(editingEvent.location   + '\n\n') : "")
	                       + (editingEvent.remote_url != "" ?
	                            (editingEvent.remote_url + '\n\n') : "")
	                       + editingEvent.attendees;
}

function isNum(str) {
	return str !== "" && !isNaN(Number(str));
}

function updateEvent(clickEvent) {
	/* Set editingEventCard to the parent event container */
	if (isNum(clickEvent.target.id)) {
		editingEventCard = clickEvent.target;
	} else {
		editingEventCard = clickEvent.target.parentElement;
	}
	editingEvent = events[Number(editingEventCard.id)];

	/* Copy event values into form */
	for (const [key, value] of Object.entries(editingEvent)) {
		eventForm[key].value = value;
	}
	updateLocationOptions();
	modal.show();
}
