export default class Contact { 
  constructor(data) { 
    this.id = Number(data.id) || undefined;
    this.full_name = data.full_name;
    this.email = data.email;
    this.phone_number = data.phone_number;
    this.tags = data.tags;
  }
}