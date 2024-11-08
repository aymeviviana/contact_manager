import Contact from './Contact.js';
import Form from './Form.js';
import TagMenu from './TagMenu.js';

export default class ContactManager { 
  constructor(templates) { 
    this.templates = templates;
    this.addButtons = document.querySelectorAll('.add_contact');
    this.search = document.querySelector('#search');
    this.contactsContainer = document.querySelector('#contacts_container');
    this.contactsList = this.contactsContainer.querySelector('#contacts_list');
    this.noContactsMessage = this.contactsContainer.querySelector('#no_contacts');
    this.noMatchesMessage = this.contactsContainer.querySelector('#no_matches');
    this.form = new Form(document.querySelector('form'));
    this.tagMenu = new TagMenu(document.querySelector('#tag_menu'));
    this.allContacts = [];
    this.allTags = [];
    this.fetchAllContacts();
    this.bindEvents();
  }

  bindEvents() { 
    this.addButtons.forEach(btn => btn.addEventListener('click', (event) => this.showCreateContactForm(event)));
    this.form.formNode.addEventListener('submit', (event) => this.handleSubmit(event));
    this.contactsContainer.addEventListener('click', (event) => this.handleContainerClick(event));
    this.search.addEventListener('input', (event) => this.handleInput(event));
    this.tagMenu.tagMenuNode.addEventListener('change', (event) => this.handleMenuSelect(event));
  }
  
  async fetchAllContacts() { 
    try {
      let response = await fetch('/api/contacts');
  
      if (!response.ok) { 
        throw new Error(`${response.status} ${response.statusText}`);
      }
  
      let contactsArray = await response.json();
      let contactObjects = contactsArray.map(contact => new Contact(contact));
      this.allContacts = contactObjects;
      
      if (this.allContacts.length > 0) { 
        this.renderContacts(this.allContacts);
      }
  
      this.fetchAllTags();

    } catch (error){ 
      console.log(`Encountered an error! ${error.message}`);
    }
  }

  fetchAllTags() { 
    this.allTags = this.tagMenu.getAllTags(this.allContacts);
    let tagsHTML = this.templates.options({ options: this.allTags });
    this.tagMenu.clearTags();
    this.tagMenu.renderTags(tagsHTML);
  }

  updateContacts() { 
    this.clearContacts();
    this.renderContacts(this.allContacts);
  }

  showCreateContactForm(event) { 
    this.form.formNode.insertAdjacentHTML('afterbegin', this.templates.form_title({form_title: "Create Contact"}));
    this.form.show(this.form.formContainer);
  }

  show(node) { 
    node.classList.replace('hide', 'show'); 
  }

  hide(node) {
    node.classList.replace('show', 'hide'); 
  }

  handleSubmit(event) { 
    event.preventDefault();

    let formData = new FormData(this.form.formNode);
    let contactData = this.form.dataToJson(formData);
    let contactID = Number(this.form.formNode.dataset.id);

    if (contactID) {
      contactData.id = contactID;
    }

    if (!this.form.dataValid(contactData)) { 
      return;
    }

    let method = this.form.formNode.getAttribute('method');
    let json = JSON.stringify(contactData);
  
    let options = {
      method: method,
      body: json,
      headers: { "Content-Type": "application/json; charset=UTF-8" },
    };

    if (method === 'post') {
      this.addContact('/api/contacts', options);
    } else if (method === 'put') {
      this.editContact(`/api/contacts/${contactID}`, contactID, options);
    }
  }

  handleContainerClick(event) { 
    let element = event.target;
    let contactElement = element.closest('.contact');

    if (element.classList.contains('delete_contact')) {
      if (confirm('Do you want to delete the contact?')) {
        this.deleteContact(Number(contactElement.dataset.id));
      }
    } else if (element.classList.contains('edit_contact')) {
      let title = this.templates.form_title({form_title: 'Edit Contact'});
      this.form.updateFormValues(contactElement, title);
      this.form.show(this.form.formContainer);
    }
  }

  resetTagMenu() {     
    if (!(this.tagMenu.tagMenuNode.value === "All")) { 
      this.tagMenu.tagMenuNode.value = 'All';
    }
  }

  handleInput(event) { 
    this.resetTagMenu();

    let query = this.search.value;
    let filteredContacts = this.getContactsByQuery(query);
    this.clearContacts();

    if (filteredContacts.length === 0 && query.length === 0) { 
      this.hideNoMatchesMessage();
    } else if (filteredContacts.length === 0) {
      this.showNoMatchesMessage();
      this.updateNoMatchesMessage(query);
      return;
    } else { 
      this.hideNoMatchesMessage();
      this.renderContacts(filteredContacts);
    }
  }

  resetSearchValue() { 
    if (this.search.value) { 
      this.search.value = "";
    }
  }

  handleMenuSelect(event) { 
    this.resetSearchValue();
    let selectedTag = event.target.value;
    
    if (selectedTag === "All") { 
      this.clearContacts();
      this.renderContacts(this.allContacts);
      return;
    }

    let filteredContacts = this.getContactsByTag(selectedTag);
    this.clearContacts();
    this.renderContacts(filteredContacts);
  }

  getContactsByTag(selectedTag) { 
    return this.allContacts.filter(contact => { 
      let tags = contact.tags.split(",").map(tag => tag.toLowerCase().trim());
      return tags.includes(selectedTag.toLowerCase());
    });
  }

  getContactsByQuery(query) { 
    return this.allContacts.filter(contact => { 
      return contact.full_name.toLowerCase().startsWith(query.toLowerCase());
    });
  }

  showNoMatchesMessage() { 
    if (this.noMatchesMessage.classList.contains('hide')) {
      this.show(this.noMatchesMessage);
    }
  }

  updateNoMatchesMessage(query) { 
    let message = this.noMatchesMessage.querySelector('p');
    if (this.noMatchesMessage.contains(message)) { 
      this.noMatchesMessage.innerHTML = "";
    }
    this.noMatchesMessage.insertAdjacentHTML('beforeend', this.templates.no_matches_message({query: query}));
  }

  hideNoMatchesMessage() { 
    if (this.noMatchesMessage.classList.contains('show')) {
      this.hide(this.noMatchesMessage);
    }
  }

  async addContact(url, options) { 
    try {
      let response = await fetch(url, options);
  
      if (!response.ok) { 
        throw new Error(`${response.status} ${response.statusText}`);
      }
  
      let contactData = await response.json();
      this.allContacts.push(new Contact(contactData));
      this.fetchAllTags();
      this.updateContacts();
      this.form.reset();
      
    } catch (error) { 
      console.log(`Encountered an error! ${error.message}`)
    }
  }

  async editContact(url, contactID, options) { 
    try {
      let response = await fetch(url, options);
      
      if (!response.ok) {
        throw new Error(`${response.status} ${response.statusText}`);
      }
  
      let contactData = await response.json();
      let contactIndex = this.getContactIndex(contactID);
      this.allContacts.splice(contactIndex, 1, new Contact(contactData));
      this.fetchAllTags();
      this.updateContacts();
      this.form.reset();

    } catch (error) { 
      console.log(`Encountered an error! ${error.message}`)
    }
  }

  getContactIndex(contactID) { 
    return this.allContacts.findIndex(contact => contact.id === contactID);
  }

  async deleteContact(contactID) { 
    try {
      let response = await fetch(`/api/contacts/${contactID}`, { method: 'DELETE' }); 
  
      if (!response.ok) {
        throw new Error(`${response.status} ${response.statusText}`);
      } 
  
      let contactIndex = this.getContactIndex(contactID);
      this.allContacts.splice(contactIndex, 1);
      this.fetchAllTags();
      this.updateContacts();
  
      if (this.noContactsAvailable()) {
        this.show(this.noContactsMessage);
      }
    } catch (error) { 
      console.log(`Encountered an error! ${error.message}`);
    }
  }

  clearContacts() { 
    let contact = this.contactsContainer.querySelector('.contact');

    while (this.contactsContainer.contains(contact)) { 
      contact.remove();
      contact = this.contactsContainer.querySelector('.contact');
    }
  }

  renderContacts(contacts) { 
    this.hide(this.noContactsMessage);
    this.contactsList.insertAdjacentHTML('beforeend', this.templates.contacts({contacts: contacts}));
  }

  noContactsAvailable() { 
    return this.contactsContainer.querySelectorAll('.contact').length === 0;
  }
}