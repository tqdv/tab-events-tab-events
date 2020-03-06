/* eslint-disable no-console */

const html_log = document.getElementById('log');
const entry_template = document.getElementById('entry-template');

// Abbreviated event name => MDN page
const event_link_map = {
  't.onActivated': 'https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/tabs/onActivated',

  't.onAttached': 'https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/tabs/onAttached',
  't.onCreated': 'https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/tabs/onCreated',
  't.onDetached': 'https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/tabs/onDetached',
  't.onHighlighted': 'https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/tabs/onHighlighted',
  't.onMoved': 'https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/tabs/onMoved',
  't.onRemoved': 'https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/tabs/onRemoved',
  't.onReplaced': 'https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/tabs/onReplaced',
  't.onUpdated': 'https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/tabs/onUpdated',
  
  'w.onCreated': 'https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/windows/onCreated',
  'w.onRemoved': 'https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/windows/onRemoved',
  'w.onFocusChanged': 'https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/windows/onFocusChanged',
};

// Create a HH:MM:SS:iii timestamp
function create_timestamp() {
  const now = new Date();

  const hours = now.getHours().toString().padStart(2, '0');
  const minutes = now.getMinutes().toString().padStart(2, '0');
  const seconds = now.getSeconds().toString().padStart(2, '0');
  const millis = now.getMilliseconds().toString().padStart(3, '0');

  return `${hours}:${minutes}:${seconds}.${millis}`;
}

// Custom log function to display all fields in the page
function log(event_name, thing) {
  // Add to HTML
  const new_entry = entry_template.cloneNode(/* deep */ true);
  delete new_entry.id;
  new_entry.hidden = false;
  new_entry.classList.add(event_name.replace('.', '-'));
  new_entry.getElementsByClassName('timestamp')[0].textContent = create_timestamp();

  const event_link = document.createElement('a');
  event_link.href = event_link_map[event_name];
  event_link.target = '_blank';
  event_link.textContent = event_name;
  new_entry.getElementsByClassName('event')[0].append(event_link);


  new_entry.getElementsByClassName('entry-text')[0].textContent = thing.toString();

  html_log.insertAdjacentElement('afterbegin', new_entry);
}

/* Add event listeners to update the log */
// See https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/tabs#Events
// and https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/windows#Events

// NB: We ignore tabs.onZoomChange

// https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/tabs/onActivated
browser.tabs.onActivated.addListener(({ previousTabId, tabId, windowId }) => {
  let s = `Activated tab [${tabId}] in window [${windowId}]. `;
  if (previousTabId === undefined) {
    s += 'Previous tab was removed.';
  } else {
    s += `Previous tab was [${previousTabId}]`;
  }
  log('t.onActivated', s);
});

// https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/tabs/onAttached
browser.tabs.onAttached.addListener((tabId, { newWindowId, newPosition }) => {
  log('t.onAttached', `Tab [${tabId}] attached to window [${newWindowId}] at position [${newPosition}]`);
});

// https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/tabs/onCreated
browser.tabs.onCreated.addListener((tab) => {
  log('t.onCreated', `Created tab [${tab.id}] at position [${tab.index}] in window [${tab.windowId}]. See console for more details.`);
  console.log(tab);
});

// https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/tabs/onDetached
browser.tabs.onDetached.addListener((tabId, { oldWindowId, oldPosition }) => {
  log('t.onDetached', `Tab [${tabId}] detached from window [${oldWindowId}] at position [${oldPosition}]`);
});

// https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/tabs/onHighlighted
browser.tabs.onHighlighted.addListener(({ windowId, tabIds }) => {
  const tabs_string = tabIds.toString().replace(',', ', ');

  let s = `In window [${windowId}], `;
  if (tabIds.length === 1) {
    s += `tab [${tabs_string}] has been highlighted`;
  } else {
    s += `tabs [${tabs_string}] have been hightlighted`;
  }

  log('t.onHighlighted', s);
});

// https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/tabs/onMoved
browser.tabs.onMoved.addListener((tabId, { windowId, fromIndex, toIndex }) => {
  log('t.onMoved', `In window [${windowId}], tab moved from position [${fromIndex}] to position [${toIndex}]`);
});

// https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/tabs/onRemoved
browser.tabs.onRemoved.addListener((tabId, { windowId, isWindowClosing }) => {
  let s = `Removed tab [${tabId}] in window [${windowId}]`;
  if (isWindowClosing) {
    s += '. ';
    s += 'That window is now closing.';
  }
  log('t.onRemoved', s);
});

// https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/tabs/onReplaced
browser.tabs.onReplaced.addListener((addedTabId, removedTabId) => {
  log('t.onReplaced', `Tab [${addedTabId}] replaced tab [${removedTabId}]`);
});

// https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/tabs/onUpdated
browser.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  let change_string = '';
  // eslint-disable-next-line no-restricted-syntax
  for (const [key, value] of Object.entries(changeInfo)) {
    change_string += `${key} => ${value}`;
    change_string += ',';
  }
  change_string = change_string.slice(0, -1).replace(',', ', ');

  let s = `Tab [${tabId}] has been updated. `;
  s += `The following properties have changed: ${change_string}. `;
  s += 'See console for the new tab object.';

  log('t.onUpdated', s);
  console.log(tab);
});

// https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/windows/onCreated
browser.windows.onCreated.addListener((window) => {
  log('w.onCreated', `Created window [${window.id}] of type "${window.type}". See console for more details.`);
  console.log(window);
});

// https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/windows/onRemoved
browser.windows.onRemoved.addListener((windowId) => {
  log('w.onRemoved', `Removed window [${windowId}]`);
});

// https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/windows/onFocusChanged
browser.windows.onFocusChanged.addListener((windowId) => {
  if (windowId === -1) {
    log('w.onFocusChanged', `Focus left Firefox [-1]`);
  } else {
    log('w.onFocusChanged', `Focus changed to window [${windowId}]`);
  }
});
