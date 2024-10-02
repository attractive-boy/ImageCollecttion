import { gettoken } from "@/app/utils/gettoken";

export async function POST(request: Request) {
  //获取参数
  const { name } = await request.json();
  const accesstoken = await gettoken();
  const url = `https://graph.microsoft.com/v1.0/me/drive/root/children`;

  const response = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accesstoken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      name,
      folder: {}, // 表示这是一个文件夹
      "@microsoft.graph.conflictBehavior": "rename", // 如果文件夹名冲突，自动重命名
    }),
  });

  if (response.ok) {
    const folderData = await response.json();
    return new Response(JSON.stringify(folderData), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } else {
    const errorData = await response.json();
    return new Response(JSON.stringify(errorData), {
      status: response.status,
    });
  }
}


export const revalidate = 0;
export const fetchCache = 'force-no-store'