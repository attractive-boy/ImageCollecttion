import { promises as fs } from 'fs';
import path from 'path';

export async function gettoken() {
    const filePath = path.join(process.cwd(), 'accesstoken.json');
    // 读取文件并解析为JSON对象
    const fileContents = await fs.readFile(filePath, 'utf-8');
    const jsonData = JSON.parse(fileContents);
    const { expires_in, now } = jsonData;
    //判断是否过期
    const isExpired = now + expires_in * 1000 < Date.now();
    let { access_token } = jsonData;
    if (isExpired) {
      const { refresh_token } = jsonData;
      // 重新获取token
      const newToken = await fetch('https://login.microsoftonline.com/common/oauth2/v2.0/token', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
            client_id: "08aa5d5c-fb91-4e84-a650-024effb790c5",
            redirect_uri: 'http://localhost/',
            client_secret: 'o-T8Q~uqnw0AQtbZrzXSMBXLz2.QkYTsF5SgOdyL',
            refresh_token: refresh_token,
            grant_type: 'refresh_token',
        }).toString()
      }).then(res => res.json())
        .then(data => {
            return data;
        })
        .catch(err => {
            console.log(err);
        });
        
        // 加一个当前时间戳
        newToken.now = Date.now();
        //存储到文件 覆盖掉原来的内容
        await fs.writeFile(filePath, JSON.stringify(newToken));
        access_token = newToken.access_token;
    }

    return access_token;
}