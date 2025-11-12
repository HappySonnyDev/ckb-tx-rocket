<div align="center">

# 🚀 CKB Tx Rocket

**一个基于 Phaser 3 的 CKB 区块链实时可视化项目**

[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue?logo=typescript)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19-61dafb?logo=react)](https://react.dev/)
[![NestJS](https://img.shields.io/badge/NestJS-10-e0234e?logo=nestjs)](https://nestjs.com/)
[![Phaser](https://img.shields.io/badge/Phaser-3-8a2be2?logo=phaser)](https://phaser.io/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

[English](README.md) | [简体中文](README_CN.md)

</div>

---

## 📖 项目简介

**CKB Tx Rocket** 是一个创新的 CKB (Nervos Network) 区块链可视化项目，采用游戏引擎 Phaser 3 将区块链数据以生动、直观的方式呈现。本项目采用 **monorepo** 架构，使用 **pnpm workspaces** 进行统一管理。

### ✨ 核心特性

- 🎮 **游戏化可视化** - 基于 Phaser 3 游戏引擎的交互式区块链数据展示
- ⚡ **实时数据同步** - WebSocket 实时推送区块和交易事件
- 🎨 **多主题支持** - 支持 Mainnet/Testnet 主题切换
- 🔍 **交易类型识别** - 智能识别和展示不同类型的 CKB 交易
- 📊 **数据快照** - 提供区块链状态快照 API
- 🌐 **全栈 TypeScript** - 前后端完全使用 TypeScript 开发
- 🔄 **事件驱动架构** - 解耦的事件系统支持灵活扩展

---

## 🏗️ 项目架构

```
ckb-tx-rocket/
├── apps/
│   ├── web/                          # 前端应用 (Phaser 3 + React + Vite)
│   │   ├── src/
│   │   │   ├── game/                 # Phaser 可视化引擎
│   │   │   │   ├── scenes/           # 游戏场景
│   │   │   │   └── managers/         # 数据管理器
│   │   │   ├── components/           # React UI 组件
│   │   │   ├── services/             # CKB 区块链服务
│   │   │   ├── hooks/                # React Hooks
│   │   │   ├── config/               # 配置文件
│   │   │   └── utils/                # 工具函数
│   │   ├── public/                   # 静态资源
│   │   └── vite/                     # Vite 配置
│   │
│   └── server/                       # 后端应用 (NestJS)
│       ├── src/
│       │   ├── api/                  # API 模块
│       │   │   ├── blocks/           # 区块 API
│       │   │   ├── transactions/     # 交易 API
│       │   │   ├── snapshot/         # 快照 API
│       │   │   └── websocket/        # WebSocket 网关
│       │   ├── core/                 # 核心服务
│       │   │   ├── database/         # 数据库服务
│       │   │   ├── ckb/              # CKB 客户端
│       │   │   └── sync/             # 同步服务
│       │   └── common/               # 共享工具
│       ├── prisma/                   # 数据库 Schema
│       ├── scripts/                  # 辅助脚本
│       └── docs/                     # API 文档
│
├── pnpm-workspace.yaml               # Workspace 配置
├── package.json                      # 根配置文件
└── tsconfig.json                     # TypeScript 配置
```

---

## 🛠️ 技术栈

### 前端应用 (Web)

| 技术 | 版本 | 用途 |
|------|------|------|
| **Phaser 3** | `^3.87.0` | 游戏引擎，用于区块链可视化 |
| **React** | `^19.0.0` | UI 框架 |
| **TypeScript** | `~5.7.3` | 类型安全 |
| **Vite** | `^6.0.3` | 构建工具和开发服务器 |
| **Socket.IO Client** | `^4.8.1` | WebSocket 通信 |
| **@nervosnetwork/ckb-sdk-utils** | - | CKB 工具库 |

### 后端应用 (Server)

| 技术 | 版本 | 用途 |
|------|------|------|
| **NestJS** | `^10.0.0` | 后端框架 |
| **Prisma** | `^6.0.1` | ORM 和数据库工具 |
| **Socket.IO** | `^4.8.1` | WebSocket 服务器 |
| **CKB Lumos** | `^0.25.0` | CKB 区块链 SDK |
| **SQLite** | - | 数据库 |
| **Joi** | `^17.13.3` | 配置验证 |

---

## 📦 环境要求

在开始之前，请确保您的开发环境满足以下要求：

- **Node.js** >= 18.0.0
- **pnpm** >= 10.11.0 (推荐使用 `corepack` 管理)
- **CKB 节点访问** (Testnet/Mainnet RPC 和 WebSocket 端点)

### 安装 pnpm

```bash
# 使用 corepack (推荐)
corepack enable
corepack prepare pnpm@10.11.0 --activate

# 或使用 npm
npm install -g pnpm@10.11.0
```

---

## 🚀 快速开始

### 1. 克隆项目

```bash
git clone https://github.com/your-username/ckb-tx-rocket.git
cd ckb-tx-rocket
```

### 2. 安装依赖

```bash
# 安装整个 monorepo 的所有依赖
pnpm install
```

### 3. 配置后端环境变量

在 `apps/server` 目录下创建 `.env` 文件：

```bash
cd apps/server
cp .env.example .env  
```

编辑 `.env` 文件，配置以下变量：

```env
# Prisma 数据库 URL (Prisma 命令必需)
# 运行时会被 PrismaService 根据 NETWORK 环境变量覆盖
DATABASE_URL="file:./ckb-testnet.db"

# Mainnet 主网配置
MAINNET_DATABASE_FILE="./ckb-mainnet.db"      # 主网数据库文件
MAINNET_WS_RPC_URL="wss://mainnet.ckb.dev/ws" # 主网 WebSocket 端点
MAINNET_HTTP_RPC_URL="https://mainnet.ckb.dev" # 主网 HTTP RPC 端点
API_MAINNET_PORT=3001                          # 主网 API 端口

# Testnet 测试网配置
TESTNET_DATABASE_FILE="./ckb-testnet.db"      # 测试网数据库文件
TESTNET_WS_RPC_URL="wss://testnet.ckb.dev/ws" # 测试网 WebSocket 端点
TESTNET_HTTP_RPC_URL="https://testnet.ckb.dev" # 测试网 HTTP RPC 端点
API_TESTNET_PORT=3000                          # 测试网 API 端口
```

**重要说明**：
- 项目支持**同时运行 Mainnet 和 Testnet** 两个网络的服务
- 每个网络使用独立的数据库文件和端口
- `DATABASE_URL` 仅用于 Prisma CLI 命令，实际运行时会根据网络自动选择对应的数据库

### 4. 初始化数据库

```bash
# 生成 Prisma Client
pnpm --filter @ckb-tx-rocket/server prisma generate

# 初始化 Testnet 数据库
pnpm --filter @ckb-tx-rocket/server db:init:testnet

# 初始化 Mainnet 数据库
pnpm --filter @ckb-tx-rocket/server db:init:mainnet
```

**说明**：
- 两个网络使用独立的数据库文件（`ckb-testnet.db` 和 `ckb-mainnet.db`）
- 初始化脚本会在 `apps/server/prisma/` 目录下创建对应的数据库文件
- 如果只需要运行单个网络，只初始化对应的数据库即可

### 5. 启动开发服务器

#### 启动前端

```bash
# 启动前端应用
pnpm dev:web
```

访问地址：`http://localhost:8080`

#### 启动后端服务

**Testnet 测试网

```bash
# 启动 Testnet 服务
pnpm --filter @ckb-tx-rocket/server start:testnet
```

访问地址：`http://localhost:3000`

**Mainnet 主网**：

```bash
# 启动 Mainnet 服务
pnpm --filter @ckb-tx-rocket/server start:mainnet
```

访问地址：`http://localhost:3001`

**同时启动两个网络**（可选）：

```bash
# 同时启动 Testnet 和 Mainnet
pnpm --filter @ckb-tx-rocket/server start:both
```

**说明**：
- 前端和后端需要分别在不同的终端窗口启动
- 两个网络可以同时运行，使用不同的端口和数据库


## 🔌 API 文档

### REST API

后端提供以下 REST API 端点：

#### 区块 API
- `GET /blocks` - 获取区块列表
- `GET /blocks/:id` - 获取单个区块详情

#### 交易 API
- `GET /transactions` - 获取交易列表
- `GET /transactions/:hash` - 获取单个交易详情

#### 快照 API
- `GET /snapshot` - 获取当前链状态快照

详细 API 文档请查看: `apps/server/docs/API_SPEC.md`

### WebSocket Events

前端通过 WebSocket 订阅实时事件：

```typescript
// 订阅区块事件
socket.on('block.new', (block) => { /* ... */ });

// 订阅交易事件
socket.on('transaction.new', (tx) => { /* ... */ });
socket.on('transaction.confirmed', (tx) => { /* ... */ });
```

---

## 🎮 功能特性

### 区块链可视化

- **实时区块流**: 新区块以动画形式出现
- **交易队列**: 等待确认的交易以队列形式展示
- **交易类型识别**: 自动识别 DAO、NervosDAO、普通转账等交易类型
- **交互式详情**: 点击查看区块和交易详细信息

### 主题系统

- **Mainnet 主题**: 蓝色调，体现稳定性
- **Testnet 主题**: 橙色调，便于区分测试环境
- **动态资源加载**: 根据主题动态加载对应资源

### 数据同步

- **自动同步**: 后台自动从指定区块高度开始同步
- **批量处理**: 支持批量同步提高效率
- **断点续传**: 重启后从上次位置继续同步

---

## 🗂️ 数据库 Schema

项目使用 **SQLite** 数据库，主要表结构：

- **Block**: 区块信息 (高度、哈希、时间戳等)
- **Transaction**: 交易信息 (哈希、状态、类型等)
- **Input**: 交易输入
- **Output**: 交易输出

**多网络支持**：
- Mainnet 和 Testnet 使用独立的数据库文件
- 数据库文件位置：`apps/server/prisma/ckb-mainnet.db` 和 `ckb-testnet.db`
- 运行时根据网络自动选择对应的数据库

Schema 定义位于: `apps/server/prisma/schema.prisma`

---

## 📝 开发指南

### 添加新的交易类型

1. 在 `apps/web/src/config/transaction.config.ts` 中定义新类型配置
2. 在后端 `apps/server/src/core/sync/transaction.service.ts` 中实现识别逻辑
3. 更新前端动画和展示逻辑

### 添加新的可视化元素

1. 在 `apps/web/src/game/scenes/` 中实现新场景
2. 使用 EventBus 与 React 组件通信
3. 在 `ChainDataManager` 中管理数据状态

---

## 🐛 故障排查

### 前端无法连接后端

检查以下配置：
1. 确认后端服务已启动（Testnet: 3000, Mainnet: 3001）
2. 确认前端连接的是正确的端口
3. 检查后端日志是否有错误信息

### 数据库迁移失败

删除数据库文件重新初始化：
```bash
cd apps/server
# 删除两个网络的数据库文件
rm prisma/ckb-testnet.db prisma/ckb-mainnet.db
# 重新同步 Schema
pnpm prisma db push
```

### WebSocket 连接失败

确认 CKB 节点 WebSocket 端点可访问：
```bash
wscat -c wss://testnet.ckb.dev/ws
```

---

## 🤝 贡献指南

欢迎贡献代码、报告问题或提出新功能建议！

1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request

---

## 📄 许可证

本项目采用 [MIT](LICENSE) 许可证。

---

## 👨‍💻 作者

**Sonny**

---

## 🙏 致谢

- [Nervos Network](https://nervos.org/) - CKB 区块链平台
- [Phaser](https://phaser.io/) - 强大的 HTML5 游戏引擎
- [NestJS](https://nestjs.com/) - 优雅的 Node.js 框架
- [Lumos](https://lumos-website.vercel.app/) - CKB 开发工具集

---

<div align="center">

**⭐ 如果这个项目对您有帮助，请给我们一个 Star！⭐**

</div>
