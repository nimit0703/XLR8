import { useEffect, useState } from 'react'
import api from '../lib/api'
import { useAuth } from '../context/AuthContext'

interface UserData {
    id: string
    email: string
    username: string
    role: string
    isActive: boolean
}

export default function Dashboard() {
    const [users, setUsers] = useState<UserData[]>([])
    const { user, logout } = useAuth()

    useEffect(() => {
        fetchUsers()
    }, [])

    const fetchUsers = async () => {
        try {
            const { data } = await api.get('/users')
            setUsers(data.data)
        } catch (error) {
            console.error('Failed to fetch users', error)
        }
    }

    return (
        <div className="min-h-screen bg-gray-900 text-white">
            {/* Navbar */}
            <nav className="bg-gray-800 p-4 border-b border-gray-700 flex justify-between items-center">
                <h1 className="text-xl font-bold tracking-widest text-purple-400">
                    XLR8 DASHBOARD
                </h1>
                <div className="flex items-center gap-4">
                    <span className="text-gray-300">
                        Hello,{' '}
                        <span className="font-bold text-white">
                            {user?.username}
                        </span>
                    </span>
                    <button
                        onClick={logout}
                        className="px-4 py-2 bg-red-600 hover:bg-red-500 rounded text-sm font-semibold transition"
                    >
                        Logout
                    </button>
                </div>
            </nav>

            {/* Content */}
            <main className="p-8 max-w-6xl mx-auto">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold">User List</h2>
                    <button
                        onClick={fetchUsers}
                        className="text-sm text-blue-400 hover:underline"
                    >
                        Refresh List
                    </button>
                </div>

                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {users.map((u) => (
                        <div
                            key={u.id}
                            className="bg-gray-800 p-6 rounded-lg border border-gray-700 hover:border-purple-500 transition"
                        >
                            <div className="flex justify-between items-start">
                                <div>
                                    <h3 className="font-bold text-lg">
                                        {u.username}
                                    </h3>
                                    <p className="text-gray-400 text-sm">
                                        {u.email}
                                    </p>
                                </div>
                                <span
                                    className={`px-2 py-1 rounded text-xs font-bold ${
                                        u.role === 'ADMIN'
                                            ? 'bg-purple-900 text-purple-200'
                                            : 'bg-gray-700 text-gray-300'
                                    }`}
                                >
                                    {u.role}
                                </span>
                            </div>
                            <div className="mt-4 flex items-center gap-2">
                                <div
                                    className={`w-2 h-2 rounded-full ${
                                        u.isActive
                                            ? 'bg-green-500'
                                            : 'bg-red-500'
                                    }`}
                                ></div>
                                <span className="text-xs text-gray-400">
                                    {u.isActive ? 'Active' : 'Inactive'}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            </main>
        </div>
    )
}
