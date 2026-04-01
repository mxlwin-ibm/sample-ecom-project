package com.ecom_project.stage_four.exception;

public class CustomerNotFoundException extends RuntimeException{
    public CustomerNotFoundException(String name){
        super(String.format("Customer with name: %s not found.", name));
    }
}
