package com.petcare.petwellness.Service;

import com.petcare.petwellness.DTO.Request.ProductCreateRequestDto;
import com.petcare.petwellness.DTO.Request.ProductUpdateRequestDto;
import com.petcare.petwellness.DTO.Response.ProductResponseDto;
import com.petcare.petwellness.Enums.ProductCategory;
import org.springframework.data.domain.Page;

public interface ProductService {

    ProductResponseDto createProduct(ProductCreateRequestDto request);

    ProductResponseDto updateProduct(Long productId, ProductUpdateRequestDto request);

    ProductResponseDto getProductById(Long productId);

    Page<ProductResponseDto> getProducts(int offset, int limit, ProductCategory category);

    Page<ProductResponseDto> getPublicProducts(int offset, int limit, ProductCategory category);

    String deleteProduct(Long productId);
}
