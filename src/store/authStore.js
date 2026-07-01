import { create } from 'zustand'

const storedUser = localStorage.getItem('nest_user')

const useAuthStore = create((set) => ({
  user: storedUser ? JSON.parse(storedUser) : null,
  isAuthenticated: !!localStorage.getItem('access_token'),

  setUser: (user) => {
    localStorage.setItem('nest_user', JSON.stringify(user))
    set({ user, isAuthenticated: true })
  },

  logout: () => {
    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')
    localStorage.removeItem('nest_user')
    set({ user: null, isAuthenticated: false })
  },
}))

export default useAuthStore