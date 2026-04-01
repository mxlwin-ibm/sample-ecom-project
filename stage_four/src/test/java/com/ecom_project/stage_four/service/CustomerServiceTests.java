package com.ecom_project.stage_four.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertSame;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.util.List;
import java.util.Optional;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.ecom_project.stage_four.exception.CustomerAlreadyExistsException;
import com.ecom_project.stage_four.exception.CustomerNotFoundException;
import com.ecom_project.stage_four.model.Customer;
import com.ecom_project.stage_four.repository.CustomerRepository;

@ExtendWith(MockitoExtension.class)
class CustomerServiceTests {

    @Mock
    private CustomerRepository customerRepository;

    @InjectMocks
    private CustomerService customerService;

    @Test
    void addCustomerSavesTrimmedName() {
        when(customerRepository.findByName("Alice")).thenReturn(Optional.empty());

        String response = customerService.addCustomer("  Alice  ");

        assertEquals("Account created for Alice.", response);
        verify(customerRepository).save(org.mockito.ArgumentMatchers.argThat(
                customer -> "Alice".equals(customer.getName())));
    }

    @Test
    void addCustomerRejectsBlankName() {
        IllegalArgumentException exception = assertThrows(
                IllegalArgumentException.class,
                () -> customerService.addCustomer("   "));

        assertEquals("Name cannot be blank.", exception.getMessage());
        verify(customerRepository, never()).findByName(org.mockito.ArgumentMatchers.anyString());
        verify(customerRepository, never()).save(org.mockito.ArgumentMatchers.any(Customer.class));
    }

    @Test
    void addCustomerRejectsDuplicateName() {
        when(customerRepository.findByName("Alice"))
                .thenReturn(Optional.of(new Customer("Alice")));

        CustomerAlreadyExistsException exception = assertThrows(
                CustomerAlreadyExistsException.class,
                () -> customerService.addCustomer("Alice"));

        assertEquals("Customer with name: Alice already exists.", exception.getMessage());
        verify(customerRepository, never()).save(org.mockito.ArgumentMatchers.any(Customer.class));
    }

    @Test
    void getAllCustomersReturnsRepositoryValues() {
        List<Customer> customers = List.of(new Customer("Alice"), new Customer("Bob"));
        when(customerRepository.findAll()).thenReturn(customers);

        List<Customer> result = customerService.getAllCustomers();

        assertSame(customers, result);
    }

    @Test
    void getCustomerByNameReturnsCustomerWhenPresent() {
        Customer customer = new Customer("Alice");
        when(customerRepository.findByName("Alice")).thenReturn(Optional.of(customer));

        Customer result = customerService.getCustomerByName("Alice");

        assertSame(customer, result);
    }

    @Test
    void getCustomerByNameThrowsWhenMissing() {
        when(customerRepository.findByName("Alice")).thenReturn(Optional.empty());

        CustomerNotFoundException exception = assertThrows(
                CustomerNotFoundException.class,
                () -> customerService.getCustomerByName("Alice"));

        assertEquals("Customer with name: Alice not found.", exception.getMessage());
    }
}
