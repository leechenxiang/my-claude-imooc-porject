package com.finance.manager.controller;

import com.finance.manager.dto.*;
import com.finance.manager.entity.Category;
import com.finance.manager.entity.CategoryType;
import com.finance.manager.mapper.CategoryTypeMapper;
import com.finance.manager.service.CategoryService;
import com.finance.manager.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "*")
public class CategoryController {

    @Autowired
    private CategoryService categoryService;

    @Autowired
    private UserService userService;

    @Autowired
    private CategoryTypeMapper categoryTypeMapper;

    @GetMapping("/categories")
    public ApiResponse<List<Category>> list(@RequestHeader("Authorization") String authHeader,
                                          @RequestParam(required = false) String type) {
        try {
            Long userId = getUserId(authHeader);
            List<Category> categories = categoryService.list(userId, type);
            return ApiResponse.success(categories);
        } catch (Exception e) {
            return ApiResponse.fail(e.getMessage());
        }
    }

    @PostMapping("/categories")
    public ApiResponse<Long> add(@RequestHeader("Authorization") String authHeader,
                                @RequestBody CategoryRequest request) {
        try {
            Long userId = getUserId(authHeader);
            Long id = categoryService.add(userId, request.getName(), request.getIcon(),
                    request.getColor(), request.getType());
            return ApiResponse.success("添加成功", id);
        } catch (Exception e) {
            return ApiResponse.fail(e.getMessage());
        }
    }

    @PutMapping("/categories/{id}")
    public ApiResponse<Void> update(@RequestHeader("Authorization") String authHeader,
                                 @PathVariable Long id,
                                 @RequestBody CategoryRequest request) {
        try {
            Long userId = getUserId(authHeader);
            categoryService.update(id, userId, request.getName(), request.getIcon(),
                    request.getColor());
            return ApiResponse.success("更新成功", null);
        } catch (Exception e) {
            return ApiResponse.fail(e.getMessage());
        }
    }

    @DeleteMapping("/categories/{id}")
    public ApiResponse<Void> delete(@RequestHeader("Authorization") String authHeader,
                                 @PathVariable Long id) {
        try {
            Long userId = getUserId(authHeader);
            categoryService.delete(id, userId);
            return ApiResponse.success("删除成功", null);
        } catch (Exception e) {
            return ApiResponse.fail(e.getMessage());
        }
    }

    @GetMapping("/category-types")
    public ApiResponse<List<CategoryType>> listTypes() {
        try {
            List<CategoryType> types = categoryTypeMapper.selectAll();
            return ApiResponse.success(types);
        } catch (Exception e) {
            return ApiResponse.fail(e.getMessage());
        }
    }

    private Long getUserId(String authHeader) {
        String token = authHeader.replace("Bearer ", "");
        UserInfoResult result = userService.verifyToken(token);
        return result.getUserId();
    }
}