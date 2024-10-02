/* eslint-disable @typescript-eslint/no-explicit-any */
import { gettoken } from "@/app/utils/gettoken";


export async function GET() {
  
  try {
    const accesstoken = await gettoken();
    // 请求OneDrive根目录下的所有文件
    const response = await fetch('https://graph.microsoft.com/v1.0/me/drive/root/children', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accesstoken}`,
        'Content-Type': 'application/json'
      }
    });
    const data = await response.json();
    console.log(data)
    // 提取出 文件夹名称 内部文件数量 文件夹占用空间 文件夹创建时间
    const folders = data.value.map((item: any) => {
      return {
        name: item.name,
        childCount: item.folder?.childCount,
        size: item.size,
        createdDateTime: item.createdDateTime,
      };
    });


    return new Response(JSON.stringify(folders), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    return new Response(error?.toString(), {
      status: 500,
    });
  }
}

export const revalidate = 0;
export const fetchCache = 'force-no-store'
