import { useState, useEffect } from "react"
import { call } from "@/api/frappe"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, ArrowUpRight, Package, TrendingUp } from "lucide-react"
import { formatCurrency } from "@/lib/utils"
import { usePosStore } from "@/store/posStore"

interface SalesData {
    amount: number
    transactions: number
}

interface ItemData {
    item_code: string
    item_name: string
    qty: number
    amount: number
    percentage: number
}

interface PaymentData {
    mode: string
    amount: number
    percentage: number
    count: number
}

interface DashboardState {
    today: SalesData
    week: SalesData
    month: SalesData
    topItems: ItemData[]
    paymentMethods: PaymentData[]
    totalItemsSold: number
}

export function SalesReportsDashboard() {
    const { profile } = usePosStore()
    const [loading, setLoading] = useState(true)
    const [data, setData] = useState<DashboardState>({
        today: { amount: 0, transactions: 0 },
        week: { amount: 0, transactions: 0 },
        month: { amount: 0, transactions: 0 },
        topItems: [],
        paymentMethods: [],
        totalItemsSold: 0
    })

    const getDateFilters = (range: "today" | "week" | "month") => {
        const today = new Date()
        const fromDate = new Date()

        switch (range) {
            case "week":
                // Get start of week (Sunday)
                const day = today.getDay()
                const diff = today.getDate() - day
                fromDate.setDate(diff)
                break
            case "month":
                fromDate.setDate(1)
                break
            case "today":
            default:
                // No change needed for fromDate (it's already today)
                break
        }

        const formatDate = (date: Date) => {
            const year = date.getFullYear()
            const month = String(date.getMonth() + 1).padStart(2, '0')
            const day = String(date.getDate()).padStart(2, '0')
            return `${year}-${month}-${day}`
        }

        return {
            from_date: formatDate(fromDate),
            to_date: formatDate(today)
        }
    }

    useEffect(() => {
        if (profile?.company) {
            fetchAllData()
        }
    }, [profile])

    const fetchAllData = async () => {
        if (!profile?.company) return
        setLoading(true)

        const baseFilters = {
            company: profile.company,
            docstatus: 1,
            is_pos: 1
        }

        try {
            // 1. Fetch Sales Data for Today, Week, Month
            const [todayData, weekData, monthData, itemData, paymentData] = await Promise.all([
                call.get("frappe.desk.query_report.run", {
                    report_name: "POS Register",
                    filters: { ...baseFilters, ...getDateFilters("today") }
                }),
                call.get("frappe.desk.query_report.run", {
                    report_name: "POS Register",
                    filters: { ...baseFilters, ...getDateFilters("week") }
                }),
                // Month data is used for detailed views too
                call.get("frappe.desk.query_report.run", {
                    report_name: "POS Register",
                    filters: { ...baseFilters, ...getDateFilters("month") }
                }),
                call.get("frappe.desk.query_report.run", {
                    report_name: "Item-wise Sales Register",
                    filters: { ...baseFilters, ...getDateFilters("month") }
                }),
                call.get("frappe.desk.query_report.run", {
                    report_name: "Sales Payment Summary",
                    filters: { ...baseFilters, ...getDateFilters("month") }
                })
            ])


            console.log(todayData, weekData, monthData, itemData, paymentData);

            // Helper to process POS Register results
            const processPosRegister = (response: any): SalesData => {
                const results = response?.message?.result || []
                if (!Array.isArray(results)) return { amount: 0, transactions: 0 }

                const amount = results.reduce((sum: number, row: any) => sum + (row.grand_total || 0), 0)
                const transactions = results.length
                return { amount, transactions }
            }

            // Process Items (Month scope)
            const itemResults = itemData?.message?.result || []
            const sortedItems = [...itemResults]
                .sort((a: any, b: any) => (b.amount || 0) - (a.amount || 0))
                .slice(0, 5)

            const totalItemSalesAmount = itemResults.reduce((sum: number, item: any) => sum + (item.amount || 0), 0)
            const totalItemsQty = itemResults.reduce((sum: number, item: any) => sum + (item.qty || 0), 0)

            const topItems = sortedItems.map((item: any) => ({
                item_code: item.item_code,
                item_name: item.item_name,
                qty: item.qty || 0,
                amount: item.amount || 0,
                percentage: totalItemSalesAmount > 0 ? ((item.amount || 0) / totalItemSalesAmount) * 100 : 0
            }))

            // Process Payments (Month scope)
            const paymentResults = paymentData?.message?.result || []
            const paymentMap = new Map<string, { amount: number, count: number }>()
            let totalPayments = 0

            paymentResults.forEach((row: any) => {
                const mode = row.mode_of_payment || row.payment_mode || "Unknown"
                const amount = row.paid_amount || row.amount || row.payments || 0
                if (mode && amount > 0) {
                    const existing = paymentMap.get(mode) || { amount: 0, count: 0 }
                    paymentMap.set(mode, {
                        amount: existing.amount + amount,
                        count: existing.count + 1
                    })
                    totalPayments += amount
                }
            })

            const paymentMethods = Array.from(paymentMap.entries()).map(([mode, data]) => ({
                mode,
                amount: data.amount,
                count: data.count,
                percentage: totalPayments > 0 ? (data.amount / totalPayments) * 100 : 0
            })).sort((a, b) => b.amount - a.amount)

            setData({
                today: processPosRegister(todayData),
                week: processPosRegister(weekData),
                month: processPosRegister(monthData),
                topItems,
                paymentMethods,
                totalItemsSold: totalItemsQty
            })

        } catch (error) {
            console.error("Error fetching sales reports:", error)
        } finally {
            setLoading(false)
        }
    }

    if (!profile?.company) return null

    return (
        <div className="space-y-6 pt-2 pb-6 px-1">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-slate-900">Sales Reports</h2>
                    <p className="text-slate-500 mt-1">
                        Overview of your sales performance
                    </p>
                </div>
                {/* Optional Action Button */}
                {/* <Button variant="outline">Export Data</Button> */}
            </div>

            {loading ? (
                <div className="h-[500px] flex flex-col items-center justify-center gap-4">
                    <Loader2 className="h-10 w-10 animate-spin text-primary" />
                    <p className="text-muted-foreground animate-pulse">Gathering sales data...</p>
                </div>
            ) : (
                <div className="space-y-6">
                    {/* Top Summary Cards */}
                    <div className="grid gap-6 md:grid-cols-3">
                        <Card className="border shadow-sm">
                            <CardContent className="p-6">
                                <p className="text-sm font-medium text-muted-foreground mb-2">Today's Sales</p>
                                <div className="text-3xl font-bold text-slate-900">{formatCurrency(data.today.amount)}</div>
                                <div className="flex items-center mt-2 text-xs font-medium text-emerald-600">
                                    <ArrowUpRight className="h-3 w-3 mr-1" />
                                    <span>{data.today.transactions} Transactions</span>
                                </div>
                            </CardContent>
                        </Card>
                        <Card className="border shadow-sm">
                            <CardContent className="p-6">
                                <p className="text-sm font-medium text-muted-foreground mb-2">This Week</p>
                                <div className="text-3xl font-bold text-slate-900">{formatCurrency(data.week.amount)}</div>
                                <div className="flex items-center mt-2 text-xs font-medium text-emerald-600">
                                    <ArrowUpRight className="h-3 w-3 mr-1" />
                                    <span>{data.week.transactions} Transactions</span>
                                </div>
                            </CardContent>
                        </Card>
                        <Card className="border shadow-sm">
                            <CardContent className="p-6">
                                <p className="text-sm font-medium text-muted-foreground mb-2">This Month</p>
                                <div className="text-3xl font-bold text-slate-900">{formatCurrency(data.month.amount)}</div>
                                <div className="flex items-center mt-2 text-xs font-medium text-emerald-600">
                                    <ArrowUpRight className="h-3 w-3 mr-1" />
                                    <span>{data.month.transactions} Transactions</span>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Top Items List */}
                    <Card className="border shadow-sm">
                        <CardHeader className="pb-4">
                            <CardTitle className="text-lg font-semibold flex items-center gap-2">
                                <TrendingUp className="h-5 w-5 text-slate-500" />
                                Top 5 Items by Sales
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-6">
                                {data.topItems.map((item, index) => (
                                    <div key={item.item_code} className="space-y-2">
                                        <div className="flex items-start justify-between">
                                            <div className="flex items-start gap-4">
                                                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-slate-100 text-slate-600 font-bold text-sm shrink-0">
                                                    {index + 1}
                                                </div>
                                                <div>
                                                    <p className="font-semibold text-slate-900">{item.item_name}</p>
                                                    <p className="text-sm text-slate-500">{formatCurrency(item.amount)} in sales</p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <Package className="h-5 w-5 text-slate-300" />
                                            </div>
                                        </div>
                                        {/* Progress Bar */}
                                        <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden ml-12" style={{ width: 'calc(100% - 3rem)' }}>
                                            <div
                                                className="h-full rounded-full bg-emerald-600 opacity-90"
                                                style={{ width: `${item.percentage}%` }}
                                            />
                                        </div>
                                    </div>
                                ))}
                                {data.topItems.length === 0 && (
                                    <div className="text-center py-8 text-muted-foreground bg-slate-50 rounded-lg border border-dashed">
                                        No items sold yet this month
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Bottom Split Section */}
                    <div className="grid gap-6 md:grid-cols-2">
                        {/* Quick Stats */}
                        <Card className="border shadow-sm">
                            <CardHeader>
                                <CardTitle className="text-base font-semibold">Quick Stats</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0">
                                    <span className="text-slate-500">Average Transaction</span>
                                    <span className="font-semibold text-slate-900">
                                        {data.month.transactions > 0
                                            ? formatCurrency(data.month.amount / data.month.transactions)
                                            : formatCurrency(0)}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0">
                                    <span className="text-slate-500">Total Transactions</span>
                                    <span className="font-semibold text-slate-900">{data.month.transactions}</span>
                                </div>
                                <div className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0">
                                    <span className="text-slate-500">Items Sold</span>
                                    <span className="font-semibold text-slate-900">{data.totalItemsSold}</span>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Payment Methods */}
                        <Card className="border shadow-sm">
                            <CardHeader>
                                <CardTitle className="text-base font-semibold">Payment Methods</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {data.paymentMethods.map((method) => (
                                    <div key={method.mode} className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0">
                                        <div className="flex items-center gap-2">
                                            {/* Optional Icon for payment mode? */}
                                            <span className="text-slate-500">{method.mode}</span>
                                        </div>
                                        <div className="text-right">
                                            <span className="font-semibold text-slate-900 block">{formatCurrency(method.amount)}</span>
                                            <span className="text-xs text-slate-400">({method.percentage.toFixed(0)}%)</span>
                                        </div>
                                    </div>
                                ))}
                                {data.paymentMethods.length === 0 && (
                                    <div className="text-center py-4 text-sm text-muted-foreground">
                                        No payments recorded
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </div>
            )}
        </div>
    )
}
