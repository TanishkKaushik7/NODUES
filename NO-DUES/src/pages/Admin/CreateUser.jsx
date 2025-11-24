import React, { useState } from 'react';
import AdminSidebar from './adminsidebar';
import Header from '../../components/common/Header';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';

export default function CreateUser() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('Library');

    const handleSubmit = (e) => {
        e.preventDefault();
        // For now just log — replace with authFetch in future
        console.log('Create user', { name, email, password, role });
        setName(''); setEmail(''); setPassword(''); setRole('Library');
    };

    return (
        <div className="flex h-screen bg-gray-100">
            <AdminSidebar />

            <div className="flex-1 flex flex-col overflow-hidden">
                <Header />

                <main className="flex-1 p-6 overflow-auto">
                    <h1 className="text-2xl font-bold mb-4">Create Department User</h1>

                    <div className="max-w-lg bg-white p-6 rounded shadow">
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm mb-1">Name</label>
                                <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Full name" />
                            </div>

                            <div>
                                <label className="block text-sm mb-1">Email</label>
                                <Input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="email@example.com" />
                            </div>

                            <div>
                                <label className="block text-sm mb-1">Password</label>
                                <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" />
                            </div>

                            <div>
                                <label className="block text-sm mb-1">Role</label>
                                <select value={role} onChange={(e) => setRole(e.target.value)} className="w-full px-3 py-2 border rounded-md">
                                    <option value="Library">Library</option>
                                    <option value="Hostel">Hostel</option>
                                    <option value="Accounts">Accounts</option>
                                    <option value="Sports">Sports</option>
                                    <option value="Exam Cell">Exam Cell</option>
                                </select>
                            </div>

                            <div className="flex gap-2">
                                <Button type="submit" className="flex-1">Create User</Button>
                                <Button type="button" variant="outline" onClick={() => { setName(''); setEmail(''); setPassword(''); setRole('Library'); }}>Reset</Button>
                            </div>
                        </form>
                    </div>
                </main>
            </div>
        </div>
    );
}

