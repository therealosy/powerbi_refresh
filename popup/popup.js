const extensionToggle = document.querySelector("#extensionToggle");
const saveButton = document.querySelector("#saveButton");
const intervalInput = document.querySelector("#intervalInput");
const cycleBrowserTabsToggle = document.querySelector(
  "#cycleBrowserTabsToggle"
);
const powerBiUrlInput = document.querySelector("#powerBiUrlInput");

let INTERVAL = (DEFAULT_INTERVAL = 15);
let POWERBI_BASE_URL = "";
let SHOULD_CYCLE_BROWSER_TABS = false;
let IS_EXTENSION_DISABLED = true;

window.onload = async () => {
  await chrome.storage.local
    .get([
      "interval",
      "shouldCycleBrowserTabs",
      "powerBiBaseURL",
      "isExtensionDisabled",
    ])
    .then(
      ({
        interval,
        shouldCycleBrowserTabs,
        powerBiBaseURL,
        isExtensionDisabled,
      }) => {
        INTERVAL = interval;
        SHOULD_CYCLE_BROWSER_TABS = shouldCycleBrowserTabs;
        POWERBI_BASE_URL = powerBiBaseURL;
        IS_EXTENSION_DISABLED = isExtensionDisabled;

        intervalInput.value = parseInt(interval);
        cycleBrowserTabsToggle.checked = SHOULD_CYCLE_BROWSER_TABS;
        powerBiUrlInput.value = POWERBI_BASE_URL;
        console.log("is_dis", IS_EXTENSION_DISABLED);
        updatePopupStyles();
      }
    );
};

saveButton.onclick = async (event) => {
  event.preventDefault();
  await chrome.storage.local
    .set({
      interval: INTERVAL,
      shouldCycleBrowserTabs: SHOULD_CYCLE_BROWSER_TABS,
      powerBiBaseURL: POWERBI_BASE_URL,
    })
    .then(() => {
      console.log({
        INTERVAL,
        SHOULD_CYCLE_BROWSER_TABS,
        POWERBI_BASE_URL,
      });
    });
};

intervalInput.onchange = ({ target }) => {
  INTERVAL = parseInt(target.value);
  console.log(target.value);
};

cycleBrowserTabsToggle.onchange = ({ target }) => {
  SHOULD_CYCLE_BROWSER_TABS = target.checked;
  console.log(target.checked);
};

powerBiUrlInput.onchange = ({ target }) => {
  POWERBI_BASE_URL = target.value;
  console.log(target.value);
};

extensionToggle.onclick = async (event) => {
  event.preventDefault();
  IS_EXTENSION_DISABLED = !IS_EXTENSION_DISABLED;
  await chrome.storage.local
    .set({ isExtensionDisabled: IS_EXTENSION_DISABLED })
    .then(() => {
      console.log("ext toggle", {
        IS_EXTENSION_DISABLED,
      });
      updatePopupStyles();
    });
};

function updatePopupStyles() {
  console.log("style", IS_EXTENSION_DISABLED);
  extensionToggle.classList = IS_EXTENSION_DISABLED ? "disabled" : "enabled";
  extensionToggle.textContent = IS_EXTENSION_DISABLED ? "Turn On" : "Turn Off";
}
