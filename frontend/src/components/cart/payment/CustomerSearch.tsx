import { useState, useEffect } from "react"
import { Search, User, ChevronDown, Check } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { getCustomers, createCustomer, getCustomerByMobile } from "@/api/customer"
import type { Customer } from "@/types/customer"
import { useToast } from "@/hooks/use-toast"

interface CustomerSearchProps {
    selectedCustomer: Customer | undefined
    onSelect: (customer: Customer | undefined) => void
}

export function CustomerSearch({ selectedCustomer, onSelect }: CustomerSearchProps) {
    const { toast } = useToast()
    const [customerMobile, setCustomerMobile] = useState("")
    const [customers, setCustomers] = useState<Customer[]>([])
    const [isDropdownOpen, setIsDropdownOpen] = useState(false)
    const [isAddingCustomer, setIsAddingCustomer] = useState(false)
    const [newCustomerName, setNewCustomerName] = useState("")
    const [isCreating, setIsCreating] = useState(false)

    // Sync mobile number when selectedCustomer changes
    useEffect(() => {
        if (selectedCustomer?.mobile_no) {
            setCustomerMobile(selectedCustomer.mobile_no)
        }
    }, [selectedCustomer])

    const handleAddCustomer = async () => {
        if (!newCustomerName || !customerMobile) return

        try {
            setIsCreating(true)

            // Check if customer already exists
            const existing = await getCustomerByMobile(customerMobile)
            if (existing) {
                toast({
                    title: "Customer Exists",
                    description: `Customer with mobile ${customerMobile} already exists: ${existing.customer_name}`,
                })
                onSelect(existing)
                setIsAddingCustomer(false)
                setNewCustomerName("")
                return
            }

            const newCustomer = await createCustomer({
                customer_name: newCustomerName,
                mobile_no: customerMobile
            })
            const customersList = await getCustomers()
            setCustomers(customersList)
            const created = customersList.find(c => c.name === newCustomer.name)
            if (created) {
                onSelect(created)
                // setCustomerMobile(created.mobile_no || "") // Do we update input? Yes.
            }
            setIsAddingCustomer(false)
            setNewCustomerName("")
        } catch (error) {
            console.error("Failed to create customer", error)
            toast({
                title: "Error",
                description: "Failed to create customer record",
                variant: "destructive",
            })
        } finally {
            setIsCreating(false)
        }
    }

    return (
        <div className="space-y-2 mb-6 relative">
            <Label className="text-sm font-semibold text-foreground/80">Customer Mobile Number</Label>
            <div className="relative top-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                    className="pl-9 bg-background h-11 border-primary/40 border-2 rounded-xl"
                    placeholder="Enter 10-digit mobile number"
                    value={customerMobile}
                    onFocus={() => {
                        setIsDropdownOpen(true)
                        if (customers.length === 0) {
                            getCustomers().then(setCustomers)
                        }
                    }}
                    onChange={(e) => {
                        const value = e.target.value
                        setCustomerMobile(value)
                        if (selectedCustomer && selectedCustomer.mobile_no !== value) {
                            onSelect(undefined)
                        }

                        getCustomers(value).then(setCustomers)

                        setIsDropdownOpen(true)
                    }}
                />
                {selectedCustomer && (
                    <div className="absolute left-[45%] top-1/2 -translate-y-1/2 flex items-center h-full pointer-events-none">
                        <div className="h-6 w-px bg-border mx-2" />
                        <span className="text-sm font-medium text-muted-foreground bg-background/90 px-1 whitespace-nowrap overflow-hidden text-ellipsis max-w-[180px]">
                            {selectedCustomer.customer_name}
                        </span>
                    </div>
                )}
                <ChevronDown className={cn(
                    "absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground transition-transform duration-200",
                    isDropdownOpen && "rotate-180"
                )} />
            </div>

            {/* Customer Dropdown */}
            {isDropdownOpen && (
                <div className="absolute z-50 w-full mt-1 bg-popover border border-border rounded-lg shadow-xl max-h-60 overflow-y-auto animate-in fade-in zoom-in-95 duration-200 top-full">
                    <div className="p-1">
                        <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                            SearchResults
                        </div>
                        {customers.map((c) => (
                            <button
                                key={c.name}
                                type="button"
                                onClick={() => {
                                    setCustomerMobile(c.mobile_no || "")
                                    onSelect(c)
                                    setIsDropdownOpen(false)
                                }}
                                className={cn(
                                    "w-full flex items-center justify-between px-3 py-2.5 text-sm rounded-md transition-colors",
                                    selectedCustomer?.name === c.name
                                        ? "bg-primary/10 text-primary"
                                        : "hover:bg-muted text-foreground"
                                )}
                            >
                                <div className="flex items-center gap-3">
                                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                                        <User className="h-4 w-4" />
                                    </div>
                                    <div className="flex flex-col items-start translate-y-[-1px]">
                                        <span className="font-medium">{c.customer_name}</span>
                                        {c.mobile_no && <span className="text-xs text-muted-foreground">{c.mobile_no}</span>}
                                    </div>
                                </div>
                                {selectedCustomer?.name === c.name && (
                                    <Check className="h-4 w-4 text-primary" />
                                )}
                            </button>
                        ))}
                        {/* Empty State */}
                        {customers.length === 0 && !isAddingCustomer && (
                            <div className="px-3 py-4 text-center text-sm text-muted-foreground">
                                No customers found matching "{customerMobile}"
                            </div>
                        )}

                        {/* Always show Add New Customer button if not currently adding */}
                        {!isAddingCustomer && (
                            <div className="p-1 border-t mt-1">
                                <button
                                    type="button"
                                    onClick={() => setIsAddingCustomer(true)}
                                    className="w-full flex items-center gap-3 px-3 py-2 text-sm rounded-md hover:bg-primary/5 text-primary font-medium transition-colors"
                                >
                                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                                        <User className="h-4 w-4" />
                                    </div>
                                    <span>Add New as New Customer</span>
                                </button>
                            </div>
                        )}

                        {/* Inline Add Customer Form */}
                        {isAddingCustomer && (
                            <div className="p-3 border-t bg-muted/20">
                                <p className="text-xs font-semibold mb-2 text-primary">New Customer Details</p>
                                <div className="space-y-3">
                                    <div className="space-y-1">
                                        <div className="flex justify-between items-center">
                                            <Label className="text-sm uppercase text-muted-foreground">Mobile Number</Label>
                                            {customerMobile && customerMobile.length < 6 && (
                                                <span className="text-sm text-red-500 font-medium">Invalid number</span>
                                            )}
                                            {customerMobile && customerMobile.length > 10 && (
                                                <span className="text-sm text-red-500 font-medium">Invalid number</span>
                                            )}
                                        </div>
                                        <Input
                                            value={customerMobile}
                                            onChange={(e) => {
                                                const val = e.target.value.replace(/\D/g, '')
                                                setCustomerMobile(val)
                                            }}
                                            className={cn(
                                                "h-9 text-sm",
                                                customerMobile && (customerMobile.length < 6 || customerMobile.length > 10) && "border-red-500 focus-visible:ring-red-500"
                                            )}
                                            placeholder="Enter mobile number..."
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <Label className="text-sm uppercase text-muted-foreground">Full Name</Label>
                                        <Input
                                            autoFocus
                                            placeholder="Enter customer name..."
                                            value={newCustomerName}
                                            onChange={(e) => setNewCustomerName(e.target.value)}
                                            className="h-9 text-sm"
                                        />
                                    </div>
                                    <div className="flex gap-2">
                                        <Button
                                            size="sm"
                                            className="flex-1 h-9"
                                            onClick={handleAddCustomer}
                                            disabled={isCreating || !newCustomerName || customerMobile.length < 6 || customerMobile.length > 10}
                                        >
                                            {isCreating ? "Creating..." : "Create & Select"}
                                        </Button>
                                        <Button
                                            size="sm"
                                            variant="ghost"
                                            className="h-9"
                                            onClick={() => setIsAddingCustomer(false)}
                                        >
                                            Cancel
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
            {/* Overlay to close dropdown */}
            {isDropdownOpen && (
                <div
                    className="fixed inset-0 z-40"
                    onClick={() => setIsDropdownOpen(false)}
                />
            )}
        </div>
    )
}
