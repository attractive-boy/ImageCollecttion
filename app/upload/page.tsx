/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"; // This is a client component 👈🏽

import type { ActionType } from "@ant-design/pro-components";
import { ProList } from "@ant-design/pro-components";
import { Button, Input, message,Image,notification,Progress } from "antd";
import React, { useRef, useState, useEffect } from "react";
import request from "umi-request";

export default function UploadPage() {
  const [activeKey, setActiveKey] = useState<React.Key | undefined>("tab1");
  const action = useRef<ActionType>();

  const [uploadUser, setUploadUser] = useState<string>("");
  const [uploadedImages, setUploadedImages] = useState<any[]>([]); // 用于展示已上传图片

  // 这里定义一个 state 来保存从 URL 获取的参数
  const [idParam, setIdParam] = useState<string | null>(null);

  useEffect(() => {
    // 使用 URLSearchParams 获取查询参数
    const params = new URLSearchParams(window.location.search);
    const paramValue = params.get("id"); // 获取 id 参数
    setIdParam(paramValue); // 保存到 state

    // 从本地存储恢复已上传的图片信息
    const localStorageKey = paramValue ? decodeURIComponent(window.atob(paramValue)) : "";
    const savedImages = JSON.parse(localStorage.getItem(localStorageKey) || "[]");
    setUploadedImages(savedImages);
  }, [idParam]);

  const handleUpload = () => {
    if (!uploadUser) {
      message.error("请输入上传用户名");
      return;
    }
    const input = document.createElement("input");
    input.type = "file";
    input.multiple = true;
    input.accept = "image/*";
    input.onchange = async () => {
      const files = input.files;
      if (!files) return;
      const key = `download_${Date.now()}`; // 生成唯一key
        // 打开一个通知框，并初始化进度条
        notification.open({
          key,
          message: "文件上传中...",
          description: <Progress percent={0} />,
          duration: null, // 避免自动关闭
        });
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        //年月日时分秒毫秒
        const now = new Date();
        const fileName = `${uploadUser}${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}${String(now.getHours()).padStart(2, '0')}${String(now.getMinutes()).padStart(2, '0')}${String(now.getSeconds()).padStart(2, '0')}${String(now.getMilliseconds()).padStart(3, '0')}`;
        const fileType = file.name.split(".").pop();
        const url = `${decodeURIComponent(window.atob(idParam ?? ""))}/${fileName}.${fileType}`;
        const localStorageKey = idParam ? decodeURIComponent(window.atob(idParam)) : "";
        
        let state = "成功";
        try{
          await request("/api/getuploadurl", {
            method: "POST",
            data: {                               
              url,
            },
          }).then(async (res) => {
            // 上传文件到服务器
            // console.log(res.result); //url
            const formData = new FormData();
            formData.append("file", file);

            const chunkSize = 5 * 1024 * 1024; // 每块5MB
            const totalSize = file.size;
            let start = 0;
            let end = Math.min(chunkSize, totalSize);

            while (start < totalSize) {
              const chunk = file.slice(start, end);
              const contentRange = `bytes ${start}-${
                end - 1
              }/${totalSize}`;

              await request(res.uploadUrl, {
                method: "PUT",
                headers: {
                  "Content-Type": fileType || "application/json", // 添加默认值
                  "Content-Length": chunk.size.toString(),
                  "Content-Range": contentRange, // 关键: 指定当前块的范围
                },
                body: chunk, // 上传当前块
              });

              // 更新下一个块的位置
              start = end;
              end = Math.min(start + chunkSize, totalSize);
            }
          });
        } catch {
          state = "失败";
        }

        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = function () {
          const newImage = {
            url,
            base64: reader.result,
            state,
            fileName: `${fileName}.${fileType}`,
            // 年月日时分秒
            time: new Date().toLocaleString(),
          };
          const updatedImages = [newImage, ...JSON.parse(localStorage.getItem(localStorageKey) || "[]")];
          setUploadedImages(updatedImages);
          localStorage.setItem(localStorageKey, JSON.stringify(updatedImages));
        };
        notification.open({
          key,
          message: "文件上传中...",
          description: <Progress percent={((i+1)/files.length)*100} />,
        });
      }
      notification.open({
        key,
        message: "上传完成！",
        description: <Progress percent={100} />,
      });
    };
    input.click();
  };

  return (
    <div style={{ width: "90%", margin: "5vh auto" }}>
      <ProList
        rowKey="name"
        actionRef={action}
        dataSource={uploadedImages}
        editable={{}}
        metas={{
          title: {
            dataIndex: "fileName",
            title: "name",
          },
          description: {
            title: "desc"
          },
          content: {
            title: "content",
            render: (_, record) =>
              record.base64 ? (
                <div style={{ height: 70,display:"flex", alignItems: "center", justifyContent: "space-between" }}>
                  <span style={{ marginRight: 10 }}>{record.time}</span>
                  <Image src={record.base64} alt="uploaded"  style={{ width: 70, height: 70 }} />
                  <span style={{ color: record.state === "成功" ? "green" : "red" }}>
                  {record.state}
                </span>
                </div>
              ) : null,
          },
        }}
        toolbar={{
          menu: {
            activeKey,
            items: [
              {
                key: "tab1",
                label: <span>{idParam && <div>{decodeURIComponent(window.atob(idParam))}</div>}</span>,
              },
            ],
            onChange(key) {
              setActiveKey(key);
            },
          },
          actions: [
            <Input
              key="input"
              placeholder="请输入上传用户名"
              onChange={(e) => setUploadUser(e.target.value)}
              value={uploadUser}
            />,
            <Button type="primary" key="primary" onClick={handleUpload}>
              上传图片
            </Button>,
            <Button
              key="button"
              type="primary"
              onClick={() => {
                setUploadedImages([]);
                localStorage.removeItem(idParam ? decodeURIComponent(window.atob(idParam)) : "");
              }}
            >
              清空历史
            </Button>,
          ],
        }}
      />
    </div>
  );
}
