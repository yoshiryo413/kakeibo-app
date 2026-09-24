import type {
  NewTransaction,
  Transaction,
  TransactionListResponse,
  TransactionType,
} from "../types"

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL

// 取引一覧を取得する
export async function fetchTransactions(
  type: TransactionType | "all" = "all",
): Promise<TransactionListResponse> {
  const res = await fetch(`${API_BASE_URL}/transactions?type=${type}`)
  if (!res.ok) {
    throw new Error(`取引の取得に失敗しました (${res.status})`)
  }
  return res.json()
}

// 取引を登録する（DB 未実装のため、レスポンスに id が含まれない場合がある）
export async function createTransaction(
  transaction: NewTransaction,
): Promise<NewTransaction & { id?: Transaction["id"] }> {
  const res = await fetch(`${API_BASE_URL}/transactions`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(transaction),
  })
  if (!res.ok) {
    throw new Error(`取引の登録に失敗しました (${res.status})`)
  }
  return res.json()
}
