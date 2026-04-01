package com.ecom_project.stage_four.service;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.ecom_project.stage_four.exception.CustomerNotFoundException;
import com.ecom_project.stage_four.exception.ProductNotFoundException;
import com.ecom_project.stage_four.model.Cart;
import com.ecom_project.stage_four.model.CartItem;
import com.ecom_project.stage_four.model.Customer;
import com.ecom_project.stage_four.model.Product;
import com.ecom_project.stage_four.repository.CustomerRepository;
import com.ecom_project.stage_four.repository.ProductRepository;



@Service
public class CartService {
    private final CustomerRepository customerRepository;
    private final ProductRepository productRepository;

    private Customer getCustomer(String name){
        return customerRepository.findByName(name)
               .orElseThrow(() -> new CustomerNotFoundException(name));
    }
    
    private Product getProduct(String name){
        return productRepository.findByName(name)
               .orElseThrow(() -> new ProductNotFoundException(name));
    }
    
    public CartService(CustomerRepository customerRepository, ProductRepository productRepository){
        this.customerRepository = customerRepository;
        this.productRepository = productRepository;
    }
    public Cart viewCart(String name){
        Customer c = getCustomer(name);
        return c.getCart();
    }

    @Transactional
    public String addToCart(String customerName, String productName, int quantity){
        if (quantity < 1){
            return "Request Failed. Minimum Quantity is 1.";
        }
        Customer c = getCustomer(customerName);
        Product p = getProduct(productName);
        
        if(p.getQuantity() < quantity){
            return "Insufficient Quantity.";
        }

        for (CartItem item : c.getCart().getItemsList()) {
            if (item.getProduct().getName().equalsIgnoreCase(productName)) {
                int updatedQuantity = item.getQuantity() + quantity;
                if (p.getQuantity() < updatedQuantity) {
                    return "Insufficient Quantity.";
                }
                item.setQuantity(updatedQuantity);
                customerRepository.save(c);
                return String.format("%s quantity updated in your cart.", p.getName());
            }
        }

        c.getCart().getItemsList().add(new CartItem(p, quantity));
        customerRepository.save(c);
        return String.format("%s has been added to your cart.", p.getName());
    }
    
    @Transactional
    public String updateQuantity(String customerName, String productName, int quantity){
        if (quantity < 1){
            return "Request Failed. Minimum Quantity is 1";
        }
        Customer c = getCustomer(customerName);
        
        for (CartItem item : c.getCart().getItemsList()) {
            if (item.getProduct().getName().equalsIgnoreCase(productName)) {
                Product p = productRepository.findByName(productName)
                            .orElseThrow(() -> new ProductNotFoundException(productName));

                if (p.getQuantity() < quantity){
                    return "Request Failed. Insufficient Quantity";
                }
                item.setQuantity(quantity);
                customerRepository.save(c);
                return "Quantity updated.";
            }
        }
        return "Product not found in cart.";
    }
    
    @Transactional
    public String removeFromCart(String customerName, String productName){
        Customer c = getCustomer(customerName);
        c.getCart().getItemsList().removeIf(item -> item.getProduct()
         .getName().equals(productName));
        customerRepository.save(c);
        return "Product removed.";
    }
    
    @Transactional
    public void clearCart(String customerName){
        Customer c = getCustomer(customerName);
        c.getCart().getItemsList().clear();
        customerRepository.save(c);
    }
}
