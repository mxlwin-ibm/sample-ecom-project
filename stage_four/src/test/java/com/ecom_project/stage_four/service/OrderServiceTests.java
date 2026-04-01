package com.ecom_project.stage_four.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertSame;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.util.List;
import java.util.Optional;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Captor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.ecom_project.stage_four.exception.CustomerNotFoundException;
import com.ecom_project.stage_four.exception.ProductNotFoundException;
import com.ecom_project.stage_four.model.CartItem;
import com.ecom_project.stage_four.model.Customer;
import com.ecom_project.stage_four.model.OrderDetails;
import com.ecom_project.stage_four.model.Product;
import com.ecom_project.stage_four.repository.CustomerRepository;
import com.ecom_project.stage_four.repository.OrderRepository;
import com.ecom_project.stage_four.repository.ProductRepository;

@ExtendWith(MockitoExtension.class)
class OrderServiceTests {

    @Mock
    private CustomerRepository customerRepository;

    @Mock
    private ProductRepository productRepository;

    @Mock
    private OrderRepository orderRepository;

    @Mock
    private CartService cartService;

    @InjectMocks
    private OrderService orderService;

    @Captor
    private ArgumentCaptor<OrderDetails> orderCaptor;

    @Test
    void getAllOrdersReturnsRepositoryValues() {
        List<OrderDetails> orders = List.of(new OrderDetails("Laptop", "Electronics", 1000, 1, "Alice"));
        when(orderRepository.findAll()).thenReturn(orders);

        List<OrderDetails> result = orderService.getAllOrders();

        assertSame(orders, result);
    }

    @Test
    void getOrdersByCustomerReturnsRepositoryValues() {
        List<OrderDetails> orders = List.of(new OrderDetails("Laptop", "Electronics", 1000, 1, "Alice"));
        when(orderRepository.findByCustomerName("Alice")).thenReturn(orders);

        List<OrderDetails> result = orderService.getOrdersByCustomer("Alice");

        assertSame(orders, result);
    }

    @Test
    void placeOrderThrowsWhenCustomerMissing() {
        when(customerRepository.findByName("Alice")).thenReturn(Optional.empty());

        CustomerNotFoundException exception = assertThrows(
                CustomerNotFoundException.class,
                () -> orderService.placeOrder("Alice"));

        assertEquals("Customer with name: Alice not found.", exception.getMessage());
        verify(orderRepository, never()).save(org.mockito.ArgumentMatchers.any(OrderDetails.class));
    }

    @Test
    void placeOrderThrowsWhenCartIsEmpty() {
        Customer customer = new Customer("Alice");
        when(customerRepository.findByName("Alice")).thenReturn(Optional.of(customer));

        IllegalArgumentException exception = assertThrows(
                IllegalArgumentException.class,
                () -> orderService.placeOrder("Alice"));

        assertEquals("Cart is empty", exception.getMessage());
        verify(orderRepository, never()).save(org.mockito.ArgumentMatchers.any(OrderDetails.class));
        verify(cartService, never()).clearCart("Alice");
    }

    @Test
    void placeOrderThrowsWhenProductMissing() {
        Product product = new Product("Laptop", "Electronics", 1000, 3);
        Customer customer = new Customer("Alice");
        customer.getCart().getItemsList().add(new CartItem(product, 1));
        when(customerRepository.findByName("Alice")).thenReturn(Optional.of(customer));
        when(productRepository.findByName("Laptop")).thenReturn(Optional.empty());

        ProductNotFoundException exception = assertThrows(
                ProductNotFoundException.class,
                () -> orderService.placeOrder("Alice"));

        assertEquals("Product: Laptop not found", exception.getMessage());
        verify(orderRepository, never()).save(org.mockito.ArgumentMatchers.any(OrderDetails.class));
        verify(cartService, never()).clearCart("Alice");
    }

    @Test
    void placeOrderThrowsWhenStockIsInsufficient() {
        Product product = new Product("Laptop", "Electronics", 1000, 3);
        Customer customer = new Customer("Alice");
        customer.getCart().getItemsList().add(new CartItem(product, 4));
        when(customerRepository.findByName("Alice")).thenReturn(Optional.of(customer));
        when(productRepository.findByName("Laptop")).thenReturn(Optional.of(product));

        IllegalArgumentException exception = assertThrows(
                IllegalArgumentException.class,
                () -> orderService.placeOrder("Alice"));

        assertEquals("Insufficient stock for Laptop", exception.getMessage());
        verify(orderRepository, never()).save(org.mockito.ArgumentMatchers.any(OrderDetails.class));
        verify(cartService, never()).clearCart("Alice");
    }

    @Test
    void placeOrderSavesOrdersDeductsStockAndClearsCart() {
        Product laptop = new Product("Laptop", "Electronics", 1000, 5);
        Product mouse = new Product("Mouse", "Accessories", 50, 10);
        Customer customer = new Customer("Alice");
        customer.getCart().getItemsList().add(new CartItem(laptop, 2));
        customer.getCart().getItemsList().add(new CartItem(mouse, 3));

        when(customerRepository.findByName("Alice")).thenReturn(Optional.of(customer));
        when(productRepository.findByName("Laptop")).thenReturn(Optional.of(laptop));
        when(productRepository.findByName("Mouse")).thenReturn(Optional.of(mouse));

        String response = orderService.placeOrder("Alice");

        assertEquals("Order has been placed", response);
        assertEquals(3, laptop.getQuantity());
        assertEquals(7, mouse.getQuantity());
        verify(orderRepository, times(2)).save(orderCaptor.capture());
        verify(cartService).clearCart("Alice");

        List<OrderDetails> savedOrders = orderCaptor.getAllValues();
        assertEquals(2, savedOrders.size());
        assertEquals("Laptop", savedOrders.get(0).getName());
        assertEquals(2, savedOrders.get(0).getQuantity());
        assertEquals("Alice", savedOrders.get(0).getCustomerName());
        assertEquals("Mouse", savedOrders.get(1).getName());
        assertEquals(3, savedOrders.get(1).getQuantity());
        assertEquals("Alice", savedOrders.get(1).getCustomerName());
    }
}
