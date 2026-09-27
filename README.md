# シンプル家計簿

フルスタック開発の勉強用に作っている家計簿アプリです。
フロントエンド・バックエンド・DB をつなぎ、収入と支出の一覧表示と登録ができます。

## 構成

| ディレクトリ | 内容 | 主な技術 |
|---|---|---|
| `web-app/` | フロントエンド | React, TypeScript, Vite, Chakra UI, React Router |
| `backend/` | API サーバー | Hono, Node.js, TypeScript |
| - | DB | PostgreSQL（`pg` で接続） |

## API

| メソッド | パス | 内容 |
|---|---|---|
| GET | `/transactions?type=income\|expense\|all` | 取引一覧の取得 |
| POST | `/transactions` | 取引の登録（`{ type, item, amount, date }`） |

DB では収入を正の金額、支出を負の金額として保存しています。

## ローカルでの起動

### 1. DB

ローカルの PostgreSQL（ポート 5432）に `kakeibo_db` を作成し、テーブルを用意します。

```sql
CREATE TABLE transactions (
  id     SERIAL PRIMARY KEY,
  item   TEXT    NOT NULL,
  amount INTEGER NOT NULL,  -- 収入は正、支出は負
  date   DATE    NOT NULL
);
```

### 2. バックエンド

`backend/.env` を作成します。

```
FRONTEND_URL=http://localhost:5173
DB_USER=<ユーザー名>
DB_PASSWORD=<パスワード>
```

```sh
cd backend
npm install
npm run dev   # http://localhost:3000
```

### 3. フロントエンド

`web-app/.env` を作成します。

```
VITE_API_BASE_URL=http://localhost:3000
```

```sh
cd web-app
npm install
npm run dev   # http://localhost:5173
```
