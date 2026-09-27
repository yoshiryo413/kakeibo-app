// .env の内容を process.env に読み込む（他の import より先に実行する）
import 'dotenv/config'
// Node.js 上で Hono アプリを HTTP サーバーとして動かすためのアダプター
import { serve } from '@hono/node-server'
// Web フレームワーク本体
import { Hono } from 'hono'
// CORS（別オリジンからのアクセス許可）ミドルウェア
import { cors } from 'hono/cors'
// PostgreSQL クライアントライブラリ
import pg from 'pg'

// ============================================================
// DB 初期化
// ============================================================

// PostgreSQL 接続プールを作成
// ※ この時点ではまだ接続しない。最初のクエリ実行時に接続が作られる
// ※ ユーザー・パスワードは未指定なら PGUSER / PGPASSWORD や OS ユーザーが使われる
const pool = new pg.Pool({
  host: process.env.DB_HOST ?? 'localhost',            // 接続先ホスト
  port: Number(process.env.DB_PORT ?? 5432),           // 接続先ポート
  database: process.env.DB_NAME ?? 'kakeibo_db',       // 接続する DB 名
  user: process.env.DB_USER,                           // ログインユーザー
  password: process.env.DB_PASSWORD,                   // ログインパスワード
})

// プール内の待機中の接続でエラーが起きたときのログ出力
// （これが無いと未処理エラーでプロセスが落ちる）
pool.on('error', (err) => {
  console.error('Unexpected PostgreSQL error', err)
})

// ============================================================
// アプリ・ミドルウェア設定
// ============================================================

// Hono アプリのインスタンスを作成
const app = new Hono()

// フロントエンド（Vite 開発サーバー）からのリクエストを許可
app.use('/*', cors({ origin: process.env.FRONTEND_URL ?? '' }))

// ============================================================
// ルーティング
// ============================================================

// 取引一覧の取得
// GET /transactions?type=income|expense|all
app.get('/transactions', async (c) => {

  // クエリパラメータ type を取得
  const type = c.req.query('type');

  // type が未指定、または許可された値以外なら 400 を返す
  if (!type || !["income", "expense", "all"].includes(type)) {
    return c.json({ message: "Invalid type" }, 400);
  }

  // DB では収入を正の金額、支出を負の金額として保存している
  // type に応じて金額の符号で絞り込む
  const where =
    type === "income" ? "WHERE amount > 0" :
    type === "expense" ? "WHERE amount < 0" :
    "";

  // date は Date 型で返るとタイムゾーンでずれるため、文字列にして取得する
  const { rows } = await pool.query<{ id: number; item: string; amount: number; date: string }>(
    `SELECT id::int AS id, item, amount, to_char(date, 'YYYY-MM-DD') AS date
     FROM transactions
     ${where}
     ORDER BY date DESC, id DESC`
  );

  // フロント向けに type を付与し、金額は絶対値で返す
  const transactionList = rows.map((row) => ({
    id: row.id,
    type: row.amount >= 0 ? "income" : "expense",
    item: row.item,
    amount: Math.abs(row.amount),
    date: row.date,
  }));

  // レスポンス用に件数と合計金額（収入 - 支出）を集計
  const result = {
    transactions: transactionList,
    totalCount: rows.length,
    totalAmount: rows.reduce((acc, row) => acc + row.amount, 0),
  }

  return c.json(result, 200)
})

// 取引の登録
// POST /transactions  body: { type, item, amount, date }
app.post('/transactions', async (c) => {

  // リクエストボディ（JSON）を取得
  const body = await c.req.json();
  const { type, item, amount, date } = body;

  // 必須項目が欠けていたら 400 を返す
  if (!item || amount === undefined || !date) {
    return c.json({ message: "Invalid request body" }, 400);
  }

  // 種別: income / expense のみ許可
  if (type !== "income" && type !== "expense") {
    return c.json({ message: "type must be income or expense" }, 400);
  }

  // 金額: 1以上の整数のみ許可
  if (typeof amount !== "number" || !Number.isInteger(amount) || amount <= 0) {
    return c.json({ message: "amount must be a positive integer" }, 400);
  }

  // 日付: YYYY-MM-DD 形式かつ実在する日付のみ許可
  if (typeof date !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return c.json({ message: "date must be in YYYY-MM-DD format" }, 400);
  }
  const parsedDate = new Date(date);
  if (Number.isNaN(parsedDate.getTime()) || parsedDate.toISOString().slice(0, 10) !== date) {
    return c.json({ message: "date is not a valid date" }, 400);
  }

  // 支出は負の金額として保存する
  const signedAmount = type === "expense" ? -amount : amount;

  // プレースホルダ（$1 など）で値を渡し、SQL インジェクションを防ぐ
  const { rows } = await pool.query<{ id: number }>(
    `INSERT INTO transactions (item, amount, date)
     VALUES ($1, $2, $3)
     RETURNING id::int AS id`,
    [item, signedAmount, date]
  );

  // 登録結果を採番された id 付きで返す
  return c.json({ id: rows[0].id, type, item, amount, date }, 201)
});

// ============================================================
// 起動処理
// ============================================================

// DB 接続確認
// pool.query を実行するとプールが接続を作成する（Client でいう connect() に相当）
// 接続できなければエラーを出してプロセスを終了する
try {
  await pool.query('SELECT 1')
  console.log('Connected to PostgreSQL')
} catch (err) {
  console.error('Failed to connect to PostgreSQL', err)
  process.exit(1)
}

// HTTP サーバーをポート 3000 で起動
serve({
  fetch: app.fetch,
  port: 3000
}, (info) => {
  console.log(`Server is running on http://localhost:${info.port}`)
})
