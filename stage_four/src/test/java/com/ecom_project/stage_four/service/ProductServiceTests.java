package com.ecom_project.stage_four.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertSame;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.util.List;
import java.util.Optional;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.ecom_project.stage_four.exception.ProductAlreadyExistsException;
import com.ecom_project.stage_four.exception.ProductNotFoundException;
import com.ecom_project.stage_four.model.Product;
import com.ecom_project.stage_four.repository.ProductRepository;

@ExtendWith(MockitoExtension.class)
class ProductServiceTests {

    @Mock
    private ProductRepository productRepository;

    @InjectMocks
    private ProductService productService;

    @Test
    void addProductSavesValidatedProduct() {
        when(productRepository.findByName("Laptop")).thenReturn(Optional.empty());

        String response = productService.addProduct("  Laptop  ", "  Electronics  ", 1200, 5);

        assertEquals("Laptop has been added to the inventory.", response);
        verify(productRepository).save(org.mockito.ArgumentMatchers.argThat(product ->
                "Laptop".equals(product.getName())
                        && "Electronics".equals(product.getCategory())
                        && product.getPrice() == 1200
                        && product.getQuantity() == 5));
    }

    @Test
    void addProductRejectsDuplicateProduct() {
        when(productRepository.findByName("Laptop"))
                .thenReturn(Optional.of(new Product("Laptop", "Electronics", 1200, 5)));

        ProductAlreadyExistsException exception = assertThrows(
                ProductAlreadyExistsException.class,
                () -> productService.addProduct("Laptop", "Electronics", 1200, 5));

        assertEquals("Product: Laptop already exists.", exception.getMessage());
        verify(productRepository, never()).save(org.mockito.ArgumentMatchers.any(Product.class));
    }

    @Test
    void addProductRejectsBlankName() {
        IllegalArgumentException exception = assertThrows(
                IllegalArgumentException.class,
                () -> productService.addProduct(" ", "Electronics", 1200, 5));

        assertEquals("Product name cannot be blank.", exception.getMessage());
        verify(productRepository, never()).findByName(org.mockito.ArgumentMatchers.anyString());
    }

    @Test
    void getProductsByCategoryReturnsRepositoryValues() {
        List<Product> products = List.of(new Product("Laptop", "Electronics", 1200, 5));
        when(productRepository.findByCategory("Electronics")).thenReturn(products);

        List<Product> result = productService.getProductsByCategory("Electronics");

        assertSame(products, result);
    }

    @Test
    void addQuantityUpdatesStockWhenProductExists() {
        Product product = new Product("Laptop", "Electronics", 1200, 5);
        when(productRepository.findByName("Laptop")).thenReturn(Optional.of(product));

        String response = productService.addQuantity("Laptop", 3);

        assertEquals("Product Laptop Stock updated. Current quantity: 8", response);
        assertEquals(8, product.getQuantity());
        verify(productRepository).save(product);
    }

    @Test
    void addQuantityRejectsInvalidQuantity() {
        String response = productService.addQuantity("Laptop", 0);

        assertEquals("Minimum Quantity to be added is 1.", response);
        verify(productRepository, never()).findByName(org.mockito.ArgumentMatchers.anyString());
        verify(productRepository, never()).save(org.mockito.ArgumentMatchers.any(Product.class));
    }

    @Test
    void addQuantityThrowsWhenProductMissing() {
        when(productRepository.findByName("Laptop")).thenReturn(Optional.empty());

        ProductNotFoundException exception = assertThrows(
                ProductNotFoundException.class,
                () -> productService.addQuantity("Laptop", 2));

        assertEquals("Product: Laptop not found", exception.getMessage());
    }
}
