import { useEffect, useState } from "react"
import { Text, Box, Container } from "@chakra-ui/react"
import { Route, Routes } from "react-router"
import HomePage from "./pages/HomePage"
import RegisterPage from "./pages/RegisterPage"
import { createTransaction, fetchTransactions } from "./api/transactions"
import type { NewTransaction, Transaction } from "./types"

function App() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // 画面表示時に取引一覧を取得
  useEffect(() => {
    let ignore = false

    fetchTransactions("all")
      .then((data) => {
        if (!ignore) setTransactions(data.transactions)
      })
      .catch((e: unknown) => {
        if (!ignore) setError(e instanceof Error ? e.message : String(e))
      })
      .finally(() => {
        if (!ignore) setIsLoading(false)
      })

    return () => {
      ignore = true
    }
  }, [])

  const addTransaction = async (transaction: NewTransaction) => {
    const created = await createTransaction(transaction)
    // DB 未実装でレスポンスに id が無い場合は、仮の id を付与する
    setTransactions((prev) => [
      ...prev,
      { ...created, id: created.id ?? crypto.randomUUID() },
    ])
  }

  return (
    <>
    <Box
    as="header"
    bg="teal.500"
    color="white"
    p={4}
    textAlign="center"
    fontWeight="bold"
    boxShadow="md"
    >
      <Text>シンプル家計簿</Text>
    </Box>
    <Container as="main" maxW="4xl" py={6}>
      <Routes>
        <Route
          path="/"
          element={
            <HomePage
              transactions={transactions}
              isLoading={isLoading}
              error={error}
            />
          }
        />
        <Route
          path="/register"
          element={<RegisterPage onRegister={addTransaction} />}
        />
      </Routes>
    </Container>
    </>
  )
}

export default App
