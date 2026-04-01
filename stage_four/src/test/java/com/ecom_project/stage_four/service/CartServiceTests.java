package com.ecom_project.stage_four.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertSame;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.util.Optional;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.ecom_project.stage_four.exception.CustomerNotFoundException;
import com.ecom_project.stage_four.exception.ProductNotFoundException;
import com.ecom_project.stage_four.model.Cart;
import com.ecom_project.stage_four.model.CartItem;
import com.ecom_project.stage_four.model.Customer;
import com.ecom_project.stage_four.model.Product;
import com.ecom_project.stage_four.repository.CustomerRepository;
import com.ecom_project.stage_four.repository.ProductRepository;

@ExtendWith(MockitoExtension.class)
class CartServiceTests {

    @Mock
    private CustomerRepository customerRepository;

    @Mock
    private ProductRepository productRepository;

    @InjectMocks
    private CartService cartService;

    @Test
    void viewCartReturnsCustomerCart() {
        Customer customer = new Customer("Alice");
        when(customerRepository.findByName("Alice")).thenReturn(Optional.of(customer));

        Cart result = cartService.viewCart("Alice");

        assertSame(customer.getCart(), result);
    }

    @Test
    void viewCartThrowsWhenCustomerMissing() {
        when(customerRepository.findByName("Alice")).thenReturn(Optional.empty());

        CustomerNotFoundException exception = assertThrows(
                CustomerNotFoundException.class,
                () -> cartService.viewCart("Alice"));

        assertEquals("Customer with name: Alice not found.", exception.getMessage());
    }

    @Test
    void addToCartRejectsInvalidQuantity() {
        String response = cartService.addToCart("Alice", "Laptop", 0);

        assertEquals("Request Failed. Minimum Quantity is 1.", response);
        verify(customerRepository, never()).findByName("Alice");
        verify(productRepository, never()).findByName("Laptop");
    }

    @Test
    void addToCartAddsNewItemAndSavesCustomer() {
        Customer customer = new Customer("Alice");
        Product product = new Product("Laptop", "Electronics", 1000, 5);
        when(customerRepository.findByName("Alice")).thenReturn(Optional.of(customer));
        when(productRepository.findByName("Laptop")).thenReturn(Optional.of(product));

        String response = cartService.addToCart("Alice", "Laptop", 2);

        assertEquals("Laptop has been added to your cart.", response);
        assertEquals(1, customer.getCart().getItemsList().size());
        assertEquals("Laptop", customer.getCart().getItemsList().get(0).getProduct().getName());
        assertEquals(2, customer.getCart().getItemsList().get(0).getQuantity());
        verify(customerRepository).save(customer);
    }

    @Test
    void addToCartUpdatesExistingItemQuantity() {
        Customer customer = new Customer("Alice");
        Product product = new Product("Laptop", "Electronics", 1000, 5);
        customer.getCart().getItemsList().add(new CartItem(product, 2));
        when(customerRepository.findByName("Alice")).thenReturn(Optional.of(customer));
        when(productRepository.findByName("Laptop")).thenReturn(Optional.of(product));

        String response = cartService.addToCart("Alice", "Laptop", 1);

        assertEquals("Laptop quantity updated in your cart.", response);
        assertEquals(3, customer.getCart().getItemsList().get(0).getQuantity());
        verify(customerRepository).save(customer);
    }

    @Test
    void addToCartRejectsInsufficientStock() {
        Customer customer = new Customer("Alice");
        Product product = new Product("Laptop", "Electronics", 1000, 2);
        when(customerRepository.findByName("Alice")).thenReturn(Optional.of(customer));
        when(productRepository.findByName("Laptop")).thenReturn(Optional.of(product));

        String response = cartService.addToCart("Alice", "Laptop", 3);

        assertEquals("Insufficient Quantity.", response);
        assertEquals(0, customer.getCart().getItemsList().size());
        verify(customerRepository, never()).save(customer);
    }

    @Test
    void addToCartThrowsWhenProductMissing() {
        Customer customer = new Customer("Alice");
        when(customerRepository.findByName("Alice")).thenReturn(Optional.of(customer));
        when(productRepository.findByName("Laptop")).thenReturn(Optional.empty());

        ProductNotFoundException exception = assertThrows(
                ProductNotFoundException.class,
                () -> cartService.addToCart("Alice", "Laptop", 1));

        assertEquals("Product: Laptop not found", exception.getMessage());
    }

    @Test
    void updateQuantityUpdatesExistingCartItem() {
        Customer customer = new Customer("Alice");
        Product product = new Product("Laptop", "Electronics", 1000, 5);
        customer.getCart().getItemsList().add(new CartItem(product, 1));
        when(customerRepository.findByName("Alice")).thenReturn(Optional.of(customer));
        when(productRepository.findByName("Laptop")).thenReturn(Optional.of(product));

        String response = cartService.updateQuantity("Alice", "Laptop", 4);

        assertEquals("Quantity updated.", response);
        assertEquals(4, customer.getCart().getItemsList().get(0).getQuantity());
        verify(customerRepository).save(customer);
    }

    @Test
    void updateQuantityReturnsMessageWhenProductIsNotInCart() {
        Customer customer = new Customer("Alice");
        when(customerRepository.findByName("Alice")).thenReturn(Optional.of(customer));

        String response = cartService.updateQuantity("Alice", "Laptop", 2);

        assertEquals("Product not found in cart.", response);
        verify(productRepository, never()).findByName("Laptop");
        verify(customerRepository, never()).save(customer);
    }

    @Test
    void removeFromCartRemovesMatchingItemAndSavesCustomer() {
        Customer customer = new Customer("Alice");
        Product product = new Product("Laptop", "Electronics", 1000, 5);
        customer.getCart().getItemsList().add(new CartItem(product, 2));
        when(customerRepository.findByName("Alice")).thenReturn(Optional.of(customer));

        String response = cartService.removeFromCart("Alice", "Laptop");

        assertEquals("Product removed.", response);
        assertEquals(0, customer.getCart().getItemsList().size());
        verify(customerRepository).save(customer);
    }

    @Test
    void clearCartEmptiesItemsAndSavesCustomer() {
        Customer customer = new Customer("Alice");
        customer.getCart().getItemsList().add(new CartItem(
                new Product("Laptop", "Electronics", 1000, 5), 2));
        when(customerRepository.findByName("Alice")).thenReturn(Optional.of(customer));

        cartService.clearCart("Alice");

        assertEquals(0, customer.getCart().getItemsList().size());
        verify(customerRepository).save(customer);
    }
}
