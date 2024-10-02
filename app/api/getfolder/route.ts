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

  //   {
  //     "@odata.context": "https://graph.microsoft.com/v1.0/$metadata#users('2414687096%40qq.com')/drive/root/children",
  //     "value": [
  //         {
  //             "createdDateTime": "2024-09-30T03:30:37Z",
  //             "eTag": "\"{EE23291B-CDA5-4716-98AA-4A670FD80896},2\"",
  //             "id": "6EC39AFF71928299!see23291bcda5471698aa4a670fd80896",
  //             "lastModifiedDateTime": "2024-09-30T03:30:38Z",
  //             "name": "helloonedrive",
  //             "webUrl": "https://onedrive.live.com?cid=6EC39AFF71928299&id=6EC39AFF71928299!see23291bcda5471698aa4a670fd80896",
  //             "cTag": "\"c:{EE23291B-CDA5-4716-98AA-4A670FD80896},0\"",
  //             "size": 0,
  //             "createdBy": {
  //                 "application": {
  //                     "id": "00000003-0000-0000-c000-000000000000",
  //                     "displayName": "Microsoft Graph"
  //                 },
  //                 "user": {
  //                     "email": "2414687096@qq.com",
  //                     "id": "6EC39AFF71928299",
  //                     "displayName": "成 李"
  //                 }
  //             },
  //             "lastModifiedBy": {
  //                 "application": {
  //                     "id": "00000003-0000-0000-c000-000000000000",
  //                     "displayName": "Microsoft Graph"
  //                 },
  //                 "user": {
  //                     "email": "2414687096@qq.com",
  //                     "id": "6EC39AFF71928299",
  //                     "displayName": "成 李"
  //                 }
  //             },
  //             "parentReference": {
  //                 "driveType": "personal",
  //                 "driveId": "6EC39AFF71928299",
  //                 "id": "6EC39AFF71928299!sea8cc6beffdb43d7976fbc7da445c639",
  //                 "name": "Documents",
  //                 "path": "/drive/root:",
  //                 "siteId": "ee9872f4-a83c-4670-a57d-63ada1b719ba"
  //             },
  //             "fileSystemInfo": {
  //                 "createdDateTime": "2024-09-30T03:30:37Z",
  //                 "lastModifiedDateTime": "2024-09-30T03:30:38Z"
  //             },
  //             "folder": {
  //                 "childCount": 0,
  //                 "view": {
  //                     "sortBy": "name",
  //                     "sortOrder": "ascending",
  //                     "viewType": "thumbnails"
  //                 }
  //             }
  //         }
  //     ]
  // }
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
