let tabList = [];
let activeTabIndex = 0;

const DEFAULT_INTERVAL = 15;
const DEFAULT_POWERBI_BASE_URL =
  "https://iswlos-powerbi.interswitchng.com/PowerBIReports/powerbi/BackBone/Group%20Core%20Operations/";
let IS_EXTENSION_DISABLED = true;
let SHOULD_CYCLE_BROWSER_TABS = false;

async function updateTabList() {
  const tabs = await chrome.tabs.query({
    lastFocusedWindow: true,
  });

  tabs.forEach(({ id }) => {
    tabList.push(id);
  });
  console.log(tabList);
}

async function switchTabs() {
  try {
    await chrome.tabs.update(
      (tabId = tabList[activeTabIndex]),
      (updateProperties = { active: true })
    );
  } catch (error) {
    console.log(error);
  }
}

async function initializeStorage() {
  let [interval, shouldCycleBrowserTabs, powerBiBaseURL, isExtensionDisabled] =
    [
      DEFAULT_INTERVAL,
      SHOULD_CYCLE_BROWSER_TABS,
      DEFAULT_POWERBI_BASE_URL,
      IS_EXTENSION_DISABLED,
    ];
  await chrome.storage.local
    .set({
      interval,
      shouldCycleBrowserTabs,
      powerBiBaseURL,
      isExtensionDisabled,
    })
    .then(() => {
      console.log("After setting:", {
        interval,
        shouldCycleBrowserTabs,
        powerBiBaseURL,
        isExtensionDisabled,
      });
    });
}

chrome.tabs.onCreated.addListener(async () => {
  if (IS_EXTENSION_DISABLED) return;

  console.log("new tab created");
  try {
    await updateTabList();
  } catch (error) {
    console.log(error);
  }
});

chrome.tabs.onRemoved.addListener(async (tabId, removeInfo) => {
  if (IS_EXTENSION_DISABLED) return;

  console.log("tab removed", tabId);
  try {
    await updateTabList();
  } catch (error) {
    console.log(error);
  }
});

chrome.tabs.onDetached.addListener(async (tabId, detachInfo) => {
  if (IS_EXTENSION_DISABLED) return;

  console.log("tab detached", tabId);
  try {
    await updateTabList();
  } catch (error) {
    console.log(error);
  }
});

chrome.tabs.onAttached.addListener(async (tabId, attachInfo) => {
  if (IS_EXTENSION_DISABLED) return;

  console.log("tab attached", tabId);
  try {
    await updateTabList();
    switchTabs();
  } catch (error) {
    console.log(error);
  }
});

chrome.tabs.onActivated.addListener(async ({ tabId, windowId }) => {
  if (IS_EXTENSION_DISABLED) return;

  console.log("activeId", tabId);
  try {
    await chrome.tabs.reload((tabId = tabId)).then(() => {
      console.log("Reloading Tab");
    });
    activeTabIndex = tabList.indexOf(tabId);
  } catch (error) {
    console.log(error);
  }
});

chrome.runtime.onInstalled.addListener(async (details) => {
  console.log("installed because", details.reason);
  try {
    await initializeStorage();
    await updateTabList();
    // switchTabs();
  } catch (error) {
    console.log(error);
  }
});

chrome.runtime.onMessage.addListener(async (request, sender, sendResponse) => {
  console.log("is dis", IS_EXTENSION_DISABLED);
  if (IS_EXTENSION_DISABLED) return;

  if (request == "switch-tabs") {
    if (!SHOULD_CYCLE_BROWSER_TABS) {
      await chrome.tabs.reload((tabId = tabList[activeTabIndex])).then(() => {
        console.log("Reloading Tab");
      });
      return;
    }
    activeTabIndex++;
    activeTabIndex %= tabList.length;

    switchTabs();

    sendResponse("Switching tabs");
  }
});

chrome.storage.onChanged.addListener(async (changes, areaName) => {
  let { isExtensionDisabled, shouldCycleBrowserTabs } = changes;

  if (isExtensionDisabled !== undefined) {
    IS_EXTENSION_DISABLED = isExtensionDisabled?.newValue;
  }

  if (shouldCycleBrowserTabs != undefined) {
    SHOULD_CYCLE_BROWSER_TABS = shouldCycleBrowserTabs?.newValue;
  }
});
