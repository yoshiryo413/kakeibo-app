import { Box, Button, Flex, Heading, Spinner, Stack, Text } from "@chakra-ui/react"
import { LuPlus } from "react-icons/lu"
import { useNavigate } from "react-router"
import type { Transaction } from "../types"

type Props = {
  transactions: Transaction[]
  isLoading: boolean
  error: string | null
}

function HomePage({ transactions, isLoading, error }: Props) {
  const navigate = useNavigate()

  const incomes = transactions.filter((t) => t.type === "income")
  const expenses = transactions.filter((t) => t.type === "expense")

  return (
    <Stack gap={8}>
      <Flex justify="flex-end">
        <Button
          colorPalette="teal"
          fontWeight="bold"
          onClick={() => navigate("/register")}
        >
          <LuPlus />
          登録
        </Button>
      </Flex>

      {isLoading ? (
        <Flex justify="center">
          <Spinner color="teal.500" />
        </Flex>
      ) : error ? (
        <Text color="red.500">{error}</Text>
      ) : (
        <>
          <TransactionSection title="収入履歴" transactions={incomes} />
          <TransactionSection title="支出履歴" transactions={expenses} />
        </>
      )}
    </Stack>
  )
}

type SectionProps = {
  title: string
  transactions: Transaction[]
}

function TransactionSection({ title, transactions }: SectionProps) {
  return (
    <Stack as="section" gap={3}>
      <Heading size="md">{title}</Heading>
      {transactions.length === 0 ? (
        <Text color="fg.muted">まだ登録がありません</Text>
      ) : (
        <Stack as="ul" gap={2}>
          {transactions.map((transaction) => {
            const isIncome = transaction.type === "income"
            return (
              <Box
                as="li"
                key={transaction.id}
                listStyleType="none"
                p={3}
                borderWidth="1px"
                borderRadius="md"
                color={isIncome ? "green.400" : "red.400"}
              >
                <Flex justify="space-between" gap={4}>
                  <Text>{transaction.date}</Text>
                  <Text flex="1">{transaction.item}</Text>
                  <Text fontWeight="bold">
                    {isIncome ? "" : "-"}
                    {transaction.amount.toLocaleString()}円
                  </Text>
                </Flex>
              </Box>
            )
          })}
        </Stack>
      )}
    </Stack>
  )
}

export default HomePage
