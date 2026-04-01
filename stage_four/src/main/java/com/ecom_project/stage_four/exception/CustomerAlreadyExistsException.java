package com.ecom_project.stage_four.exception;

public class CustomerAlreadyExistsException extends RuntimeException{
    public CustomerAlreadyExistsException(String name){
        super(String.format("Customer with name: %s already exists.", name));
    }
}
