import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { formatCurrency } from "@/lib/utils"

interface AmountControlProps {
    amount: string
    setAmount: (val: string) => void
    total: number
    currency?: string
}

export function AmountControl({ amount, setAmount, total, currency }: AmountControlProps) {
    const addCash = (value: number) => {
        const current = parseFloat(amount) || 0
        setAmount((current + value).toFixed(2))
    }

    const setExact = () => {
        setAmount(total.toFixed(2))
    }

    return (
        <>
            <div className="space-y-2 mb-4">
                <Label className="text-sm font-semibold text-foreground/80">Amount Collected from Customer</Label>
                <div className="relative py-2">
                    <Input
                        type="number"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        className="h-12 text-center text-lg font-bold bg-muted/10"
                    />
                </div>
            </div>

            <div className="flex gap-2 mb-4 overflow-x-auto p-2 scrollbar-hide">
                <Button variant="outline" size="sm" onClick={setExact} className="whitespace-nowrap">
                    Exact Amount
                </Button>
                {[100, 200, 500, 1000, 2000].map(val => (
                    <Button key={val} variant="outline" size="sm" onClick={() => addCash(val)} className="whitespace-nowrap">
                        +{formatCurrency(val, currency)}
                    </Button>
                ))}
            </div>
        </>
    )
}
