export default class TagMenu { 
  constructor(tagMenu) { 
    this.tagMenuNode = tagMenu;
  }

  getAllTags(contacts) { 
    let uniqueTags = [];

    contacts.forEach(contact => { 
      let newTags = contact.tags.split(",").map(tag => tag.trim());
      let existingTags = uniqueTags.map(uniqueTag => uniqueTag.toLowerCase());
      
      newTags.forEach(newTag => { 
        if (!existingTags.includes(newTag.toLowerCase()) && newTag.length > 0) { 
          uniqueTags.push(newTag);
        }
      });
    });

    let allTags = uniqueTags.sort().map(tag => ({tag: tag}));
    return allTags;
  }

  renderTags(tagsHTML) { 
    this.tagMenuNode.insertAdjacentHTML('beforeend', tagsHTML);
  }

  clearTags() { 
    let lastElementChild = this.tagMenuNode.lastElementChild;
  
    while (!lastElementChild.hasAttribute('selected')) {
      this.tagMenuNode.removeChild(lastElementChild);
      lastElementChild = this.tagMenuNode.lastElementChild;
    }
  }
}
