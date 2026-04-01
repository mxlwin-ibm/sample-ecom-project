package com.ecom_project.stage_four.service;
import java.util.List;

import org.springframework.stereotype.Service;

import com.ecom_project.stage_four.exception.ProductAlreadyExistsException;
import com.ecom_project.stage_four.exception.ProductNotFoundException;
import com.ecom_project.stage_four.model.Product;
import com.ecom_project.stage_four.repository.ProductRepository;

@Service
public class ProductService {
    private final ProductRepository productRepository;

    public ProductService(ProductRepository productRepository) {
        this.productRepository = productRepository;
    }

    private String validateTextField(String value, String fieldName){
        if (value == null || value.isBlank()){
            throw new IllegalArgumentException(fieldName + " cannot be blank.");
        }
        return value.trim();
    }

    public String addProduct(String name, String category, int price, int quantity){
        name = validateTextField(name, "Product name");
        category = validateTextField(category, "Category");
        if (getProductByName(name) != null){
            throw new ProductAlreadyExistsException(name);
        }
        Product p = new Product(name, category, price, quantity);
        productRepository.save(p);
        return String.format("%s has been added to the inventory.", name);
    }
    
    public List<Product> getAllProducts(){
        return productRepository.findAll();
    }
    
    public List<Product> getProductsByCategory(String category){
        return productRepository.findByCategory(category);
    }
    
    public List<Product> getProductBySearch(String keyword){
        return productRepository.findByNameContaining(keyword);
    }
    
    public Product getProductByName(String name){
        return productRepository.findByName(name)
                                .orElse(null);
    }
    
    public String addQuantity(String name, int value){
        if (value < 1){
            return "Minimum Quantity to be added is 1.";
        }
        Product p = getProductByName(name);
        if (p == null){
            throw new ProductNotFoundException(name);
        }
        p.setQuantity(p.getQuantity() + value);
        productRepository.save(p);
        return String.format("Product %s Stock updated. Current quantity: %d",
                            p.getName(), p.getQuantity());
    }
}
