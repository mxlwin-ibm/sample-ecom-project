package com.ecom_project.stage_four.exception;

public class ProductNotFoundException extends RuntimeException{
    public ProductNotFoundException(String name){
        super(String.format("Product: %s not found", name));
    }
}
