import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import api from '../lib/api'

export default function Signup() {
    const [form, setForm] = useState({ email: '', username: '', password: '' })
    const [error, setError] = useState('')
    const navigate = useNavigate()

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        try {
            await api.post('/auth/signup', form)
            // Auto redirect to login after signup
            navigate('/login')
        } catch (err: any) {
            setError(err.response?.data?.error || 'Signup failed')
        }
    }

    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-900 text-white">
            <div className="w-full max-w-md p-8 bg-gray-800 rounded-lg shadow-lg border border-gray-700">
                <h2 className="text-3xl font-bold mb-6 text-center text-green-400">
                    Create Account
                </h2>
                {error && (
                    <div className="p-3 mb-4 bg-red-900/50 text-red-200 rounded">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <input
                        placeholder="Username"
                        value={form.username}
                        onChange={(e) =>
                            setForm({ ...form, username: e.target.value })
                        }
                        className="w-full p-3 bg-gray-700 rounded focus:outline-none focus:ring-2 focus:ring-green-500"
                        required
                    />
                    <input
                        placeholder="Email"
                        type="email"
                        value={form.email}
                        onChange={(e) =>
                            setForm({ ...form, email: e.target.value })
                        }
                        className="w-full p-3 bg-gray-700 rounded focus:outline-none focus:ring-2 focus:ring-green-500"
                        required
                    />
                    <input
                        placeholder="Password"
                        type="password"
                        value={form.password}
                        onChange={(e) =>
                            setForm({ ...form, password: e.target.value })
                        }
                        className="w-full p-3 bg-gray-700 rounded focus:outline-none focus:ring-2 focus:ring-green-500"
                        required
                    />
                    <button
                        type="submit"
                        className="w-full bg-green-600 hover:bg-green-500 p-3 rounded font-bold transition"
                    >
                        Sign Up
                    </button>
                </form>
                <p className="mt-4 text-center text-gray-400 text-sm">
                    Already have an account?{' '}
                    <Link
                        to="/login"
                        className="text-green-400 hover:underline"
                    >
                        Login
                    </Link>
                </p>
            </div>
        </div>
    )
}
