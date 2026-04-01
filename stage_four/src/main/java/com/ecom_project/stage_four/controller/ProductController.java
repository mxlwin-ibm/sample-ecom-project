package com.ecom_project.stage_four.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import com.ecom_project.stage_four.model.Product;
import com.ecom_project.stage_four.service.ProductService;



@RestController
public class ProductController {
    private final ProductService service;

    public ProductController(ProductService productService){
        this.service = productService;
    }

    @PostMapping("/admin/products/add")
    public ResponseEntity<String> addProduct(@RequestBody Product p) {
        return ResponseEntity.ok(service.addProduct(p.getName(), 
               p.getCategory(), p.getPrice(), p.getQuantity()));
    }

    @GetMapping("/products/all")
    public ResponseEntity<List<Product>> getAllProducts() {
        return ResponseEntity.ok(service.getAllProducts());
    }

    @GetMapping("/products/category/{c}")
    public ResponseEntity<List<Product>> getProductsByCategory(@PathVariable String c) {
        return ResponseEntity.ok(service.getProductsByCategory(c));
    }

    @GetMapping("/products/search/{keyword}")
    public ResponseEntity<List<Product>> getProductBySearch(@PathVariable String keyword) {
        return ResponseEntity.ok(service.getProductBySearch(keyword));
    }
    
    @PostMapping("/admin/products/{productName}/add-stock")
    public ResponseEntity<String> addQuantity(@PathVariable String productName, @RequestBody int quantity) {
        return ResponseEntity.ok(service.addQuantity(productName, quantity));

    }
}
