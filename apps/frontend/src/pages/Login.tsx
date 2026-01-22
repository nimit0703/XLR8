import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import api from '../lib/api'
import { useAuth } from '../context/AuthContext'

export default function Login() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')
    const { login } = useAuth()
    const navigate = useNavigate()

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')
        try {
            const res = await api.post('/auth/login', { email, password })
            login(res.data.accessToken, res.data.user)
            navigate('/')
        } catch (err: any) {
            setError(err.response?.data?.error || 'Login failed')
        }
    }

    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-900 text-white">
            <div className="w-full max-w-md p-8 bg-gray-800 rounded-lg shadow-lg border border-gray-700">
                <h2 className="text-3xl font-bold mb-6 text-center text-blue-400">
                    Welcome Back
                </h2>
                {error && (
                    <div className="p-3 mb-4 bg-red-900/50 text-red-200 rounded">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm text-gray-400 mb-1">
                            Email
                        </label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full p-3 bg-gray-700 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm text-gray-400 mb-1">
                            Password
                        </label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full p-3 bg-gray-700 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                        />
                    </div>
                    <button
                        type="submit"
                        className="w-full bg-blue-600 hover:bg-blue-500 p-3 rounded font-bold transition"
                    >
                        Sign In
                    </button>
                </form>
                <p className="mt-4 text-center text-gray-400 text-sm">
                    Don't have an account?{' '}
                    <Link
                        to="/signup"
                        className="text-blue-400 hover:underline"
                    >
                        Sign up
                    </Link>
                </p>
            </div>
        </div>
    )
}
