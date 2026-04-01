package com.ecom_project.stage_four.exception;

public class ProductAlreadyExistsException extends RuntimeException {
    public ProductAlreadyExistsException(String name){
        super(String.format("Product: %s already exists.", name));
    }
}
