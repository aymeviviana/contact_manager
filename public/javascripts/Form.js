export default class Form {
  constructor(form) {
    this.formNode = form;
    this.formCancel = this.formNode.querySelector('#cancel');
    this.formContainer = form.parentElement;
    this.formInputs = this.formNode.querySelectorAll('.data');
    this.nameError = this.formNode.querySelector('#full_name_error');
    this.emailError = this.formNode.querySelector('#email_error');
    this.phoneError = this.formNode.querySelector('#phone_number_error');
    this.bindEvents();
  }

  bindEvents() {
    this.formInputs.forEach(input => {
      input.addEventListener('focusin', (event) => this.hideErrorMessage(event));
    });

    this.formCancel.addEventListener('click', () => this.reset());
  }

  show(node) {
    node.classList.replace('hide', 'show');
  }
  
  hide(node) { 
    node.classList.replace('show', 'hide');
  }

  updateFormValues(contactElement, title) { 
    let labels = ['full_name', 'phone_number', 'email', 'tags'];

    this.formNode.insertAdjacentHTML('afterbegin', title);
    this.formNode.method = "put";
    this.formNode.dataset.id = contactElement.dataset.id;
    labels.forEach(label => { 
      this.formNode.elements[label].value = contactElement.querySelector(`.${label}`).textContent;
    });
  }

  dataToJson(formData) { 
    let contact = {};
    for (const entry of formData.entries()) { 
      contact[entry[0]] = entry[1];
    }
    return contact;
  }

  dataValid(contact) { 
    let nameResult = this.nameValid(contact.full_name);
    let emailResult = this.emailValid(contact.email);
    let phoneResult = this.phoneValid(contact.phone_number);
  
    return [nameResult, emailResult, phoneResult].every(result => result);
  }

  nameValid(name) { 
    if (name.trim().length > 0) {
      return true;
    } else { 
      this.show(this.nameError);
      return false;
    }
  }

  emailValid(email) { 
    if (email.match(/^[\w\.-]+@[a-zA-Z\d\.-]+\.[a-zA-Z]{2,6}$/)) {
      return true;
    } else { 
      this.show(this.emailError);
      return false;
    }
  }

  phoneValid(phone) { 
    if (phone.match(/^(\+?1\s?)?(\(?\d{3}\)?[\s.-]?)?\d{3}[\s.-]?\d{4}$/)) {
      return true;
    } else { 
      this.show(this.phoneError);
      return false;
    }
  }

  hideErrorMessage(event) { 
    let input = event.target;
    let inputName = input.getAttribute('name');
    let error = this.formNode.querySelector(`#${inputName}_error`);
  
    if (error.classList.contains('show')) { 
      this.hide(error);
    }
  }

  reset() { 
    this.formNode.removeChild(this.formNode.querySelector('h3'));
    this.formNode.dataset.id = '';
    this.formNode.reset();
    this.formNode.method = "post";
    this.hideAllErrorMessages();
    this.hide(this.formContainer);
  }

  hideAllErrorMessages() { 
    this.formNode.querySelectorAll('.error').forEach(error => { 
      if (error.classList.contains('show')) { 
        this.hide(error); 
      }
    });
  }
}