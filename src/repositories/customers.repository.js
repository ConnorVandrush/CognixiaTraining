import Customer from "../schemas/customers.schema.js";

class CustomerRepository {
  findAll() {
    return Customer.find();
  }

  findById(id) {
    return Customer.findById(id);
  }

  findByEmail(email) {
    return Customer.findOne({ email });
  }

  create(data) {
    return Customer.create(data);
  }

  update(id, updates) {
    return Customer.findByIdAndUpdate(id, updates, { new: true });
  }

  delete(id) {
    return Customer.findByIdAndDelete(id);
  }
}

export default new CustomerRepository();
