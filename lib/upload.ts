export async function uploadFiles(files: File[]): Promise<string[]> {
  if (files.length === 0) return [];

  const formData = new FormData();

  files.forEach((file, index) => {
    formData.append(`file${index}`, file);
  });

  const response = await fetch("/api/upload", {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json();

    throw new Error(error.error || "上传失败");
  }

  const data = await response.json();

  return data.files.map((file: any) => file.url);
}
