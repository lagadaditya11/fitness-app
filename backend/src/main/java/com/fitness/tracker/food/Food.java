package com.fitness.tracker.food;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "foods")
public class Food {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private Double caloriesPer100g;

    private Double proteinPer100g;
    private Double carbsPer100g;
    private Double fatPer100g;

    private Long ownerId;

    @Column(nullable = false)
    private Boolean custom = false;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public Double getCaloriesPer100g() { return caloriesPer100g; }
    public void setCaloriesPer100g(Double caloriesPer100g) { this.caloriesPer100g = caloriesPer100g; }
    public Double getProteinPer100g() { return proteinPer100g; }
    public void setProteinPer100g(Double proteinPer100g) { this.proteinPer100g = proteinPer100g; }
    public Double getCarbsPer100g() { return carbsPer100g; }
    public void setCarbsPer100g(Double carbsPer100g) { this.carbsPer100g = carbsPer100g; }
    public Double getFatPer100g() { return fatPer100g; }
    public void setFatPer100g(Double fatPer100g) { this.fatPer100g = fatPer100g; }
    public Long getOwnerId() { return ownerId; }
    public void setOwnerId(Long ownerId) { this.ownerId = ownerId; }
    public Boolean getCustom() { return custom; }
    public void setCustom(Boolean custom) { this.custom = custom; }
}