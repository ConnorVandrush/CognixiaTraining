export default class Customer {
  constructor({
    id,
    firstName,
    lastName,
    email,
    phone,
    address,
    isActive = true,
    createdAt = new Date(),
  }) {
    this.id = id; // UUID or DB-generated
    this.firstName = firstName;
    this.lastName = lastName;
    this.email = email;
    this.phone = phone;
    this.address = address;
    this.isActive = isActive;
    this.createdAt = createdAt;
  }
}
