// browserAction behaviour
browser.browserAction.setTitle({ title: 'Open tab events log' });
browser.browserAction.onClicked.addListener(() => {
  browser.tabs.create({ url: 'page.html' });
});
