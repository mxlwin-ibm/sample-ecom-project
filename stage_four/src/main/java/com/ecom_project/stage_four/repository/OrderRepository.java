package com.ecom_project.stage_four.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.ecom_project.stage_four.model.OrderDetails;


@Repository
public interface OrderRepository extends JpaRepository<OrderDetails, Integer>{
    List<OrderDetails> findByCustomerName(String customerName);
}
