/* eslint-disable @typescript-eslint/no-explicit-any */
import { gettoken } from "@/app/utils/gettoken";

export async function POST(request: Request) {
  // 获取请求中的参数
  const { folderName } = await request.json(); // 假设请求中包含 folderName
  const accessToken = await gettoken(); // 获取访问令牌

  // 请求指定文件夹的内容
  const url = `https://graph.microsoft.com/v1.0/me/drive/root:/${folderName}:/children`;

  const response = await fetch(url, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
  });

  const data = await response.json();

  console.log(data);
  // 提取每个文件的下载链接
  const downloadLinks = data.value.map((file: any) => ({
    name: file.name,
    downloadUrl: file["@microsoft.graph.downloadUrl"], // 获取下载链接
  }));

  return new Response(JSON.stringify(downloadLinks), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
    },
  });
}
