# Spring Boot 项目开发规范

> 本规范基于大厂 Java 架构师实践制定，适用于企业级 Spring Boot 2.7.x + JDK 8+ 项目开发

## 目录

1. [编码规范](#1-编码规范)
2. [分层架构规范](#2-分层架构规范)
3. [接口设计规范](#3-接口设计规范)
4. [数据库设计规范](#4-数据库设计规范)
5. [异常处理规范](#5-异常处理规范)
6. [日志规范](#6-日志规范)
7. [安全规范](#7-安全规范)
8. [配置规范](#8-配置规范)
9. [事务规范](#9-事务规范)
10. [测试规范](#10-测试规范)
11. [Git提交规范](#11-git提交规范)
12. [代码审查规范](#12-代码审查规范)

---

## 1. 编码规范

### 1.1 命名规范

#### 1.1.1 包命名

```java
// 格式：com.{公司/组织}.{项目}.{模块}[.{子模块}]
com.imooc.hire.user
com.imooc.hire.company.service
```

#### 1.1.2 类命名

| 类型 | 命名规则 | 示例 |
|------|----------|------|
| Controller | {功能}Controller | UserController |
| Service接口 | {功能}Service | UserService |
| Service实现 | {功能}ServiceImpl | UserServiceImpl |
| Mapper接口 | {功能}Mapper | UserMapper |
| Entity | {功能} | User |
| VO | {功能}VO | UserVO |
| DTO | {功能}DTO | UserDTO |
| BO | {功能}BO | UserBO |
| Config | {功能}Config | RedisConfig |
| Util | {功能}Util | DateUtil |

#### 1.1.3 方法命名

```java
// CRUD操作
save()           // 新增
update()         // 更新
deleteById()     // 根据ID删除
getById()       // 根据ID查询
list()          // 列表查询
page()          // 分页查询

// 业务方法
register()      // 注册
login()         // 登录
logout()        // 登出
export()        // 导出
import()        // 导入
```

#### 1.1.4 常量命名

```java
// 常量：全部大写，下划线分隔
public static final Integer MAX_RETRY_COUNT = 3;
public static final String DEFAULT_PASSWORD = "123456";

// 枚举：E开头 + 功能名 + 状态
public enum StatusEnum {
    ENABLED(1, "启用"),
    DISABLED(0, "禁用");
}
```

#### 1.1.5 变量命名

```java
// 普通变量：驼峰命名
private String userName;
private Integer pageSize;

// 循环变量
for (int i = 0; i < list.size(); i++) { }

// 布尔变量
private boolean isEnabled;
private boolean hasError;
private boolean canEdit;
```

### 1.2 代码格式

#### 1.2.1 缩进和空格

```java
// 缩进：4个空格
// 关键字后有空格：if (condition)
// 运算符前后有空格：int result = a + b
// 逗号后有空格：method(arg1, arg2, arg3)
// 分号前不空格：for (int i = 0; i < 10; i++)

// 正确
if (user != null && user.getStatus() == 1) {
    doSomething();
}

// 错误
if(user!=null&&user.getStatus()==1){
    doSomething();
}
```

#### 1.2.2 大括号位置

```java
// 左大括号不换行
public class UserService {

}

// 方法左大括号不换行
public void method() {

}

// 控制语句左大括号不换行
if (condition) {

} else {

}

for (int i = 0; i < 10; i++) {

}
```

#### 1.2.3 注释规范

```java
/**
 * 根据ID查询用户信息
 *
 * @param id 用户ID
 * @return 用户信息
 */
public User getById(Long id) {
    // 单行注释前有空格
    return userMapper.selectById(id);
}
```

### 1.3 代码结构

```java
package com.example.user;

import org.springframework.stereotype.Service;
import org.springframework.beans.factory.annotation.Autowired;
import lombok.extern.slf4j.Slf4j;

/**
 * 用户服务实现类
 *
 * @author zhangsan
 * @since 2024-01-01
 */
@Slf4j
@Service
public class UserServiceImpl implements UserService {

    // 私有常量
    private static final int MAX_LOGIN_COUNT = 5;

    // 私有成员变量
    @Autowired
    private UserMapper userMapper;

    // 公有方法（API）
    @Override
    public User getById(Long id) {
        log.info("根据ID查询用户, id: {}", id);
        return userMapper.selectById(id);
    }

    // 私有方法
    private void validateUser(User user) {
        // 验证逻辑
    }
}
```

---

## 2. 分层架构规范

### 2.1 标准分层结构

```
│─── controller          # 控制层（接收请求、响应）
│─── service            # 业务层（业务逻辑）
│─── mapper              # 持久层（数据访问）
│─── entity              # 实体类
│─── vo                   # 视图对象
│─── dto                  # 数据传输对象
│─── convert              # 对象转换
└─── config              # 配置类
```

### 2.2 Controller层规范

```java
@RestController
@RequestMapping("/api/user")
@Api(tags = "用户管理")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    /**
     * 分页查询用户列表
     */
    @GetMapping("/page")
    @ApiOperation("分页查询用户列表")
    public CommonResult<Page<UserVO>> page(UserQueryDTO query) {
        log.info("分页查询用户列表, query: {}", query);
        Page<UserVO> result = userService.queryPage(query);
        return CommonResult.success(result);
    }

    /**
     * 根据ID获取用户详情
     */
    @GetMapping("/{id}")
    @ApiOperation("根据ID获取用户详情")
    @ApiImplicitParam(name = "id", value = "用户ID", required = true)
    public CommonResult<UserVO> getById(@PathVariable Long id) {
        log.info("根据ID获取用户详情, id: {}", id);
        UserVO userVO = userService.getUserDetail(id);
        return CommonResult.success(userVO);
    }

    /**
     * 创建用户
     */
    @PostMapping
    @ApiOperation("创建用户")
    public CommonResult<Long> create(@Valid @RequestBody UserCreateDTO createDTO) {
        log.info("创建用户, createDTO: {}", createDTO);
        Long userId = userService.createUser(createDTO);
        return CommonResult.success(userId);
    }

    /**
     * 更新用户
     */
    @PutMapping("/{id}")
    @ApiOperation("更新用户")
    public CommonResult<Void> update(@PathVariable Long id, 
                                     @Valid @RequestBody UserUpdateDTO updateDTO) {
        log.info("更新用户, id: {}, updateDTO: {}", id, updateDTO);
        userService.updateUser(id, updateDTO);
        return CommonResult.success();
    }

    /**
     * 删除用户
     */
    @DeleteMapping("/{id}")
    @ApiOperation("删除用户")
    public CommonResult<Void> delete(@PathVariable Long id) {
        log.info("删除用户, id: {}", id);
        userService.deleteUser(id);
        return CommonResult.success();
    }
}
```

### 2.3 Service层规范

```java
public interface UserService {

    /**
     * 分页查询用户列表
     */
    Page<UserVO> queryPage(UserQueryDTO query);

    /**
     * 获取用户详情
     */
    UserVO getUserDetail(Long id);

    /**
     * 创建用户
     */
    Long createUser(UserCreateDTO createDTO);

    /**
     * 更新用户
     */
    void updateUser(Long id, UserUpdateDTO updateDTO);

    /**
     * 删除用户
     */
    void deleteUser(Long id);
}

@Service
@RequiredArgsConstructor
@Slf4j
public class UserServiceImpl implements UserService {

    private final UserMapper userMapper;
    private final UserConvert userConvert;
    private final RedisCache redisCache;

    @Override
    public Page<UserVO> queryPage(UserQueryDTO query) {
        // 1. 参数校验
        if (query.getPageNum() < 1) {
            query.setPageNum(1);
        }
        if (query.getPageSize() < 1 || query.getPageSize() > 100) {
            query.setPageSize(10);
        }

        // 2. 查询数据
        Page<User> page = userMapper.selectPage(query);

        // 3. 转换为VO
        return userConvert.toPageVO(page);
    }

    @Override
    public UserVO getUserDetail(Long id) {
        // 1. 参数校验
        if (id == null) {
            throw new BusinessException("用户ID不能为空");
        }

        // 2. 从缓存获取
        String cacheKey = "user:detail:" + id;
        UserVO cachedVO = redisCache.get(cacheKey, UserVO.class);
        if (cachedVO != null) {
            log.info("从缓存获取用户详情, id: {}", id);
            return cachedVO;
        }

        // 3. 从数据库查询
        User user = userMapper.selectById(id);
        if (user == null) {
            throw new BusinessException("用户不存在");
        }

        // 4. 转换为VO并缓存
        UserVO userVO = userConvert.toVO(user);
        redisCache.set(cacheKey, userVO, Duration.ofHours(1));

        return userVO;
    }

    @Transactional(rollbackFor = Exception.class)
    @Override
    public Long createUser(UserCreateDTO createDTO) {
        // 1. 参数校验
        validateCreateDTO(createDTO);

        // 2. 检查重复
        checkDuplicate(createDTO);

        // 3. 转换为实体
        User user = userConvert.toEntity(createDTO);
        user.setCreateTime(new Date());

        // 4. 保存数据
        userMapper.insert(user);

        // 5. 返回ID
        return user.getId();
    }

    @Transactional(rollbackFor = Exception.class)
    @Override
    public void updateUser(Long id, UserUpdateDTO updateDTO) {
        // 1. 检查用户是否存在
        User existUser = userMapper.selectById(id);
        if (existUser == null) {
            throw new BusinessException("用户不存在");
        }

        // 2. 更新数据
        userConvert.updateEntity(updateDTO, existUser);
        existUser.setUpdateTime(new Date());
        userMapper.update(existUser);

        // 3. 清除缓存
        redisCache.delete("user:detail:" + id);
    }

    @Transactional(rollbackFor = Exception.class)
    @Override
    public void deleteUser(Long id) {
        User user = userMapper.selectById(id);
        if (user == null) {
            throw new BusinessException("用户不存在");
        }
        userMapper.deleteById(id);
        
        // 清除缓存
        redisCache.delete("user:detail:" + id);
    }

    // ========== 私有方法 ==========

    private void validateCreateDTO(UserCreateDTO createDTO) {
        if (StringUtils.isBlank(createDTO.getName())) {
            throw new BusinessException("用户名不能为空");
        }
        if (StringUtils.isBlank(createDTO.getPhone())) {
            throw new BusinessException("手机号不能为空");
        }
        if (!ValidationUtil.isValidPhone(createDTO.getPhone())) {
            throw new BusinessException("手机号格式不正确");
        }
    }

    private void checkDuplicate(UserCreateDTO createDTO) {
        Long count = userMapper.countByPhone(createDTO.getPhone());
        if (count > 0) {
            throw new BusinessException("手机号已被注册");
        }
    }
}
```

### 2.4 Mapper层规范

```java
@Mapper
public interface UserMapper {

    /**
     * 根据ID查询
     */
    @Select("SELECT * FROM tb_user WHERE id = #{id} AND deleted = 0")
    User selectById(@Param("id") Long id);

    /**
     * 分页查询
     */
    @Select("<script>" +
            "SELECT * FROM tb_user" +
            "<where>" +
            "<if test='name != null and name != \"\"'> AND name LIKE CONCAT('%', #{name}, '%') </if>" +
            "<if test='phone != null and phone != \"\"'> AND phone = #{phone} </if>" +
            "</where>" +
            "ORDER BY id DESC" +
            "</script>")
    Page<User> selectPage(UserQueryDTO query);

    /**
     * 根据手机号统计
     */
    @Select("SELECT COUNT(*) FROM tb_user WHERE phone = #{phone} AND deleted = 0")
    Long countByPhone(@Param("phone") String phone);

    /**
     * 插入数据
     */
    @Insert("INSERT INTO tb_user(name, phone, email, create_time) " +
            "VALUES(#{name}, #{phone}, #{email}, #{createTime})")
    @Options(useGeneratedKeys = true, keyProperty = "id")
    int insert(User user);

    /**
     * 更新数据
     */
    @Update("UPDATE tb_user SET name=#{name}, phone=#{phone}, update_time=#{updateTime} " +
            "WHERE id=#{id}")
    int update(User user);

    /**
     * 逻辑删除
     */
    @Update("UPDATE tb_user SET deleted = 1, update_time = NOW() WHERE id = #{id}")
    int deleteById(@Param("id") Long id);
}
```

---

## 3. 接口设计规范

### 3.1 统一响应结构

```java
@Data
@NoArgsConstructor
@AllArgsConstructor
public class CommonResult<T> implements Serializable {
    
    private static final long serialVersionUID = 1L;
    
    /** 响应码 */
    private Integer code;
    
    /** 响应消息 */
    private String message;
    
    /** 响应数据 */
    private T data;

    // ========== 成功响应 ==========
    public static <T> CommonResult<T> success() {
        return new CommonResult<>(200, "操作成功", null);
    }
    
    public static <T> CommonResult<T> success(T data) {
        return new CommonResult<>(200, "操作成功", data);
    }
    
    public static <T> CommonResult<T> success(String message, T data) {
        return new CommonResult<>(200, message, data);
    }

    // ========== 失败响应 ==========
    public static <T> CommonResult<T> failed() {
        return new CommonResult<>(500, "操作失败", null);
    }
    
    public static <T> CommonResult<T> failed(String message) {
        return new CommonResult<>(500, message, null);
    }
    
    public static <T> CommonResult<T> failed(Integer code, String message) {
        return new CommonResult<>(code, message, null);
    }
}
```

### 3.2 分页响应结构

```java
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Page<T> implements Serializable {
    
    private static final long serialVersionUID = 1L;
    
    /** 当前页码 */
    private Long pageNum;
    
    /** 每页条数 */
    private Long pageSize;
    
    /** 总记录数 */
    private Long total;
    
    /** 总页数 */
    private Long pages;
    
    /** 数据列表 */
    private List<T> list;

    public static <T> Page<T> of(Long pageNum, Long pageSize, Long total, List<T> list) {
        long pages = (total + pageSize - 1) / pageSize;
        return new Page<>(pageNum, pageSize, total, pages, list);
    }
}
```

### 3.3 接口版本控制

```java
@RestController
@RequestMapping("/api/v1/user")
public class UserController {
    // v1版本
}

@RestController
@RequestMapping("/api/v2/user")
public class UserControllerV2 {
    // v2版本
}
```

### 3.4 接口参数规范

```java
public class UserQueryDTO implements Serializable {
    
    @ApiModelProperty("页码")
    private Long pageNum = 1L;
    
    @ApiModelProperty("每页条数")
    private Long pageSize = 10L;
    
    @ApiModelProperty("用户名")
    private String name;
    
    @ApiModelProperty("手机号")
    private String phone;
    
    @ApiModelProperty("状态")
    private Integer status;
    
    @ApiModelProperty("开始时间")
    private Date startTime;
    
    @ApiModelProperty("结束时间")
    private Date endTime;
}
```

---

## 4. 数据库设计规范

### 4.1 表命名规范

```
tb_{模块名}_{实体名}
例如：
tb_user           # 用户表
tb_company       # 企业表
tb_job           # 职位表
tb_resume        # 简历表
tb_apply         # 申请记录表
```

### 4.2 字段命名规范

```sql
-- 通用字段
id              # 主键
create_time     # 创建时间
update_time     # 更新时间
deleted        # 逻辑删除标记
version        # 乐观锁版本号

-- 用户相关
user_id        # 用户ID
user_name      # 用户名
phone         # 手机号
email         # 邮箱

-- 状态相关
status        # 状态（1启用 0禁用）
type          # 类型

-- 金额相关
amount        # 金额（单位：分）
price         # 价格
balance       # 余额
```

### 4.3 索引规范

```sql
-- 唯一索引
ALTER TABLE tb_user ADD UNIQUE INDEX uk_phone (phone);

-- 普通索引
ALTER TABLE tb_user ADD INDEX idx_create_time (create_time);
ALTER TABLE tb_user ADD INDEX idx_status (status);

-- 联合索引
ALTER TABLE tb_apply ADD INDEX idx_user_job (user_id, job_id);
```

---

## 5. 异常处理规范

### 5.1 业务异常

```java
@Data
@NoArgsConstructor
@AllArgsConstructor
public class BusinessException extends RuntimeException {
    
    private Integer code;
    
    public BusinessException(String message) {
        super(message);
        this.code = 500;
    }
    
    public BusinessException(Integer code, String message) {
        super(message);
        this.code = code;
    }
}
```

### 5.2 全局异常处理

```java
@Slf4j
@RestControllerAdvice
public class GlobalExceptionHandler {

    /**
     * 处理业务异常
     */
    @ExceptionHandler(BusinessException.class)
    public CommonResult<Void> handleBusinessException(BusinessException e) {
        log.error("业务异常: {}", e.getMessage(), e);
        return CommonResult.failed(e.getCode(), e.getMessage());
    }

    /**
     * 处理参数校验异常
     */
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public CommonResult<Void> handleValidException(MethodArgumentNotValidException e) {
        BindingResult result = e.getBindingResult();
        String message = result.getFieldError() != null 
            ? result.getFieldError().getDefaultMessage() 
            : "参数校验失败";
        log.error("参数校验异常: {}", message);
        return CommonResult.failed(400, message);
    }

    /**
     * 处理运行时异常
     */
    @ExceptionHandler(RuntimeException.class)
    public CommonResult<Void> handleRuntimeException(RuntimeException e) {
        log.error("运行时异常: {}", e.getMessage(), e);
        return CommonResult.failed("系统异常，请稍后再试");
    }

    /**
     * 处理所有未知异常
     */
    @ExceptionHandler(Exception.class)
    public CommonResult<Void> handleException(Exception e) {
        log.error("系统异常: {}", e.getMessage(), e);
        return CommonResult.failed("系统异常，请联系管理员");
    }
}
```

---

## 6. 日志规范

### 6.1 日志级别使用

| 级别 | 使用场景 | 示例 |
|------|----------|------|
| ERROR | 需要关注的异常 | 数据库连接失败 |
| WARN | 警告信息 | 参数已废弃 |
| INFO | 重要业务流程 | 用户登录、订单创建 |
| DEBUG | 调试信息 | 详细参数输出 |

### 6.2 日志规范

```java
@Slf4j
@Service
public class UserServiceImpl implements UserService {

    // 1. 方法入口日志
    public User getById(Long id) {
        log.info("根据ID查询用户, id: {}", id);
        
        // 2. 方法执行日志
        User user = userMapper.selectById(id);
        
        // 3. 结果日志（INFO级别，调试用DEBUG）
        log.info("查询结果: {}", user);
        
        // 4. 异常日志（ERROR级别）
        try {
            // 业务逻辑
        } catch (Exception e) {
            log.error("根据ID查询用户失败, id: {}, error: {}", id, e.getMessage(), e);
            throw new BusinessException("查询失败");
        }
        
        return user;
    }
}
```

---

## 7. 安全规范

### 7.1 接口安全

```java
@RestController
@RequestMapping("/api/user")
public class UserController {

    /**
     * 需要登录的接口
     */
    @GetMapping("/profile")
    @LoginRequired
    public CommonResult<UserVO> getProfile() {
        // 获取当前用户ID
        Long userId = SecurityUtils.getCurrentUserId();
        return CommonResult.success(userService.getById(userId));
    }

    /**
     * 需要管理员权限的接口
     */
    @DeleteMapping("/{id}")
    @LoginRequired
    @AdminRequired
    public CommonResult<Void> deleteUser(@PathVariable Long id) {
        userService.deleteUser(id);
        return CommonResult.success();
    }
}
```

### 7.2 数据脱敏

```java
public class DataMaskUtil {
    
    /**
     * 手机号脱敏：138****1234
     */
    public static String maskPhone(String phone) {
        if (StringUtils.isBlank(phone)) {
            return "";
        }
        return phone.substring(0, 3) + "****" + phone.substring(7);
    }
    
    /**
     * 身份证脱敏：310***********1234
     */
    public static String maskIdCard(String idCard) {
        if (StringUtils.isBlank(idCard)) {
            return "";
        }
        return idCard.substring(0, 3) + "***********" + idCard.substring(14);
    }
    
    /**
     * 姓名脱敏：张*
     */
    public static String maskName(String name) {
        if (StringUtils.isBlank(name)) {
            return "";
        }
        return name.substring(0, 1) + "*";
    }
}
```

### 7.3 敏感参数校验

```java
public class ValidationUtil {
    
    /**
     * 校验手机号
     */
    public static boolean isValidPhone(String phone) {
        if (StringUtils.isBlank(phone)) {
            return false;
        }
        return phone.matches("^1[3-9]\\d{9}$");
    }
    
    /**
     * 校验邮箱
     */
    public static boolean isValidEmail(String email) {
        if (StringUtils.isBlank(email)) {
            return false;
        }
        return email.matches("^[a-zA-Z0-9_-]+@[a-zA-Z0-9_-]+(\\.[a-zA-Z0-9_-]+)+$");
    }
}
```

---

## 8. 配置规范

### 8.1 配置文件分层

```yaml
# application.yml
spring:
  application:
    name: ${APP_NAME:user-service}
  profiles:
    active: ${SPRING_PROFILES_ACTIVE:dev}
  cloud:
    nacos:
      config:
        server-addr: ${NACOS_SERVER:localhost:8848}
        file-extension: yml
        shared-dataids: common.yml
        refresh: true

# application-dev.yml
server:
  port: 7001

spring:
  datasource:
    url: jdbc:mysql://localhost:3306/db_dev
    username: root
    password: root123

# application-prod.yml
server:
  port: 7001

spring:
  datasource:
    url: jdbc:mysql://prod-db:3306/db_prod
    username: ${DB_USERNAME}
    password: ${DB_PASSWORD}
```

### 8.2 配置类规范

```java
@Configuration
@Data
@RefreshScope
public class WechatConfigProperties {
    
    @Value("${wechat.appid:}")
    private String appid;
    
    @Value("${wechat.secret:}")
    private String secret;
    
    @Value("${wechat.token:}")
    private String token;
    
    @Value("${wechat.aesKey:}")
    private String aesKey;
}
```

---

## 9. 事务规范

### 9.1 事务传播行为

```java
@Service
public class UserServiceImpl implements UserService {

    /**
     * 默认：required，如果当前有事务则加入
     */
    @Transactional
    @Override
    public void createOrder(OrderDTO orderDTO) {
        // 业务逻辑
    }

    /**
     * required_new：挂起当前事务，创建新事务
     */
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    @Override
    public void sendMessage(Message message) {
        // 发送消息
    }

    /**
     * nested：如果当前有事务则在嵌套事务中执行
     */
    @Transactional(propagation = Propagation.NESTED)
    @Override
    public void savePoint() {
        // 保存点操作
    }
}
```

### 9.2 事务回滚规则

```java
@Service
public class UserServiceImpl implements UserService {

    /**
     * 默认：只回滚RuntimeException和Error
     */
    @Transactional
    public void method1() {
        // ...
    }

    /**
     * 指定回滚Exception
     */
    @Transactional(rollbackFor = Exception.class)
    public void method2() {
        // ...
    }

    /**
     * 不回滚指定异常
     */
    @Transactional(noRollbackFor = BusinessException.class)
    public void method3() {
        // ...
    }
}
```

---

## 10. 测试规范

### 10.1 单元测试

```java
@SpringBootTest
@AutoConfigureMockMvc
class UserControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Test
    void testGetById() throws Exception {
        mockMvc.perform(get("/api/user/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(200))
                .andExpect(jsonPath("$.data.id").value(1));
    }

    @Test
    void testCreateUser() throws Exception {
        UserCreateDTO createDTO = new UserCreateDTO();
        createDTO.setName("张三");
        createDTO.setPhone("13800138000");

        mockMvc.perform(post("/api/user")
                .contentType(MediaType.APPLICATION_JSON)
                .content(new ObjectMapper().writeValueAsString(createDTO)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(200));
    }
}
```

### 10.2 Service测试

```java
@SpringBootTest
class UserServiceTest {

    @Autowired
    private UserService userService;

    @Test
    void testGetById() {
        UserVO userVO = userService.getById(1L);
        Assertions.assertNotNull(userVO);
        Assertions.assertEquals(1L, userVO.getId());
    }

    @Test
    void testCreateUser() {
        UserCreateDTO createDTO = new UserCreateDTO();
        createDTO.setName("测试用户");
        createDTO.setPhone("13800138001");

        Long userId = userService.createUser(createDTO);
        Assertions.assertNotNull(userId);
    }
}
```

---

## 11. Git提交规范

### 11.1 提交信息格式

```
<type>(<scope>): <subject>

<body>

<footer>
```

### 11.2 Type说明

| 类型 | 说明 |
|------|------|
| feat | 新功能 |
| fix | Bug修复 |
| docs | 文档更改 |
| style | 代码格式（不影响功能）|
| refactor | 重构 |
| perf | 性能优化 |
| test | 测试 |
| chore | 构建过程 |

### 11.3 提交示例

```
feat(user): 添加用户查询接口

实现用户详情查询功能，支持根据ID查询用户基本信息

Closes #123

Signed-off-by: zhangsan <zhangsan@imooc.com>
```

### 11.4 分支命名

```
feature/user-login      # 功能分支
fix/user-query-bug      # Bug修复分支
release/v1.0.0         # 发布分支
hotfix/critical-bug    # 热修复分支
```

---

## 12. 代码审查规范

### 12.1 代码审查清单

- [ ] 代码符合命名规范
- [ ] 分层结构清晰
- [ ] 异常处理完善
- [ ] 日志记录适当
- [ ] 接口文档完整
- [ ] 无硬编码敏感信息
- [ ] 事务处理正确
- [ ] 参数校验完整
- [ ] 单元测试覆盖
- [ ] SQL性能优化

### 12.2 审查关注点

1. **功能正确性**：代码是否正确实现需求
2. **代码可读性**：命名清晰、注释充分
3. **性能影响**：是否有性能问题
4. **安全性**：是否有安全漏洞
5. **可测试性**：是否便于测试

---

## 附录

### 附录A：常用依赖版本

```xml
<!-- Spring Boot -->
<parent>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-parent</artifactId>
    <version>2.7.18</version>
</parent>

<!-- JDK -->
<properties>
    <java.version>1.8</java.version>
    <maven.compiler.source>1.8</maven.compiler.source>
    <maven.compiler.target>1.8</maven.compiler.target>
</properties>

<!-- 主要依赖 -->
<dependencies>
    <!-- Spring Web -->
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-web</artifactId>
    </dependency>
    
    <!-- MyBatis -->
    <dependency>
        <groupId>org.mybatis.spring.boot</groupId>
        <artifactId>mybatis-spring-boot-starter</artifactId>
        <version>2.3.2</version>
    </dependency>
    
    <!-- MySQL -->
    <dependency>
        <groupId>com.mysql</groupId>
        <artifactId>mysql-connector-j</artifactId>
        <scope>runtime</scope>
    </dependency>
    
    <!-- Lombok -->
    <dependency>
        <groupId>org.projectlombok</groupId>
        <artifactId>lombok</artifactId>
        <optional>true</optional>
    </dependency>
    
    <!-- Swagger -->
    <dependency>
        <groupId>org.springdoc</groupId>
        <artifactId>springdoc-openapi-ui</artifactId>
        <version>1.7.0</version>
    </dependency>
</dependencies>
```

### 附录B：常见HTTP状态码

| 状态码 | 说明 |
|------|------|
| 200 | 成功 |
| 201 | 创建成功 |
| 400 | 参数错误 |
| 401 | 未授权 |
| 403 | 禁止访问 |
| 404 | 资源不存在 |
| 500 | 服务器错误 |
| 502 | 网关错误 |
| 503 | 服务不可用 |