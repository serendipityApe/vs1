"use client";

import { Card, CardBody } from "@heroui/card";

const failureTypes = [
  {
    id: "abandoned",
    label: "烂尾项目",
    description: "满怀激情开始，以存在危机结束",
    emoji: "🏗️",
  },
  {
    id: "overengineered",
    label: "过度工程",
    description: "用47个微服务做一个待办清单",
    emoji: "🔧",
  },
  {
    id: "ai-disaster",
    label: "AI灾难",
    description: "机器学习学到了错误的教训",
    emoji: "🤖",
  },
  {
    id: "ui-nightmare",
    label: "UI噩梦",
    description: "对你来说很美，对所有人来说很困惑",
    emoji: "🎨",
  },
  {
    id: "performance",
    label: "性能地狱",
    description: "加载'Hello World'需要30秒",
    emoji: "🐌",
  },
  {
    id: "security",
    label: "安全漏洞",
    description: "意外地把所有东西都公开了",
    emoji: "🔓",
  },
];

interface FailureTypeSelectorProps {
  value: string;
  onChange: (value: string) => void;
}

export function FailureTypeSelector({
  value,
  onChange,
}: FailureTypeSelectorProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
      {failureTypes.map((type) => (
        <Card
          key={type.id}
          isPressable
          className={`cursor-pointer transition-colors ${
            value === type.id
              ? "ring-2 ring-primary bg-primary/5 border-primary"
              : "hover:bg-content2/50"
          }`}
          onPress={() => onChange(type.id)}
        >
          <CardBody className="p-4">
            <div className="flex items-center gap-3">
              <span className="text-2xl">{type.emoji}</span>
              <div className="flex-1">
                <h4 className="font-medium text-sm">{type.label}</h4>
                <p className="text-xs text-foreground-500 mt-1">
                  {type.description}
                </p>
              </div>
            </div>
          </CardBody>
        </Card>
      ))}
    </div>
  );
}
