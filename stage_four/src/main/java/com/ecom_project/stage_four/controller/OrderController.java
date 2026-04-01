package com.ecom_project.stage_four.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RestController;

import com.ecom_project.stage_four.model.OrderDetails;
import com.ecom_project.stage_four.service.OrderService;



@RestController
public class OrderController {
    private final OrderService service;

    public OrderController(OrderService orderService){
        this.service = orderService;
    }

    @GetMapping("admin/orders/all")
    public ResponseEntity<List<OrderDetails>> getAllOrders() {
        return ResponseEntity.ok(service.getAllOrders());
    }

    @GetMapping("customer/{customerName}/orders")
    public ResponseEntity<List<OrderDetails>> getOrdersByCustomer(@PathVariable String customerName){
        return ResponseEntity.ok(service.getOrdersByCustomer(customerName));
    }
    
    @PostMapping("customer/{customerName}/place-order")
    public ResponseEntity<String> placeOrder(@PathVariable String customerName) {
        return ResponseEntity.ok(service.placeOrder(customerName));
    }
}
