import ContactManager from './ContactManager.js';

document.addEventListener('DOMContentLoaded', event => {
  const templates = {};

  let handlebarsTemplates = document.querySelectorAll("script[type='text/x-handlebars']");
  handlebarsTemplates.forEach(template => templates[template.id] = Handlebars.compile(template.innerHTML));
  
  let partials = document.querySelectorAll("script[data-type='partial']");
  partials.forEach(partial => Handlebars.registerPartial(partial.id, partial.innerHTML));
  
  new ContactManager(templates);
});