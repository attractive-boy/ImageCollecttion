/* eslint-disable @typescript-eslint/no-explicit-any */

import { gettoken } from '@/app/utils/gettoken';
import { NextRequest, NextResponse } from 'next/server';

// 创建上传会话的函数
export async function createUploadSession(fileName: string, accessToken: string) {
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

// 上传文件块的函数
export async function uploadChunk(uploadUrl: string, file: Blob, start: number, end: number) {
  const chunk = file.slice(start, end);  // 获取文件块
  const fileSize = file.size;

  try {
    const response = await fetch(uploadUrl, {
      method: 'PUT',
      headers: {
        'Content-Range': `bytes ${start}-${end - 1}/${fileSize}`,
        'Content-Length': `${end - start}`,
      },
      body: chunk,  // 上传的文件块
    });

    const data = await response.json();

    return data;
  } catch (error) {
    throw new Error(`Error uploading chunk: ${error}`);
  }
}

// 分块上传大文件的函数
export async function uploadLargeFile(file: string) {
  try {
    const accessToken = await gettoken();  // 获取 OneDrive 的访问令牌

    // 创建上传会话
    const uploadUrl = await createUploadSession(file, accessToken);

    return uploadUrl;

    // const chunkSize = 5 * 1024 * 1024;  // 每个分块大小为 5MB
    // let start = 0;
    // let end = chunkSize;

    // while (start < file.size) {
    //   console.log(`Uploading chunk: ${start}-${end}`);
      
    //   // 分块上传文件
    //   await uploadChunk(uploadUrl, file, start, Math.min(end, file.size));
      
    //   start = end;
    //   end = Math.min(start + chunkSize, file.size);  // 计算下一个块的结束位置
    // }

    // console.log('File upload complete!');
    // return { success: true, message: 'File uploaded successfully' };
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
