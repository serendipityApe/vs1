"use client";

import { useState } from "react";
import Image from "next/image";
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
        file.type.startsWith("image/"),
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
        file.type.startsWith("image/"),
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
    <div className="space-y-4 font-mono">
      {title && <h3 className="text-lg font-bold uppercase">{title}</h3>}
      {description && (
        <p className="text-sm text-foreground-500">{description}</p>
      )}

      {/* Current Images */}
      {images.length > 0 && (
        <div
          className={`grid gap-4 ${type === "logo" ? "grid-cols-1 max-w-xs" : "grid-cols-2 md:grid-cols-3"}`}
        >
          {images.map((file, index) => (
            <div key={index} className="relative group">
              <div
                className={`bg-content2 border border-foreground relative ${type === "logo" ? "aspect-square w-32" : "aspect-video"}`}
              >
                <Image
                  fill
                  alt={`${type} ${index + 1}`}
                  className="w-full h-full object-cover"
                  sizes={
                    type === "logo" ? "128px" : "(max-width: 768px) 50vw, 33vw"
                  }
                  src={URL.createObjectURL(file)}
                />
                <Button
                  isIconOnly
                  className="absolute top-0 right-0 rounded-none h-6 w-6 bg-red-600 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                  radius="none"
                  size="sm"
                  variant="solid"
                  onPress={() => removeImage(index)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
              <p className="text-xs text-foreground-500 mt-1 truncate font-mono">
                {file.name}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Upload Area */}
      {(type === "logo" ? images.length === 0 : images.length < maxImages) && (
        <Card
          isPressable
          className={`border-2 border-dashed transition-all cursor-pointer w-full ${
            dragActive
              ? "border-primary bg-primary/10"
              : "border-foreground/50 hover:border-primary hover:bg-content2"
          }`}
          radius="none"
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onPress={() => document.getElementById(inputId)?.click()}
        >
          <CardBody className="flex flex-col items-center justify-center p-8 text-center">
            <Upload className="w-8 h-8 mb-4 text-foreground" />
            <p className="text-sm text-foreground font-bold uppercase mb-2">
              {type === "logo"
                ? "DROP_LOGO_HERE"
                : `DROP_IMAGES [${images.length}/${maxImages}]`}
            </p>
            <p className="text-xs text-foreground-500 font-mono">
              *.png, *.jpg, *.webp allowed
            </p>
            <input
              accept="image/*"
              className="hidden"
              id={inputId}
              multiple={type === "gallery"}
              type="file"
              onChange={handleFileInput}
            />
            <Button
              className="mt-4 font-bold uppercase border border-foreground"
              radius="none"
              size="sm"
              variant="bordered"
              onPress={() => document.getElementById(inputId)?.click()}
            >
              BROWSE_FILES
            </Button>
          </CardBody>
        </Card>
      )}
    </div>
  );
}
