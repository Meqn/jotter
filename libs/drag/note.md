## 事件执行顺序
`mousedown`, `mouseup`, `click` 事件执行顺序:
1. 鼠标左键: 依次触发 mousedown、mouseup、click，前一个事件执行完毕才会执行下一个事件
2. 鼠标右键: 依次触发 mousedown、mouseup，同上，但不会触发 click事件

## 实现逻辑
1. 首先计算拖拽边界，返回`X`和`Y`的移动位置最大最小值 `{minX,maxX,minY,maxY}`
2. start时，记录鼠标按下时的位置(startX)和元素的位置(positionLeft)；并绑定move和end事件
3. move时，用当前位置减去开始时的位置，计算出偏移量(offsetX); 如果限制水平或垂直移动方向，则设置偏移量为0；如果超出拖拽边界，则设置偏移量为最大最小值。
4. end时，解绑move和end事件；计算偏移量是否为click事件。




## refs
- [draggabilly](https://github.com/desandro/draggabilly)
