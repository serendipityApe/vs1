import { addToast } from "@heroui/react";

export const showErrorToast = (title: string, description?: string) => {
  addToast({
    title,
    description: description || "请重试或联系支持",
    color: "danger",
  });
};

export const showSuccessToast = (title: string, description?: string) => {
  addToast({
    title,
    description,
    color: "success",
  });
};

export const showInfoToast = (title: string, description?: string) => {
  addToast({
    title,
    description,
    color: "primary",
  });
};

// API错误处理的通用函数
export const handleApiError = (error: any, customMessage?: string) => {
  console.error("API Error:", error);

  if (customMessage) {
    showErrorToast(customMessage);

    return;
  }

  // 根据错误类型显示不同的消息
  if (error instanceof TypeError && error.message.includes("fetch")) {
    showErrorToast("网络错误", "请检查网络连接");
  } else if (error?.response?.status === 400) {
    showErrorToast(
      "请求错误",
      error?.response?.data?.message || "请检查输入信息",
    );
  } else if (error?.response?.status === 401) {
    showErrorToast("未授权", "请重新登录");
  } else if (error?.response?.status === 403) {
    showErrorToast("权限不足", "您没有执行此操作的权限");
  } else if (error?.response?.status === 404) {
    showErrorToast("未找到", "请求的资源不存在");
  } else if (error?.response?.status >= 500) {
    showErrorToast("服务器错误", "服务器暂时出现问题，请稍后重试");
  } else {
    showErrorToast("操作失败", "发生了未知错误");
  }
};
