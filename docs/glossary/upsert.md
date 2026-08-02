> [!DANGER]
>
> 本页由 AI 工具参考代码编写，尚未经过人工审核，内容仅供参考。如果无法解决问题或需要协助部署，可邮箱联系：kuohu@getastra.cn

# Upsert

## 通俗解释

Upsert 是"更新或插入"的缩写。意思是：如果记录存在就更新，不存在就插入。一条 SQL 搞定两件事，不用先查再改。

AstraSchedule 用 upsert 保存配置，保证数据一致性。

## 专业解释

Upsert（Update or Insert）是数据库操作，结合了 UPDATE 和 INSERT 功能。

SQL 语法（SQLite）：
```sql
INSERT INTO table (id, name) VALUES (1, 'test')
ON CONFLICT(id) DO UPDATE SET name = excluded.name
```

SQL 语法（MySQL）：
```sql
INSERT INTO table (id, name) VALUES (1, 'test')
ON DUPLICATE KEY UPDATE name = VALUES(name)
```
> 提示：MySQL 8.0.20+ 中 `VALUES(name)` 已弃用，推荐写作 `name = NEW.name`。

优势：
- **原子操作**：一条语句完成，无需事务
- **避免竞态**：并发操作不会丢失更新
- **简化代码**：不用先查后改

在 AstraSchedule 中，配置类写入统一使用 GORM 的 `clause.OnConflict` 实现 upsert，保证数据一致性且同时兼容 SQLite 与 MySQL。
