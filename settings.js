/* global Logger */
// Handles settings

function new_default_settings() {
  const default_settings = {
    favicon: 'icons/icon.plain.svg',
    new_entry_timeout: 100,
    ignore_unfocus: false,
  };

  return default_settings;
}

// Apply settings to the document
function apply_settings(settings) {
  if (settings.favicon) {
    const selected = document.querySelector(`input[name="favicon"][value="${settings.favicon}"]`);
    if (selected) {
      selected.checked = true;
    }
  }

  if (settings.new_entry_timeout) {
    document.getElementById('new_entry_timeout').value = settings.new_entry_timeout;
  }

  if (settings.ignore_unfocus) {
    document.getElementById('ignore_unfocus').checked = settings.ignore_unfocus;
  }
}

// Process settings to apply their changes
function process_settings(settings) {
  if (settings.favicon) {
    const elt = document.querySelector('link[rel="shortcut icon"]');
    elt.href = settings.favicon;
  }

  if (settings.new_entry_timeout > 0) {
    Logger.new_entry_timeout = settings.new_entry_timeout;
  }

  if (settings.ignore_unfocus !== undefined) {
    Logger.ignore_unfocus = settings.ignore_unfocus;
  }
}

async function load_settings() {
  let settings = await browser.storage.local.get();
  settings = { ...new_default_settings(), ...settings };
  await browser.storage.local.set(settings);

  apply_settings(settings);
}

/* Setup listeners */

// Radio inputs
document.querySelectorAll('input[type="radio"]').forEach((e) => {
  e.addEventListener('change', async (event) => {
    if (event.target.checked) {
      const settings = await browser.storage.local.get();
      settings[event.target.name] = event.target.value;

      process_settings(settings);
      await browser.storage.local.set(settings);
    }
  });
});

// Checkbox inputs
document.querySelectorAll('input[type="checkbox"]').forEach((elt) => {
  elt.addEventListener('change', async (event) => {
    const settings = await browser.storage.local.get();
    settings[event.target.name] = event.target.checked;

    process_settings(settings);
    await browser.storage.local.set(settings);
  });
});

// Number inputs
document.querySelectorAll('input[type="number"]').forEach((e) => {
  e.addEventListener('change', async (event) => {
    const settings = await browser.storage.local.get();
    settings[event.target.name] = event.target.value;

    process_settings(settings);
    await browser.storage.local.set(settings);
  });
});

// Clear log button
document.getElementById('clear-log').addEventListener('click', () => {
  const entry_groups = document.getElementsByClassName('entry-group');
  while (entry_groups.length > 0) {
    entry_groups[0].remove();
  }
});

load_settings()
  .then(Logger.start_logging);
