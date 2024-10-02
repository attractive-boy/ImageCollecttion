/* eslint-disable @typescript-eslint/no-explicit-any */

import { gettoken } from '@/app/utils/gettoken';
import { NextRequest, NextResponse } from 'next/server';

// 创建上传会话的函数
async function createUploadSession(fileName: string, accessToken: string) {
  try {
    const response = await fetch(`https://graph.microsoft.com/v1.0/me/drive/root:/${fileName}:/createUploadSession`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        item: {
          "@microsoft.graph.conflictBehavior": "replace"
        },
      }),
    });

    const data = await response.json();
    console.log(data);
    return data.uploadUrl;  // 返回用于上传的URL
  } catch (error) {
    throw new Error(`Error creating upload session: ${error}`);
  }
}

// 分块上传大文件的函数
async function uploadLargeFile(file: string) {
  try {
    const accessToken = await gettoken();  // 获取 OneDrive 的访问令牌

    // 创建上传会话
    const uploadUrl = await createUploadSession(file, accessToken);

    return uploadUrl;

    
  } catch (error) {
    console.error('Error during upload:', error);
    return { success: false, message: error };
  }
}

// Next.js API 处理请求的主入口
export async function POST(request: NextRequest) {
  try {
    // 获取传入的文件
    const { url } = await request.json();

    if (!url) {
      return NextResponse.json({ error: 'No url' }, { status: 400 });
    }

    // 执行大文件上传
    const result = await uploadLargeFile(url);
    return NextResponse.json({ result }, { status: 200 });

  } catch (error) {
    return NextResponse.json({ error: error }, { status: 500 });
  }
}
