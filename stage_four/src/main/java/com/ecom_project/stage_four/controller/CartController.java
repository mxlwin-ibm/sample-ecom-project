package com.ecom_project.stage_four.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.ecom_project.stage_four.model.AddToCartRequest;
import com.ecom_project.stage_four.model.Cart;
import com.ecom_project.stage_four.model.UpdateQuantityRequest;
import com.ecom_project.stage_four.service.CartService;


@RestController
@RequestMapping("/customer/{customerName}/cart")
public class CartController {
    private final CartService service;

    public CartController(CartService cartService){
        this.service = cartService;
    }

    @GetMapping
    public ResponseEntity<Cart> viewCart(@PathVariable String customerName){
        return ResponseEntity.ok(service.viewCart(customerName));
        }

    @PostMapping("/add")
    public ResponseEntity<String> addToCart(@PathVariable String customerName, @RequestBody AddToCartRequest request) {
        return ResponseEntity.ok(service.addToCart(customerName, request.getProductName(), request.getQuantity()));
    }

    @PutMapping("/update-qty/{productName}")
    public ResponseEntity<String> updateQuantity(@PathVariable String customerName, @PathVariable String productName, @RequestBody UpdateQuantityRequest request) {
        return ResponseEntity.ok(service.updateQuantity(customerName, productName, request.getQuantity()));
    }

    @DeleteMapping("/remove/{productName}")
    public ResponseEntity<String> removeFromCart(@PathVariable String customerName, @PathVariable String productName){
        return ResponseEntity.ok(service.removeFromCart(customerName, productName));
    }

    @DeleteMapping("/clear-cart")
    public ResponseEntity<Void> clearCart(@PathVariable String customerName) {
        service.clearCart(customerName);
        return ResponseEntity.noContent().build();
    }
}
    

