/**
 * 微信小程序全局变量类型声明
 */

interface WxCloudResult {
  fileID: string;
}

interface WxUserInfo {
  nickName: string;
  avatarUrl: string;
  gender: number;
}

interface WxTempFile {
  tempFilePath: string;
  size: number;
  fileType?: string;
}

declare namespace wx {
  const cloud: {
    callFunction(options: {
      name: string;
      data?: Record<string, unknown>;
    }): Promise<{ result: { openid: string } }>;
    uploadFile(options: {
      cloudPath: string;
      filePath: string;
    }): Promise<WxCloudResult>;
  };

  const canIUse: (api: string) => boolean;

  function getUserProfile(options: {
    desc: string;
    success: (res: { userInfo: WxUserInfo }) => void;
    fail?: () => void;
  }): void;

  function chooseMedia(options: {
    count: number;
    mediaType: string[];
    sourceType: string[];
    success: (res: { tempFiles: WxTempFile[] }) => void;
    fail?: (error: Error) => void;
  }): void;

  function uploadFile(options: {
    url: string;
    filePath: string;
    name: string;
    success: (res: { data: string }) => void;
    fail?: (error: Error) => void;
  }): void;

  function showToast(options: {
    title: string;
    icon?: 'success' | 'loading' | 'error' | 'none';
  }): void;

  function showShareMenu(options: {
    withShareTicket?: boolean;
    menus?: string[];
  }): void;

  function onShareAppMessage(
    callback: () => {
      title?: string;
      imageUrl?: string;
      query?: string;
    }
  ): void;
}
