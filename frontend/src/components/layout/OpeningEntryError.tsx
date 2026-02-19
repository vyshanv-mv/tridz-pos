import { AlertCircle, ArrowRight, LayoutDashboard, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"

export function OpeningEntryError({ error }: { error: string }) {
    const handleRedirect = () => {
        // Usually Frappe POS Opening Entry is at /app/pos-opening-entry
        window.location.href = "/app/pos-opening-entry/new"
    }


    const isOutdated = error.includes("is outdated")

    return (
        <div className="h-screen w-full flex flex-col items-center justify-center bg-background p-6 text-center">

            <div className="max-w-md w-full bg-card rounded-2xl shadow-xl shadow-muted/50 p-8 border border-border animate-in fade-in zoom-in duration-300">
                <div className="h-16 w-16 bg-orange-500/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
                    <AlertCircle className="h-8 w-8 text-orange-500" />
                </div>

                <h1 className="text-2xl font-bold text-foreground mb-2">
                    {isOutdated ? "Opening Entry Outdated" : "Opening Entry Required"}
                </h1>

                <p className="text-muted-foreground mb-8 leading-relaxed">
                    {error || "We couldn't find an active POS Opening Entry for your session. You need to create one to start selling."}
                </p>

                <div className="space-y-3">
                    {isOutdated ? (
                        <Button
                            onClick={() => {
                                window.location.href = "/app/pos-closing-entry/new"
                            }}
                            className="w-full h-12 bg-orange-600 hover:bg-orange-700 text-white font-medium rounded-xl gap-2 transition-all shadow-md active:scale-95"
                        >
                            <RefreshCw className="h-4 w-4" />
                            Go to POS Closing Entry
                        </Button>
                    ) : (
                        <Button
                            onClick={handleRedirect}
                            className="w-full h-12 bg-primary hover:bg-primary/90 text-primary-foreground font-medium rounded-xl gap-2 transition-all"
                        >
                            Create Opening Entry
                            <ArrowRight className="h-4 w-4" />
                        </Button>
                    )}

                    <Button
                        variant="outline"
                        onClick={() => window.location.href = "/app"}
                        className="w-full h-12 border-border text-muted-foreground font-medium rounded-xl gap-2 hover:bg-accent hover:text-accent-foreground transition-all"
                    >
                        <LayoutDashboard className="h-4 w-4" />
                        Go to Dashboard
                    </Button>

                    <Button
                        variant="ghost"
                        onClick={() => {
                            window.location.reload()
                        }}
                        className="w-full h-12 text-muted-foreground font-medium rounded-xl gap-2 hover:bg-accent hover:text-accent-foreground transition-all"
                    >
                        <RefreshCw className="h-4 w-4" />
                        Clear Cache & Reload
                    </Button>
                </div>

                <p className="mt-8 text-xs text-muted-foreground">
                    If you believe this is an error, please contact your administrator.
                </p>
            </div>
        </div>
    )
}
