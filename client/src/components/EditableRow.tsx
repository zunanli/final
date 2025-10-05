import React, { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { useItem } from '@/store/listStore.ts';
import useListStore from '@/store/listStore.ts';

interface EditableRowProps {
  index: number;
}

const EditableRow: React.FC<EditableRowProps> = React.memo(({ index }) => {
  // 使用selector只订阅单个item的变化
  const item = useItem(index);
  const updateItem = useListStore((state) => state.updateItem);
  const [isEditing, setIsEditing] = useState(false);
  const [value, setValue] = useState(item?.text || '');
  const inputRef = useRef<HTMLInputElement>(null);

  // 添加日志观察重渲染 - 现在应该只有对应item变化时才会重渲染
  // console.log(`✅ EditableRow ${index} 重新渲染了！`, { item: item?.text });

  // 当item变化时更新value
  useEffect(() => {
    if (item?.text) {
      setValue(item.text);
    }
  }, [item?.text]);

  // 当进入编辑模式时，自动聚焦到输入框
  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select(); // 选中所有文本
    }
  }, [isEditing]);

  const handleFocus = () => {
    setIsEditing(true);
  };

  const handleBlur = () => {
    setIsEditing(false);
    // 当失去焦点时，如果值发生变化，调用回调函数
    if (item && value !== item.text) {
      updateItem(index, value);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setValue(e.target.value);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      // 按 Enter 键时失去焦点，触发保存
      inputRef.current?.blur();
    } else if (e.key === 'Escape') {
      // 按 Esc 键时取消编辑，恢复原值
      setValue(item?.text || '');
      inputRef.current?.blur();
    }
  };

  // 如果item不存在，返回空
  if (!item) {
    return null;
  }

  return (
    <div className={cn(
      "flex items-center h-full px-4 py-2 border-b border-border",
      index % 2 === 0 ? "bg-muted/50" : "bg-background"
    )}>
      <span className="font-bold mr-3 min-w-[40px] text-muted-foreground">
        #{index + 1}
      </span>
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={handleChange}
        onFocus={handleFocus}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        className={cn(
          "flex-1 bg-transparent outline-none text-sm transition-all",
          isEditing 
            ? "border border-input rounded px-2 py-1 cursor-text" 
            : "border-none p-0 cursor-pointer hover:bg-muted/30 rounded px-1"
        )}
        readOnly={!isEditing}
        title="点击编辑，按 Enter 保存，按 Esc 取消"
      />
    </div>
  );
});

EditableRow.displayName = 'EditableRow';

export default EditableRow;