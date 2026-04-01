package com.ecom_project.stage_four.model;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;

@Entity
public class Product{
    @Id
    private String name;
    
    private String category;
    private int price;
    private int quantity;

    protected Product() {
    }
    
    public Product(String name, String category, int price, int quantity){
        this.name = name;
        this.category = category;
        this.price = price;
        this.quantity = quantity;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    public int getPrice() {
        return price;
    }

    public void setPrice(int price) {
        this.price = price;
    }

    public int getQuantity() {
        return quantity;
    }

    public void setQuantity(int quantity) {
        this.quantity = quantity;
    }


}
