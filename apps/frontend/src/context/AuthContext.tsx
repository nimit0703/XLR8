import React, { createContext, useContext, useState, useEffect } from 'react'
import api from '../lib/api'

interface User {
    id: string
    email: string
    username: string
    role: string
}

interface AuthContextType {
    user: User | null
    login: (token: string, userData: User) => void
    logout: () => void
    isLoading: boolean
}

const AuthContext = createContext<AuthContextType | null>(null)

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<User | null>(null)
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        // Check if we have a token on load and fetch user info
        const token = localStorage.getItem('accessToken')
        if (token) {
            // Optional: Call /me endpoint to get fresh user data
            // For now, we assume if token exists, we stay logged in until 403
            const savedUser = localStorage.getItem('user')
            if (savedUser) setUser(JSON.parse(savedUser))
        }
        setIsLoading(false)
    }, [])

    const login = (token: string, userData: User) => {
        localStorage.setItem('accessToken', token)
        localStorage.setItem('user', JSON.stringify(userData))
        setUser(userData)
    }

    const logout = async () => {
        try {
            await api.post('/auth/logout')
        } catch (error) {
            console.error('Logout failed', error)
        }
        localStorage.removeItem('accessToken')
        localStorage.removeItem('user')
        setUser(null)
        window.location.href = '/login'
    }

    return (
        <AuthContext.Provider value={{ user, login, logout, isLoading }}>
            {children}
        </AuthContext.Provider>
    )
}

export const useAuth = () => {
    const context = useContext(AuthContext)
    if (!context) throw new Error('useAuth must be used within AuthProvider')
    return context
}
