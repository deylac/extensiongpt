chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: 'generateContent',
    title: 'Generate content with ChatGPT',
    contexts: ['selection'],
  });
});
chrome.storage.sync.get(["model"], (result) => {
  const selectedModel = result.model || "gpt-3.5-turbo"; // Use GPT-3.5 by default if the model is not set in the storage
  // Include the selectedModel variable in your API request
});
chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === 'generateContent') {
    chrome.storage.sync.set({ selectedText: info.selectionText }, () => {
      chrome.scripting.executeScript({
        target: { tabId: tab.id },
        files: ['contentScript.js'],
      }, () => {
        if (chrome.runtime.lastError) {
          console.error(chrome.runtime.lastError);
        }
      });
    });
  }
});