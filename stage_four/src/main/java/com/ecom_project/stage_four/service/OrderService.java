package com.ecom_project.stage_four.service;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.ecom_project.stage_four.exception.CustomerNotFoundException;
import com.ecom_project.stage_four.exception.ProductNotFoundException;
import com.ecom_project.stage_four.model.CartItem;
import com.ecom_project.stage_four.model.Customer;
import com.ecom_project.stage_four.model.OrderDetails;
import com.ecom_project.stage_four.model.Product;
import com.ecom_project.stage_four.repository.CustomerRepository;
import com.ecom_project.stage_four.repository.OrderRepository;
import com.ecom_project.stage_four.repository.ProductRepository;

@Service
public class OrderService {
    private final CustomerRepository customerRepository;
    private final ProductRepository productRepository;
    private final OrderRepository orderRepository;
    private final CartService cartService;



    public OrderService(CustomerRepository customerRepository, ProductRepository productRepository, OrderRepository orderRepository, CartService cartService){
        this.customerRepository = customerRepository;
        this.productRepository = productRepository;
        this.orderRepository = orderRepository;
        this.cartService = cartService;
    }

    public List<OrderDetails> getAllOrders(){
        return orderRepository.findAll();
    }

    public List<OrderDetails> getOrdersByCustomer(String name){
        return orderRepository.findByCustomerName(name);
    }

    @Transactional
    public String placeOrder(String name){

        Customer c = customerRepository.findByName(name)
                .orElseThrow(() -> new CustomerNotFoundException(name));

        List<CartItem> items = c.getCart().getItemsList();
        if (items.isEmpty()) {
            throw new IllegalArgumentException("Cart is empty");
        }
        //validation
        for (CartItem i : items) {
            Product dbProduct = productRepository.findByName(i.getProduct().getName())
                    .orElseThrow(() -> new ProductNotFoundException(i.getProduct().getName()));

            if (i.getQuantity() > dbProduct.getQuantity()) {
                throw new IllegalArgumentException("Insufficient stock for " + dbProduct.getName());
            }
        }
        //updation
        for (CartItem i : items) {
            Product dbProduct = productRepository.findByName(i.getProduct().getName())
                    .orElseThrow(() -> new ProductNotFoundException(i.getProduct().getName()));

            dbProduct.setQuantity(dbProduct.getQuantity() - i.getQuantity());

            orderRepository.save(new OrderDetails(
                    dbProduct.getName(),dbProduct.getCategory(),
                    dbProduct.getPrice(),i.getQuantity(),c.getName()
            ));
        }
        cartService.clearCart(name);
        return "Order has been placed";
    }
}
