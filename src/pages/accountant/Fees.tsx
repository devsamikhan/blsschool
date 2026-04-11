// src/pages/accountant/Fees.tsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Search, Eye, CreditCard } from 'lucide-react';

// Dummy student fee data
const dummyFeeData = [
  { id: '1', name: 'Ali Raza', class: '5', schoolId: 'STU001', totalFee: 5000, paid: 5000, pending: 0, dueDate: '2026-03-10' },
  { id: '2', name: 'Sara Khan', class: '5', schoolId: 'STU003', totalFee: 5000, paid: 3000, pending: 2000, dueDate: '2026-03-15' },
  { id: '3', name: 'Ahmed Malik', class: '6', schoolId: 'STU004', totalFee: 5500, paid: 5500, pending: 0, dueDate: '2026-03-12' },
  { id: '4', name: 'Fatima', class: '6', schoolId: 'STU005', totalFee: 5500, paid: 2000, pending: 3500, dueDate: '2026-03-18' },
];

export default function Fees() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');

  const filtered = dummyFeeData.filter(student =>
    student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.schoolId.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.class.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center gap-4 mb-6">
        <Button variant="outline" onClick={() => navigate('/accountant')}>
          ← Back to Dashboard
        </Button>
        <h1 className="text-3xl font-bold">Fee Management</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Student Fee Records</CardTitle>
          <div className="flex items-center space-x-2">
            <Search className="h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search by name, ID, or class..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-sm"
            />
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Class</TableHead>
                <TableHead>School ID</TableHead>
                <TableHead>Total Fee</TableHead>
                <TableHead>Paid</TableHead>
                <TableHead>Pending</TableHead>
                <TableHead>Due Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((student) => (
                <TableRow key={student.id}>
                  <TableCell className="font-medium">{student.name}</TableCell>
                  <TableCell>Class {student.class}</TableCell>
                  <TableCell>{student.schoolId}</TableCell>
                  <TableCell>₹{student.totalFee}</TableCell>
                  <TableCell className="text-green-600">₹{student.paid}</TableCell>
                  <TableCell className={student.pending > 0 ? 'text-red-600' : 'text-green-600'}>
                    ₹{student.pending}
                  </TableCell>
                  <TableCell>{student.dueDate}</TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => navigate(`/accountant/fees/${student.id}`)}
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      View
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => alert('Collect fee - to be implemented')}
                      disabled={student.pending === 0}
                    >
                      <CreditCard className="h-4 w-4 mr-1" />
                      Collect
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}