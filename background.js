async function updateTabList() {
  const tabs = await chrome.tabs.query({
    lastFocusedWindow: true,
  });

  let tabList = [];
  tabs.forEach(({ id }) => {
    tabList.push(id);
  });

  await chrome.storage.local.set({ tabList });
}

async function switchTabs(tabId) {
  try {
    await chrome.tabs.update(
      (tabId = tabId),
      (updateProperties = { active: true })
    );
  } catch (error) {
    updateTabList();
    console.log(error);
  }
}

async function initializeStorage() {
  const interval = 15;
  const powerBiBaseURL =
    "Change ME!!";
  const isExtensionDisabled = true;
  const shouldCycleBrowserTabs = false;

  await chrome.storage.local.set({
    interval,
    shouldCycleBrowserTabs,
    powerBiBaseURL,
    isExtensionDisabled,
  });
}

async function reloadActiveTab() {
  const { activeTabIndex, tabList } = await chrome.storage.local.get([
    "tabList",
    "activeTabIndex",
  ]);
  await chrome.tabs.reload((tabId = tabList[activeTabIndex]));
}

chrome.tabs.onCreated.addListener(async () => {
  try {
    await updateTabList();
  } catch (error) {
    console.log(error);
    // await chrome.runtime?.reload();
  }
});

chrome.tabs.onRemoved.addListener(async (tabId, removeInfo) => {
  try {
    await updateTabList();
  } catch (error) {
    console.log(error);
    // await chrome.runtime?.reload();
  }
});

chrome.tabs.onDetached.addListener(async (tabId, detachInfo) => {
  try {
    await updateTabList();
  } catch (error) {
    console.log(error);
    // await chrome.runtime?.reload();
  }
});

chrome.tabs.onAttached.addListener(async (tabId, attachInfo) => {
  try {
    await updateTabList();
  } catch (error) {
    // await chrome.runtime?.reload();
    console.log(error);
  }
});

chrome.tabs.onActivated.addListener(async ({ tabId, windowId }) => {
  await updateTabList();
  const { tabList, isExtensionDisabled } = await chrome.storage.local.get([
    "tabList",
    "isExtensionDisabled",
  ]);

  let activeTabIndex = tabList.indexOf(tabId);

  await chrome.storage.local.set({ activeTabIndex });

  if (isExtensionDisabled) return;

  try {
    await reloadActiveTab();
  } catch (error) {
    console.log(error);
    // await chrome.runtime?.reload();
  }
});

chrome.runtime.onInstalled.addListener(async (details) => {
  try {
    await initializeStorage();
    await updateTabList();
  } catch (error) {
    console.log(error);
    await chrome.runtime?.reload();
  }
});

chrome.runtime.onMessage.addListener(async (request, sender, sendResponse) => {
  let { activeTabIndex, tabList, shouldCycleBrowserTabs, isExtensionDisabled } =
    await chrome.storage.local.get([
      "tabList",
      "activeTabIndex",
      "shouldCycleBrowserTabs",
      "isExtensionDisabled",
    ]);

  if (isExtensionDisabled) return;

  const isSenderActive = sender?.tab.id === tabList[activeTabIndex];

  if (request === "switch-tabs" && isSenderActive) {
    sendResponse({ response: "Switching tabs" });

    if (shouldCycleBrowserTabs) {
      activeTabIndex++;
      activeTabIndex %= tabList.length;

      const tabId = tabList[activeTabIndex];

      await switchTabs(tabId);
      await chrome.storage.local.set({ activeTabIndex });

      return;
    }
    await reloadActiveTab();
  }
});

chrome.storage.onChanged.addListener(async (changes, areaName) => {
  let { tabList, activeTabIndex } = changes;

  if (tabList !== undefined || activeTabIndex !== undefined) return;

  await updateTabList();
  await reloadActiveTab();
});
