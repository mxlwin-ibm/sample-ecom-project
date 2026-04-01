package com.ecom_project.stage_four.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.ecom_project.stage_four.model.Customer;
import com.ecom_project.stage_four.service.CustomerService;




@RestController
@RequestMapping("/admin/customer")
public class CustomerController {
    private final CustomerService service;

    public CustomerController(CustomerService customerService){
        this.service = customerService;
    }

    @GetMapping("/all")
    public ResponseEntity<List<Customer>> getAllCustomers() {
        return ResponseEntity.ok(service.getAllCustomers());
    }

    @PostMapping("/add")
    public ResponseEntity<String> addCustomer(@RequestBody String name) {
        return ResponseEntity.ok(service.addCustomer(name));
    }

    @GetMapping("/{customerName}")
    public ResponseEntity<Customer> getCustomerByName(@PathVariable String customerName) {
        return ResponseEntity.ok(service.getCustomerByName(customerName));
    }
    
    
    
}
