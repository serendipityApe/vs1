"use client";

import { Card, CardBody } from "@heroui/card";

const failureTypes = [
  {
    id: "abandoned",
    label: "ABANDONED_PROJECT",
    description: "Started with passion, ended with existential dread.",
    emoji: "🏗️",
  },
  {
    id: "overengineered",
    label: "OVER_ENGINEERED",
    description: "47 microservices to render a Hello World.",
    emoji: "🔧",
  },
  {
    id: "ai-disaster",
    label: "AI_HALLUCINATION",
    description: "Machine learning learned the wrong lesson.",
    emoji: "🤖",
  },
  {
    id: "ui-nightmare",
    label: "UI_NIGHTMARE",
    description: "Beautiful to you, confusing to literally everyone else.",
    emoji: "🎨",
  },
  {
    id: "performance",
    label: "PERFORMANCE_HELL",
    description: "Loading state lasts longer than the user's attention span.",
    emoji: "🐌",
  },
  {
    id: "security",
    label: "SECURITY_BREACH",
    description: "Accidentally made everything public (oops).",
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
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 font-mono">
      {failureTypes.map((type) => (
        <Card
          key={type.id}
          isPressable
          className={`cursor-pointer transition-all border-2 ${
            value === type.id
              ? "border-primary bg-primary text-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
              : "border-foreground bg-background hover:bg-content2"
          }`}
          radius="none"
          onPress={() => onChange(type.id)}
        >
          <CardBody className="p-4">
            <div className="flex items-center gap-3">
              <span className="text-2xl">{type.emoji}</span>
              <div className="flex-1 text-left">
                <h4 className="font-bold text-sm uppercase">{type.label}</h4>
                <p
                  className={`text-xs mt-1 ${value === type.id ? "text-black/80" : "text-foreground-500"}`}
                >
                  {type.description}
                </p>
              </div>
              {value === type.id && <div className="font-bold text-lg">✓</div>}
            </div>
          </CardBody>
        </Card>
      ))}
    </div>
  );
}
