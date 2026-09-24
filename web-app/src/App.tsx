import { useState } from "react"
import { Text, Box, Container } from "@chakra-ui/react"
import { Route, Routes } from "react-router"
import HomePage from "./pages/HomePage"
import RegisterPage from "./pages/RegisterPage"
import type { Transaction } from "./types"

function App() {
  const [transactions, setTransactions] = useState<Transaction[]>([])

  const addTransaction = (transaction: Transaction) => {
    setTransactions((prev) => [...prev, transaction])
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
        <Route path="/" element={<HomePage transactions={transactions} />} />
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
