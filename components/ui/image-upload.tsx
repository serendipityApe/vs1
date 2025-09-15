"use client";

import { useState } from "react";
import { Button } from "@heroui/button";
import { Card, CardBody } from "@heroui/card";
import { Upload, X } from "lucide-react";

interface ImageUploadProps {
  type: "logo" | "gallery";
  images: File[];
  onImagesChange: (images: File[]) => void;
  maxImages?: number;
  title?: string;
  description?: string;
}

export function ImageUpload({
  type,
  images,
  onImagesChange,
  maxImages = type === "logo" ? 1 : 5,
  title,
  description,
}: ImageUploadProps) {
  const [dragActive, setDragActive] = useState(false);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files) {
      const files = Array.from(e.dataTransfer.files).filter((file) =>
        file.type.startsWith("image/")
      );

      if (type === "logo") {
        onImagesChange(files.slice(0, 1));
      } else {
        const newImages = [...images, ...files].slice(0, maxImages);
        onImagesChange(newImages);
      }
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files).filter((file) =>
        file.type.startsWith("image/")
      );

      if (type === "logo") {
        onImagesChange(files.slice(0, 1));
      } else {
        const newImages = [...images, ...files].slice(0, maxImages);
        onImagesChange(newImages);
      }
    }
  };

  const removeImage = (index: number) => {
    const newImages = images.filter((_, i) => i !== index);
    onImagesChange(newImages);
  };

  const inputId = `${type}-upload-${Math.random().toString(36).substr(2, 9)}`;

  return (
    <div className="space-y-4">
      {title && <h3 className="text-lg font-medium">{title}</h3>}
      {description && <p className="text-sm text-foreground-500">{description}</p>}

      {/* Current Images */}
      {images.length > 0 && (
        <div className={`grid gap-4 ${type === "logo" ? "grid-cols-1 max-w-xs" : "grid-cols-2 md:grid-cols-3"}`}>
          {images.map((file, index) => (
            <div key={index} className="relative group">
              <div className={`bg-content2 rounded-lg overflow-hidden ${type === "logo" ? "aspect-square w-32" : "aspect-video"}`}>
                <img
                  src={URL.createObjectURL(file)}
                  alt={`${type} ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              </div>
              <Button
                isIconOnly
                size="sm"
                color="danger"
                variant="solid"
                className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                onPress={() => removeImage(index)}
              >
                <X className="w-3 h-3" />
              </Button>
              <p className="text-xs text-foreground-500 mt-1 truncate">{file.name}</p>
            </div>
          ))}
        </div>
      )}

      {/* Upload Area */}
      {(type === "logo" ? images.length === 0 : images.length < maxImages) && (
        <Card
          className={`border-2 border-dashed transition-colors cursor-pointer ${
            dragActive ? "border-primary bg-primary/5" : "border-default-300 hover:border-default-400"
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          isPressable
          onPress={() => document.getElementById(inputId)?.click()}
        >
          <CardBody className="flex flex-col items-center justify-center p-8 text-center">
            <Upload className="w-8 h-8 mb-4 text-foreground-400" />
            <p className="text-sm text-foreground-600 mb-2">
              {type === "logo"
                ? "拖拽Logo到此处或点击上传"
                : `拖拽图片到此处或点击上传 (${images.length}/${maxImages})`}
            </p>
            <p className="text-xs text-foreground-500">
              支持 PNG, JPG, WebP 格式
            </p>
            <input
              type="file"
              accept="image/*"
              multiple={type === "gallery"}
              onChange={handleFileInput}
              className="hidden"
              id={inputId}
            />
            <Button
              variant="bordered"
              size="sm"
              className="mt-4"
              onPress={() => document.getElementById(inputId)?.click()}
            >
              选择{type === "logo" ? "Logo" : "图片"}
            </Button>
          </CardBody>
        </Card>
      )}
    </div>
  );
}