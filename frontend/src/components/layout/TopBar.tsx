import { Input } from "@/components/ui/input"
import { useItemsStore } from "@/store/itemsStore"
import { ScanLine } from "lucide-react"
import { UserProfile } from "./UserProfile"
import { SettingsDailog } from "./Settings"
import { useEffect, useState } from "react"

export function TopBar() {
  const { searchTerm, setSearchTerm } = useItemsStore()
  const [isOnline, setIsOnline] = useState(navigator.onLine)

  useEffect(() => {
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    window.addEventListener("online", handleOnline)
    window.addEventListener("offline", handleOffline)

    return () => {
      window.removeEventListener("online", handleOnline)
      window.removeEventListener("offline", handleOffline)
    }
  }, [])

  return (
    <div className="flex items-center justify-between px-5 pt-2 pb-2 bg-card md:bg-background h-auto md:h-16 gap-3 md:gap-2 mt-2 md:mt-0 shadow-sm md:shadow-none border-b border-border md:border-b-2">
      <div className="flex items-center gap-2 shrink-0">
        <div className="bg-primary rounded-xl md:rounded-lg p-2.5 aspect-square flex items-center justify-center shadow-sm">
          <span className="font-bold text-primary-foreground text-sm tracking-tighter">TP</span>
        </div>
        <h2 className="text-primary hidden md:block md:font-bold text-sm tracking-tighter"> Tridz POS</h2>
      </div>

      <div className="flex-1 max-w-lg px-1">
        <div className="relative">
          <Input
            placeholder="Search items by name"
            className="w-full pr-10 h-[3.25rem] md:h-10 border-primary border-2 rounded-2xl md:rounded-xl text-base md:text-sm text-foreground bg-card placeholder:text-muted-foreground focus-visible:ring-0 focus-visible:border-primary pl-4"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <ScanLine className="absolute right-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" strokeWidth={2.5} />
        </div>
      </div>

      <div className="flex items-center gap-4 md:gap-5 shrink-0 pl-1">
        {/* Online Indicator */}
        <div className="flex items-center gap-1.5" title={isOnline ? "Online" : "Offline"}>
          <div className={`h-2.5 w-2.5 rounded-full ${isOnline ? "bg-green-500 shadow-[0_0_6px_rgba(34,197,94,0.6)]" : "bg-muted-foreground"}`} />
          <span className="text-xs text-muted-foreground font-medium hidden md:block">{isOnline ? "Online" : "Offline"}</span>
        </div>

        {/* Settings Icon - Restored */}
        <SettingsDailog />

        <UserProfile />
      </div>
    </div>
  )
}
