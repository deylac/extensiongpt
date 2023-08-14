document.addEventListener('DOMContentLoaded', initializeOptionsPage);

function initializeOptionsPage() {
    
  const apiKeyInput = document.getElementById('api-key-input');
  const apiKeySaveBtn = document.getElementById('api-save-btn');
  const promptForm = document.getElementById('promptForm');
  const promptList = document.getElementById('promptList');
  const personaForm = document.getElementById('personaForm');
  const personaList = document.getElementById('personaList');
  let editPromptIndex = null;
  let editPersonaIndex = null;

document.getElementById("modelSelection").addEventListener("change", (event) => {
  chrome.storage.sync.set({ gptVersion: event.target.value }, () => {
    console.log(`Model set to ${event.target.value}`);
  });
});

  // API Key
  apiKeySaveBtn.addEventListener('click', saveApiKey);
  chrome.storage.sync.get(['apiKey'], (result) => apiKeyInput.value = result.apiKey || '');

  // Prompts
  promptForm.addEventListener('submit', handlePromptFormSubmit);
  loadPrompts(promptList);

  // Personas
  personaForm.addEventListener('submit', handlePersonaFormSubmit);
  loadPersonas(personaList);
chrome.storage.sync.get(['apiKey'], (result) => apiKeyInput.value = result.apiKey || '');
function saveApiKey() {
  const apiKey = apiKeyInput.value;
  if (apiKey) {
    chrome.storage.sync.set({ apiKey }, () => {
      alert('API key saved successfully.');
      apiKeyInput.value = '';
    });
  } else {
    alert('Please enter a valid API key.');
  }
}
  function loadPrompts(element) {
    chrome.storage.sync.get(['prompts'], (result) => {
      const prompts = result.prompts || [];
      renderPromptList(element, prompts);
    });
  }

  function renderPromptList(element, prompts) {
    element.innerHTML = '';
    prompts.forEach((prompt, index) => {
      const promptEl = document.createElement('div');
      promptEl.textContent = `${prompt.title}: ${prompt.content}`;

      // Edit button
      const editBtn = document.createElement('button');
      editBtn.textContent = 'Edit';
      editBtn.addEventListener('click', () => {
        editPrompt(index);
      });

      // Delete button
      const deleteBtn = document.createElement('button');
      deleteBtn.textContent = 'Delete';
      deleteBtn.addEventListener('click', () => {
        removePrompt(index);
      });

      promptEl.appendChild(editBtn); // Add edit button
      promptEl.appendChild(deleteBtn); // Add delete button
      element.appendChild(promptEl);
    });
  }

  function handlePromptFormSubmit(event) {
    event.preventDefault();

    const title = promptForm.elements['promptTitle'].value;
    const content = promptForm.elements['promptContent'].value;

    if (editPromptIndex !== null) {
      updatePrompt(editPromptIndex, title, content);
    } else {
      addPrompt(title, content);
    }
    promptForm.reset();
  }

  function addPrompt(title, content) {
    chrome.storage.sync.get(['prompts'], (result) => {
      const prompts = result.prompts || [];
      prompts.push({title, content});
      chrome.storage.sync.set({'prompts': prompts}, () => {
        loadPrompts(promptList);
      });
    });
  }

  function editPrompt(index) {
    chrome.storage.sync.get(['prompts'], (result) => {
      const prompts = result.prompts || [];
      const prompt = prompts[index];
      promptForm.elements['promptTitle'].value = prompt.title;
      promptForm.elements['promptContent'].value = prompt.content;
      editPromptIndex = index;
    });
  }

  function updatePrompt(index, title, content) {
    chrome.storage.sync.get(['prompts'], (result) => {
      const prompts = result.prompts || [];
      prompts[index] = {title, content};
      chrome.storage.sync.set({'prompts': prompts}, () => {
        loadPrompts(promptList);
        editPromptIndex = null;
      });
    });
  }

  function removePrompt(index) {
    chrome.storage.sync.get(['prompts'], (result) => {
      const prompts = result.prompts || [];
      prompts.splice(index, 1);
      chrome.storage.sync.set({'prompts': prompts}, () => {
        loadPrompts(promptList);
      });
    });
  }

  // New functions for handling personas
  function loadPersonas(element) {
    chrome.storage.sync.get(['personas'], (result) => {
      const personas = result.personas || [];
      renderPersonaList(element, personas);
    });
  }

  function renderPersonaList(element, personas) {
    element.innerHTML = '';
    personas.forEach((persona, index) => {
      const personaEl = document.createElement('div');
      personaEl.textContent = `${persona.title}: ${persona.content}`;

      // Edit button
      const editBtn = document.createElement('button');
      editBtn.textContent = 'Edit';
      editBtn.addEventListener('click', () => {
        editPersona(index);
      });

      // Delete button
      const deleteBtn = document.createElement('button');
      deleteBtn.textContent = 'Delete';
      deleteBtn.addEventListener('click', () => {
        removePersona(index);
      });

      personaEl.appendChild(editBtn); // Add edit button
      personaEl.appendChild(deleteBtn); // Add delete button
      element.appendChild(personaEl);
    });
  }
function saveGptVersion() {
  const gptVersion = gptVersionSelect.value;
  if (gptVersion) {
    chrome.storage.sync.set({ gptVersion }, () => {
      console.log('GPT Version saved successfully.');
    });
  }
}

function loadGptVersion() {
  chrome.storage.sync.get(['gptVersion'], (result) => {
    if (result.gptVersion) gptVersionSelect.value = result.gptVersion;
    else gptVersionSelect.value = 'gpt-3.5-turbo';  // Default to GPT-3.5 if not set
  });
}
  function handlePersonaFormSubmit(event) {
    event.preventDefault();

    const title = personaForm.elements['personaTitle'].value;
    const content = personaForm.elements['personaContent'].value;

    if (editPersonaIndex !== null) {
      updatePersona(editPersonaIndex, title, content);
    } else {
      addPersona(title, content);
    }
    personaForm.reset();
  }

  function addPersona(title, content) {
    chrome.storage.sync.get(['personas'], (result) => {
      const personas = result.personas || [];
      personas.push({title, content});
      chrome.storage.sync.set({'personas': personas}, () => {
        loadPersonas(personaList);
      });
    });
  }

  function editPersona(index) {
    chrome.storage.sync.get(['personas'], (result) => {
      const personas = result.personas || [];
      const persona = personas[index];
      personaForm.elements['personaTitle'].value = persona.title;
      personaForm.elements['personaContent'].value = persona.content;
      editPersonaIndex = index;
    });
  }

  function updatePersona(index, title, content) {
    chrome.storage.sync.get(['personas'], (result) => {
      const personas = result.personas || [];
      personas[index] = {title, content};
      chrome.storage.sync.set({'personas': personas}, () => {
        loadPersonas(personaList);
        editPersonaIndex = null;
      });
    });
  }

  function removePersona(index) {
    chrome.storage.sync.get(['personas'], (result) => {
      const personas = result.personas || [];
      personas.splice(index, 1);
      chrome.storage.sync.set({'personas': personas}, () => {
        loadPersonas(personaList);
      });
    });
  }
}