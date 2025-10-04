import React, { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface EditableRowProps {
  index: number;
  item: { id: number; text: string };
  onItemChange?: (index: number, newValue: string) => void;
}

export default function EditableRow({ index, item, onItemChange }: EditableRowProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [value, setValue] = useState(item.text);
  const inputRef = useRef<HTMLInputElement>(null);

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
    if (value !== item.text && onItemChange) {
      onItemChange(index, value);
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
      setValue(item.text);
      inputRef.current?.blur();
    }
  };

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
}