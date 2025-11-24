import React from 'react';
import RoleLayout from '../../components/common/RoleLayout';
import { useApplications } from '../../contexts/ApplicationContext';
import ApprovalControls from '../../components/common/ApprovalControls';

export default function PendingPage() {
	const { getByStageAndStatus } = useApplications();
	const pending = getByStageAndStatus('exam', 'pending');

	return (
		<RoleLayout>
			<div className="page pending-page">
				<h1 className="text-2xl font-bold mb-4">Exam - Pending</h1>

				{pending.length === 0 ? (
					<div>No pending applications.</div>
				) : (
					<div className="space-y-4">
						{pending.map(app => (
							<div key={app.id} className="bg-white p-4 rounded shadow">
								<div className="flex justify-between">
									<div>
										<div className="font-medium">{app.student?.name || app.student?.username}</div>
										<div className="text-sm text-gray-500">ID: {app.id}</div>
									</div>
								</div>
								<div className="mt-3">
									{/* files list */}
									{app.files?.length ? (
										<ul className="text-sm text-gray-700 space-y-1">
											{app.files.map((f, idx) => (
												<li key={idx}><a className="text-indigo-600" href={f.url} target="_blank" rel="noreferrer">{f.name}</a></li>
											))}
										</ul>
									) : <div className="text-sm text-gray-500">No files attached</div>}
								</div>

								<ApprovalControls appId={app.id} role="exam" />
							</div>
						))}
					</div>
				)}
			</div>
		</RoleLayout>
	);
}

