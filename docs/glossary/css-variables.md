> [!DANGER]
>
> 本页由 AI 工具参考代码编写，尚未经过人工审核，内容仅供参考。如果无法解决问题或需要协助部署，可邮箱联系：kuohu@getastra.cn

# CSS 变量

## 通俗解释

CSS 变量就是给样式值起个名字，方便复用和修改。比如定义 `--banner-height: 40px`，用的地方都引用这个变量。想改高度？改一处就行，不用到处找。

AstraSchedule 用 CSS 变量控制横幅高度、课表颜色等样式。

## 专业解释

CSS 变量（也叫自定义属性）是 CSS 的特性，允许在样式表中定义可复用的值。

定义和使用：
```css
:root {
  --banner-height: 40px;
  --brand-color: #1890ff;
}

.banner {
  height: var(--banner-height);
  color: var(--brand-color);
}
```

特点：
- **作用域**：在 `:root` 定义全局可用，在选择器内定义局部可用
- **继承**：子元素继承父元素的变量值
- **动态**：可通过 JavaScript 动态修改
- **降级值**：`var(--name, fallback)` 提供默认值

在 AstraSchedule 中，CSS 变量用于：
- 横幅高度（`--banner-height`）
- 课表样式
- 主题颜色
