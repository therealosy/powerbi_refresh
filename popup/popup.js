const saveButton = document.querySelector("#saveButton");
const intervalInput = document.querySelector("#intervalInput");
const cycleBrowserTabsToggle = document.querySelector(
  "#cycleBrowserTabsToggle"
);
const powerBiUrlInput = document.querySelector("#powerBiUrlInput");

const DEFAULT_INTERVAL = 15;
const DEFAULT_TOGGLE = false;

let [interval, cycleBrowserTabs, powerBiBaseURL] = [
  DEFAULT_INTERVAL,
  DEFAULT_TOGGLE,
  "",
];

window.onload = async () => {
  let { interval, cycleBrowserTabs, powerBiBaseURL } =
    await chrome.storage.local.get([
      "interval",
      "cycleBrowserTabs",
      "powerBiBaseURL",
    ]);

  intervalInput.value = parseInt(interval);
  cycleBrowserTabsToggle.checked = cycleBrowserTabs;
  powerBiUrlInput.value = powerBiBaseURL;
};

saveButton.onclick = async (event) => {
  event.preventDefault();
  await chrome.storage.local.set({ interval, cycleBrowserTabs }).then(() => {
    console.log({ interval, cycleBrowserTabs });
  });
};

intervalInput.onchange = ({ target }) => {
  interval = parseInt(target.value);
  console.log(target.value);
};

cycleBrowserTabsToggle.onchange = ({ target }) => {
  cycleBrowserTabs = target.checked;
  console.log(target.checked);
};

powerBiUrlInput.onchange = ({ target }) => {
  powerBiBaseURL = target.value;
  console.log(target.value);
};
