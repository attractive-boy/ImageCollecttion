/* eslint-disable @typescript-eslint/no-explicit-any */

import { gettoken } from '@/app/utils/gettoken';
import { NextRequest, NextResponse } from 'next/server';

// Next.js API 处理请求的主入口
export async function POST(request: NextRequest) {
  try {
    // 获取传入的文件
    const { url } = await request.json();

    if (!url) {
      return NextResponse.json({ error: 'No url' }, { status: 400 });
    }

    const accessToken = await gettoken();  // 获取 OneDrive 的访问令牌

    // 创建上传会话
    const response = await fetch(`https://graph.microsoft.com/v1.0/me/drive/root:/${url}:/createUploadSession`, {
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

    if (!response.ok) {
      throw new Error(`Error creating upload session: ${data.error.message}`);
    }

    console.log(data);
    const uploadUrl = data.uploadUrl;  // 返回用于上传的URL

    return NextResponse.json({ uploadUrl }, { status: 200 });

  } catch (error) {
    console.error('Error during upload:', error);
    return NextResponse.json({ error: error || 'Internal server error' }, { status: 500 });
  }
}


export const revalidate = 0;
export const fetchCache = 'force-no-store'