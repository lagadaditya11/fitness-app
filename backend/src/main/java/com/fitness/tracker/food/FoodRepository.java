package com.fitness.tracker.food;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface FoodRepository extends JpaRepository<Food, Long> {

    @Query("""
        SELECT f FROM Food f
        WHERE (f.ownerId IS NULL OR f.ownerId = :ownerId)
          AND lower(f.name) LIKE lower(CONCAT('%', :q, '%'))
        ORDER BY f.name ASC
        """)
    List<Food> search(@Param("q") String q, @Param("ownerId") Long ownerId);

    List<Food> findByOwnerId(Long ownerId);
}