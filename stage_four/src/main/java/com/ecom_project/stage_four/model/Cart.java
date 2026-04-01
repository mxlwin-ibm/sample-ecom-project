package com.ecom_project.stage_four.model;

import java.util.ArrayList;
import java.util.List;

import jakarta.persistence.CollectionTable;
import jakarta.persistence.ElementCollection;
import jakarta.persistence.Embeddable;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;

@Embeddable
public class Cart {

    @ElementCollection(fetch = FetchType.EAGER) //Cart items are loaded immediately when the parent entity is fetched
    @CollectionTable(name = "customer_cart_items", joinColumns = @JoinColumn(name = "customer_name"))
    private List<CartItem> itemsList = new ArrayList<>();

    protected Cart() {
    }

    public List<CartItem> getItemsList() {
        return itemsList;
    }

    public void setItemsList(List<CartItem> itemsList) {
        this.itemsList = itemsList;
    }

    
}
