import { BrowserRouter, Routes, Route } from "react-router-dom"
import Pos from "@/pages/Pos"
import Login from "@/pages/Login"
import { Toaster } from "@/components/ui/toaster"
import { useUserStore } from "@/store/userStore"
import { useEffect } from "react"

export default function App() {
  const { currentUser, loading, initSession } = useUserStore()

  useEffect(() => {
    initSession()
  }, [initSession])

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    )
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          path="*"
          element={currentUser ? <Pos /> : <Login />}
        />
      </Routes>
      <Toaster />
    </BrowserRouter>
  )
}
