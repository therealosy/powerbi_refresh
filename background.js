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

  tabList = [];
  tabs.forEach(({ id }) => {
    tabList.push(id);
  });
}

async function switchTabs() {
  try {
    await chrome.tabs.update(
      (tabId = tabList[activeTabIndex]),
      (updateProperties = { active: true })
    );
  } catch (error) {
    updateTabList();
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
    .then(() => {});
}

async function reloadActiveTab() {
  await chrome.tabs.reload((tabId = tabList[activeTabIndex])).then(() => {});
}

chrome.tabs.onCreated.addListener(async () => {
  if (IS_EXTENSION_DISABLED) return;
  try {
    await updateTabList();
  } catch (error) {
    await chrome.runtime?.reload();
  }
});

chrome.tabs.onRemoved.addListener(async (tabId, removeInfo) => {
  if (IS_EXTENSION_DISABLED) return;
  try {
    await updateTabList();
  } catch (error) {
    await chrome.runtime?.reload();
  }
});

chrome.tabs.onDetached.addListener(async (tabId, detachInfo) => {
  if (IS_EXTENSION_DISABLED) return;
  try {
    await updateTabList();
  } catch (error) {
    await chrome.runtime?.reload();
  }
});

chrome.tabs.onAttached.addListener(async (tabId, attachInfo) => {
  if (IS_EXTENSION_DISABLED) return;
  try {
    await updateTabList();
  } catch (error) {
    await chrome.runtime?.reload();
  }
});

chrome.tabs.onActivated.addListener(async ({ tabId, windowId }) => {
  activeTabIndex = tabList.indexOf(tabId);

  if (IS_EXTENSION_DISABLED) return;

  try {
    await reloadActiveTab();
  } catch (error) {
    await chrome.runtime?.reload();
  }
});

chrome.runtime.onInstalled.addListener(async (details) => {
  try {
    await initializeStorage();
    await updateTabList();
  } catch (error) {
    await chrome.runtime?.reload();
  }
});

chrome.runtime.onMessage.addListener(async (request, sender, sendResponse) => {
  if (IS_EXTENSION_DISABLED) return;

  const senderId = sender?.tab?.id;

  if (request === "switch-tabs" && senderId === tabList[activeTabIndex]) {
    sendResponse("Switching tabs");

    if (SHOULD_CYCLE_BROWSER_TABS) {
      activeTabIndex++;
      activeTabIndex %= tabList.length;

      switchTabs();
      return;
    }
    await reloadActiveTab();
  }
});

chrome.storage.onChanged.addListener(async (changes, areaName) => {
  let { isExtensionDisabled, shouldCycleBrowserTabs } = changes;

  if (shouldCycleBrowserTabs !== undefined)
    SHOULD_CYCLE_BROWSER_TABS = shouldCycleBrowserTabs?.newValue;

  if (isExtensionDisabled !== undefined) {
    IS_EXTENSION_DISABLED = isExtensionDisabled?.newValue;

    if (IS_EXTENSION_DISABLED) return;

    await updateTabList();
  }

  await reloadActiveTab();
});
