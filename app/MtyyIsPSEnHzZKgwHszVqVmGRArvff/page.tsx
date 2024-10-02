/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"; // This is a client component 👈🏽
import { EllipsisOutlined, PlusOutlined } from "@ant-design/icons";
import type { ActionType, ProColumns } from "@ant-design/pro-components";
import { ProTable } from "@ant-design/pro-components";
import { Button, Dropdown, Input, message, notification, Progress } from "antd";
import { useRef, useState } from "react";
import request from "umi-request";
import JSZip from "jszip"; // 引入 JSZip
import { saveAs } from "file-saver"; // 引入 FileSaver.js

function formatSize(bytes: number): string {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}

const columns: ProColumns<any>[] = [
  {
    dataIndex: "index",
    valueType: "indexBorder",
    width: 48,
  },
  {
    title: "文件夹名",
    dataIndex: "name",
    copyable: true,
    ellipsis: true,
    tooltip: "收集图片文件夹",
    formItemProps: {
      rules: [
        {
          required: true,
          message: "此项为必填项",
        },
      ],
    },
  },
  {
    disable: true,
    title: "收集数量",
    dataIndex: "childCount",
    filters: true,
    onFilter: true,
    ellipsis: true,
    search: false,
  },
  {
    disable: true,
    title: "占用空间",
    dataIndex: "size",
    search: false,
    render: (_, record) => formatSize(record.size), // 使用 formatSize 函数
  },
  {
    title: "创建时间",
    key: "showTime",
    dataIndex: "createdDateTime",
    valueType: "date",
    sorter: true,
    hideInSearch: true,
  },
  {
    title: "创建时间",
    dataIndex: "createdDateTime",
    valueType: "dateRange",
    hideInTable: true,
    search: {
      transform: (value) => {
        return {
          startTime: value[0],
          endTime: value[1],
        };
      },
    },
  },
  {
    title: "操作",
    valueType: "option",
    key: "option",
    render: (text, record, _, action) => [
      <a
        key="editable"
        onClick={() => {
          //获取路由 base 地址
          const baseUrl = window.location.origin;
          // 将文件名称转换成 base64
          const base64FileName = window.btoa(record.name);
          //复制到剪切板
          navigator.clipboard.writeText(
            `${baseUrl}/upload?id=${base64FileName}`
          );
          // 复制链接成功
          message.success("复制链接成功");
        }}
      >
        链接
      </a>,
      <a
        target="_blank"
        rel="noopener noreferrer"
        key="download"
        onClick={() => {
          //获取所有链接 下载到一个文件夹
          request("/api/getdownloadurl", {
            method: "POST",
            body: JSON.stringify({
              folderName: record.name,
            }),
          }).then(async (res) => {
            const zip = new JSZip(); // 初始化JSZip
            const key = `download_${Date.now()}`; // 生成唯一key
            const totalFiles = res.length;
            let completedFiles = 0;

            // 打开一个通知框，并初始化进度条
            notification.open({
              key,
              message: "文件下载中...",
              description: <Progress percent={0} />,
              duration: null, // 避免自动关闭
            });

            // 遍历文件链接并逐个下载文件
            await Promise.all(
              res.map(async (file:any) => {
                const { name, downloadUrl } = file;

                try {
                  // 发起请求获取文件的 Blob 数据
                  const response = await fetch(downloadUrl);
                  console.log(response);
                  // const blob = await response.blob();

                  // 将文件加入 zip 文件中
                  zip.file(name, response.blob());

                  // 更新完成的文件数量
                  completedFiles += 1;

                  // 更新进度条百分比
                  const percent = Math.round(
                    (completedFiles / totalFiles) * 100
                  );
                  notification.open({
                    key,
                    message: "文件下载中...",
                    description: <Progress percent={percent} />,
                  });
                } catch (error) {
                  console.error(`下载文件 ${name} 失败`, error);
                }
              })
            );

            // 当所有文件下载完成后，生成压缩文件并触发下载
            zip.generateAsync({ type: "blob" }).then((blob) => {
              saveAs(blob, "files.zip"); // 通过 FileSaver.js 下载压缩包
              notification.open({
                key,
                message: "下载完成！",
                description: <Progress percent={100} />,
              });
            });
          });
        }}
      >
        下载
      </a>,
      <a
        target="_blank"
        rel="noopener noreferrer"
        key="delete"
        onClick={() => {
          request("/api/deletefolder", {
            method: "POST",
            body: JSON.stringify({
              name: record.name.trim(),
            }),
            headers: {
              "Content-Type": "application/json",
            },
          }).then(() => {
            message.success("删除文件夹成功");
            action?.reload();
          });
        }}
      >
        删除
      </a>,
    ],
  },
];

export default function AdminPage() {
  const actionRef = useRef<ActionType>();
  const [inputValue, setInputValue] = useState("");

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };
  return (
    <div style={{ width: "90%", margin: "5vh auto" }}>
      <ProTable
        columns={columns}
        params={{}}
        actionRef={actionRef}
        cardBordered
        request={async (params: any, sort, filter) => {
          console.log(params, sort, filter);
          let data = await request("/api/getfolder");
          if (params.startTime && params.endTime) {
            data = data.filter((item: any) => {
              const date = item.createdDateTime.split("T")[0];
              return date >= params.startTime && date <= params.endTime;
            });
          }
          if (params.name) {
            data = data.filter((item: any) => {
              return item.name.indexOf(params.name) !== -1;
            });
          }
          //进行分页操作
          return {
            data: data.slice(
              params.current! * params.pageSize! - params.pageSize!,
              params.current! * params.pageSize!
            ),
          };
        }}
        editable={{
          type: "multiple",
        }}
        columnsState={{
          persistenceKey: "pro-table-singe-demos",
          persistenceType: "localStorage",
          defaultValue: {
            option: { fixed: "right", disable: true },
          },
          onChange(value) {
            console.log("value: ", value);
          },
        }}
        rowKey="id"
        search={{
          labelWidth: "auto",
        }}
        options={{
          setting: {
            listsHeight: 400,
          },
        }}
        form={{
          // 由于配置了 transform，提交的参数与定义的不同这里需要转化一下
          syncToUrl: (values, type) => {
            if (type === "get") {
              return {
                ...values,
                created_at: [values.startTime, values.endTime],
              };
            }
            return values;
          },
        }}
        dateFormatter="string"
        headerTitle="OneDrive"
        toolBarRender={() => [
          // 输入框 根据输入框的内容新建文件夹
          <Input
            key={"input"}
            value={inputValue}
            onChange={handleInputChange}
            placeholder="请输入新建文件夹名称"
          />,
          <Button
            key="button"
            icon={<PlusOutlined />}
            onClick={() => {
              if (!inputValue.trim()) {
                message.error("请输入新建文件夹名称");
                return;
              }
              request("/api/createfolder", {
                method: "POST",
                body: JSON.stringify({
                  name: inputValue.trim(),
                }),
                headers: {
                  "Content-Type": "application/json",
                },
              }).then(() => {
                message.success("新建文件夹成功");
                actionRef.current?.reload();
              });
            }}
            type="primary"
          >
            新建
          </Button>,
          <Dropdown
            key="menu"
            menu={{
              items: [
                {
                  label: "开发中",
                  key: "1",
                },
              ],
            }}
          >
            <Button>
              <EllipsisOutlined />
            </Button>
          </Dropdown>,
        ]}
      />
    </div>
  );
}
