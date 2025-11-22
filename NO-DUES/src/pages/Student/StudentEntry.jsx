import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';

const StudentEntry = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <Card className="p-8 text-center">
          <h2 className="text-2xl font-bold mb-4">Student Portal</h2>
          <p className="text-gray-600 mb-6">Choose an option to continue.</p>
          <div className="flex flex-col gap-3">
            <Button variant="primary" onClick={() => navigate('/student/login')}>Login</Button>
            <Button variant="outline" onClick={() => navigate('/student/register')}>Register</Button>
            <Button variant="ghost" onClick={() => navigate('/')}>Back</Button>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default StudentEntry;
