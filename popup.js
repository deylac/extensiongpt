document.addEventListener('DOMContentLoaded', () => {
  const selectedTextEl = document.getElementById('selected-text');
  const generateBtn = document.getElementById('generate');
  const copyBtn = document.getElementById('copy');
  const emailBtn = document.getElementById('email');
  const generatedContentEl = document.getElementById('generatedContent');
  const promptSelectEl = document.getElementById('promptSelect');
  const personaSelectEl = document.getElementById('personaSelect');
  const managePromptsBtn = document.getElementById('manage-prompts');

  managePromptsBtn.addEventListener('click', () => {
    chrome.runtime.openOptionsPage();
  });

  // Load prompts
  chrome.storage.sync.get(['prompts'], (result) => {
    const prompts = result.prompts || [];
    prompts.forEach((prompt) => {
      const optionEl = document.createElement('option');
      optionEl.value = prompt.content;
      optionEl.textContent = prompt.title;
      promptSelectEl.appendChild(optionEl);
    });
  });

  // Load personas
  chrome.storage.sync.get(['personas'], (result) => {
    const personas = result.personas || [];
    personas.forEach((persona) => {
      const optionEl = document.createElement('option');
      optionEl.value = persona.content;
      optionEl.textContent = persona.title;
      personaSelectEl.appendChild(optionEl);
    });
  });

  generateBtn.addEventListener('click', () => {
    const selectedText = selectedTextEl.value.trim();
    if (selectedText === '') {
      showError('Please select some text on the web page.');
      return;
    }
    const selectedPromptContent = promptSelectEl.value.trim();
    if (selectedPromptContent === '') {
      showError('Please select a prompt.');
      return;
    }
    const selectedPersonaContent = personaSelectEl.value.trim();
    if (selectedPersonaContent === '') {
      showError('Please select a persona.');
      return;
    }

    const prompt = {
      title: promptSelectEl.options[promptSelectEl.selectedIndex].textContent,
      content: selectedPromptContent,
    };
    const persona = {
      title: personaSelectEl.options[personaSelectEl.selectedIndex].textContent,
      content: selectedPersonaContent,
    };

    generateContent(selectedText, prompt, persona).then((generatedContent) => {
      generatedContentEl.value = generatedContent;
      copyBtn.disabled = false;
      emailBtn.disabled = false;
    });
  });

  copyBtn.addEventListener('click', () => {
    copyToClipboard(generatedContentEl.value);
  });

  emailBtn.addEventListener('click', () => {
    sendByEmail(generatedContentEl.value);
  });

  chrome.storage.sync.get(['selectedText'], (result) => {
    if (result.selectedText) {
      selectedTextEl.value = result.selectedText;
    }
  });
});

async function generateContent(selectedText, prompt, persona) {
  const [apiKey, gptVersion] = await Promise.all([
    new Promise((resolve) => {
      chrome.storage.sync.get(['apiKey'], (result) => {
        resolve(result.apiKey);
      });
    }),
    new Promise((resolve) => {
      chrome.storage.sync.get(['gptVersion'], (result) => {
        resolve(result.gptVersion || 'gpt-3.5');  // Default to GPT-3.5 if not set
      });
    }),
  ]);

  if (!apiKey) {
    showError('Please save your API key in the options page.');
    return '';
  }

 const response = await fetch('https://api.openai.com/v1/chat/completions', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${apiKey}`,
  },
  body: JSON.stringify({
    model: 'gpt-4',
    messages: [
      {
        role: 'system',
        content: `I want you to answer to this content: "${selectedText}" as ${persona.content}`,
      },
      { role: 'user', content: prompt.content },
      { role: 'assistant', content: prompt.content },
    ],
    temperature: 0.9,
  }),
});

  if (!response.ok) {
    const error = await response.json();
    showError(`Error: ${error.message || 'Unable to generate content.'}`);
    return '';
  }

  const data = await response.json();
  const generatedContent = data.choices[0].message.content;
  return generatedContent.trim();
}

function showError(message) {
  const errorEl = document.getElementById('error');
  errorEl.textContent = message;
}

function copyToClipboard(text) {
  const tempArea = document.createElement('textarea');
  tempArea.value = text;
  document.body.appendChild(tempArea);
  tempArea.select();
  document.execCommand('copy');
  document.body.removeChild(tempArea);
}

async function sendByEmail(content) {
  const mailToURL = `mailto:?subject=Generated Content&body=${encodeURIComponent(content)}`;
  await chrome.tabs.create({ url: mailToURL });
}