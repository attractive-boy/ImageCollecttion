import { gettoken } from "@/app/utils/gettoken";

async function deleteFolder(folderPath: string) {
  const accesstoken = await gettoken();

  // 获取文件夹内容
  const getFolderContentsUrl = `https://graph.microsoft.com/v1.0/me/drive/root:/${folderPath}/children`;

  // 获取文件夹内容
  const folderContentsResponse = await fetch(getFolderContentsUrl, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${accesstoken}`,
      "Content-Type": "application/json",
    },
  });

  const contents = await folderContentsResponse.json();
  if (!contents.error) {
    // 遍历文件夹内容
    for (const item of contents.value) {
      const itemPath = `${folderPath}/${item.name}`;

      if (item.folder) {
        // 如果是文件夹，递归删除其内容
        await deleteFolder(itemPath);
      } else {
        // 如果是文件，删除文件
        const deleteFileUrl = `https://graph.microsoft.com/v1.0/me/drive/root:/${itemPath}`;

        await fetch(deleteFileUrl, {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${accesstoken}`,
            "Content-Type": "application/json",
          },
        });

        console.log(`Deleted file: ${itemPath}`);
      }
    }
  }

  // 删除空文件夹
  const deleteFolderUrl = `https://graph.microsoft.com/v1.0/me/drive/root:/${folderPath}`;

  await fetch(deleteFolderUrl, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${accesstoken}`,
      "Content-Type": "application/json",
    },
  });
}

// Example POST handler that uses deleteFolder
export async function POST(request: Request) {
  const { name } = await request.json(); // 获取要删除的文件夹路径

  try {
    await deleteFolder(name);
    return new Response(
      JSON.stringify({ message: "Folder deleted successfully." }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ error }), {
      status: 500,
      headers: {
        "Content-Type": "application/json",
      },
    });
  }
}

export const revalidate = 0;
export const fetchCache = 'force-no-store'
