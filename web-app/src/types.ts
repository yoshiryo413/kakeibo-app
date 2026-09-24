export type TransactionType = "income" | "expense"

export type Transaction = {
  id: number | string
  type: TransactionType
  item: string
  amount: number
  date: string
}

export type NewTransaction = Omit<Transaction, "id">

export type TransactionListResponse = {
  transactions: Transaction[]
  totalCount: number
  totalAmount: number
}
