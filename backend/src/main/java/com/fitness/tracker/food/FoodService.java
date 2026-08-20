package com.fitness.tracker.food;

import com.fitness.tracker.config.CurrentUser;
import com.fitness.tracker.user.User;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class FoodService {

    private final FoodRepository foodRepository;
    private final CurrentUser currentUser;

    public FoodService(FoodRepository foodRepository, CurrentUser currentUser) {
        this.foodRepository = foodRepository;
        this.currentUser = currentUser;
    }

    public List<Food> search(String q) {
        return foodRepository.search(q.trim(), currentUser.get().getId());
    }

    public List<Food> myFoods() {
        return foodRepository.findByOwnerId(currentUser.get().getId());
    }

    public Food create(Food food) {
        User user = currentUser.get();
        food.setId(null);
        food.setOwnerId(user.getId());
        food.setCustom(true);
        return foodRepository.save(food);
    }
}