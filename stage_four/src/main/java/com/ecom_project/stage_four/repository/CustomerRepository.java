package com.ecom_project.stage_four.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.ecom_project.stage_four.model.Customer;


@Repository
public interface CustomerRepository extends JpaRepository<Customer, String>{
    Optional<Customer> findByName(String name);
    
}
