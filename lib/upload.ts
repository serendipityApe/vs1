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

  // require storagePath (id) returned by the upload API.
  // Fallback to throwing an error rather than returning a signed URL,
  // to avoid accidentally storing ephemeral URLs in the database.
  const ids = data.files.map((file: any) => file.storagePath);

  if (ids.some((id: any) => !id)) {
    throw new Error("上传失败：服务器未返回 storagePath，请检查上传接口");
  }

  return ids;
}
