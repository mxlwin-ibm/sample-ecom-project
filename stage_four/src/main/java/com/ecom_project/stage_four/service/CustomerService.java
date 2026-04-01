package com.ecom_project.stage_four.service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.ecom_project.stage_four.exception.CustomerAlreadyExistsException;
import com.ecom_project.stage_four.exception.CustomerNotFoundException;
import com.ecom_project.stage_four.model.Customer;
import com.ecom_project.stage_four.repository.CustomerRepository;

@Service
public class CustomerService {
    private final CustomerRepository customerRepository;

    public CustomerService(CustomerRepository customerRepository){
        this.customerRepository = customerRepository;
    }

    private String validateName(String name){
        if (name == null || name.isBlank()){
            throw new IllegalArgumentException("Name cannot be blank.");
        }
        return name.trim();
    }

    public String addCustomer(String name){
        name = validateName(name);
        if (customerRepository.findByName(name).isPresent()) {
            throw new CustomerAlreadyExistsException(name);
        }
        customerRepository.save(new Customer(name));
        return String.format("Account created for %s.", name);
    }

    public List<Customer> getAllCustomers(){
        return customerRepository.findAll();
    }
    
    public Customer getCustomerByName(String name){
        return customerRepository.findByName(name)
                .orElseThrow(() -> new CustomerNotFoundException(name));
    }
}
