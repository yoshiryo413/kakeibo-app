import 'dotenv/config'
import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import { cors } from 'hono/cors'

const app = new Hono()

// フロントエンド（Vite 開発サーバー）からのリクエストを許可
app.use('/*', cors({ origin: process.env.FRONTEND_URL ?? '' }))

app.get('/', (c) => {
  return c.text('Hello Hono!')
})

app.get('/transactions', async (c) => {

  const type = c.req.query('type');

  if (!type || !["income", "expense", "all"].includes(type)) { {
    return c.json({ message: "Invalid type" }, 400);
  }}

  const transactionList = [
    { id: 1,  item: "給料", amount: 100, date: "2026-01-01" },
    { id: 2,  item: "食費", amount: 50, date: "2026-01-02" },
    { id: 3, item: "副業", amount: 200, date: "2026-01-03" },
    { id: 4,  item: "日用品", amount: 100, date: "2026-01-04" },
    { id: 5,  item: "ボーナス", amount: 300, date: "2026-01-05" },
  ];

const result = {
  transactions: transactionList,
  totalCount: transactionList.length,
  totalAmount: transactionList.reduce((acc, transaction) => acc + transaction.amount, 0),
}

  return c.json(result, 200)
})

app.post('/transactions', async (c) => {

  const body = await c.req.json();
  const { item, amount, date } = body;
  if (!item || amount === undefined || !date) {
    return c.json({ message: "Invalid request body" }, 400);
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

  return c.json(body, 201)
});


serve({
  fetch: app.fetch,
  port: 3000
}, (info) => {
  console.log(`Server is running on http://localhost:${info.port}`)
})
