import React from 'react';
import AdminSidebar from './adminsidebar';
import Header from '../../components/common/Header';

export default function HistoryPage() {
	return (
		<div className="flex h-screen bg-gray-100">
			<AdminSidebar />

			<div className="flex-1 flex flex-col overflow-hidden">
				<Header />

				<main className="flex-1 p-6 overflow-auto">
					<h1 className="text-2xl font-bold mb-4">Admin - History</h1>
					<p className="text-gray-600">No history to show.</p>
				</main>
			</div>
		</div>
	);
}

