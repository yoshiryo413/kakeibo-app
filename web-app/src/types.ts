export type TransactionType = "income" | "expense"

export type Transaction = {
  id: string
  type: TransactionType
  item: string
  amount: number
  date: string
}
