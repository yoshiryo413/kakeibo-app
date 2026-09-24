import { useState } from "react"
import {
  Button,
  Field,
  Flex,
  HStack,
  Heading,
  Input,
  RadioGroup,
  Stack,
  Text,
} from "@chakra-ui/react"
import { useNavigate } from "react-router"
import type { NewTransaction, TransactionType } from "../types"

const types = [
  { value: "expense", label: "支出" },
  { value: "income", label: "収入" },
]

type Props = {
  onRegister: (transaction: NewTransaction) => Promise<void>
}

function RegisterPage({ onRegister }: Props) {
  const navigate = useNavigate()
  const [type, setType] = useState<TransactionType>("expense")
  const [item, setItem] = useState("")
  const [amount, setAmount] = useState("")
  const [date, setDate] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const canRegister = item !== "" && Number(amount) > 0 && date !== ""

  const handleRegister = async () => {
    setIsSubmitting(true)
    setError(null)
    try {
      await onRegister({
        type,
        item,
        amount: Number(amount),
        date,
      })
      navigate("/")
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Stack gap={6}>
      <Heading size="lg">収支の登録</Heading>

      <RadioGroup.Root
        value={type}
        onValueChange={(e) => setType(e.value as TransactionType)}
        colorPalette="teal"
      >
        <HStack gap={6}>
          {types.map((option) => (
            <RadioGroup.Item key={option.value} value={option.value}>
              <RadioGroup.ItemHiddenInput />
              <RadioGroup.ItemIndicator />
              <RadioGroup.ItemText>{option.label}</RadioGroup.ItemText>
            </RadioGroup.Item>
          ))}
        </HStack>
      </RadioGroup.Root>

      <Field.Root>
        <Field.Label>項目</Field.Label>
        <Input
          placeholder="例：食費"
          value={item}
          onChange={(e) => setItem(e.target.value)}
        />
      </Field.Root>

      <Field.Root>
        <Field.Label>金額</Field.Label>
        <Input
          type="number"
          placeholder="例：1000"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />
      </Field.Root>

      <Field.Root>
        <Field.Label>日付</Field.Label>
        <Input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />
      </Field.Root>

      {error && <Text color="red.500">{error}</Text>}

      <Flex justify="flex-end" gap={3}>
        <Button variant="outline" onClick={() => navigate("/")}>
          キャンセル
        </Button>
        <Button
          colorPalette="teal"
          fontWeight="bold"
          disabled={!canRegister}
          loading={isSubmitting}
          onClick={handleRegister}
        >
          登録
        </Button>
      </Flex>
    </Stack>
  )
}

export default RegisterPage
