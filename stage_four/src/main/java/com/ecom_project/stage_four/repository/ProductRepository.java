package com.ecom_project.stage_four.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.ecom_project.stage_four.model.Product;


@Repository
public interface ProductRepository extends JpaRepository<Product, String> {
    Optional<Product> findByName(String name);
    List<Product> findByCategory(String category);

    List<Product> findByNameContaining(String name);
}
