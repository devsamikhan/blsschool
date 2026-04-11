// src/pages/principal/Teachers.tsx
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
import { Search, Mail, Phone } from 'lucide-react';

// Dummy teachers data
const dummyTeachers = [
  { id: '1', name: 'Miss Ayesha', email: 'ayesha@school.com', phone: '0300-1234567', classes: ['Nursery'] },
  { id: '2', name: 'Miss Fatima', email: 'fatima@school.com', phone: '0300-1234568', classes: ['KG'] },
  { id: '3', name: 'Mr. Ali', email: 'ali@school.com', phone: '0300-1234569', classes: ['1', '2'] },
  { id: '4', name: 'Miss Sana', email: 'sana@school.com', phone: '0300-1234570', classes: ['3', '4'] },
  { id: '5', name: 'Mr. Ahmed', email: 'ahmed@school.com', phone: '0300-1234571', classes: ['5', '6'] },
  { id: '6', name: 'Miss Sara', email: 'sara@school.com', phone: '0300-1234572', classes: ['7', '8'] },
];

export default function Teachers() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');

  const filtered = dummyTeachers.filter(teacher =>
    teacher.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    teacher.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center gap-4 mb-6">
        <Button variant="outline" onClick={() => navigate('/principal')}>
          ← Back to Dashboard
        </Button>
        <h1 className="text-3xl font-bold">All Teachers</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Teaching Staff</CardTitle>
          <div className="flex items-center space-x-2">
            <Search className="h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search by name or email..."
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
                <TableHead>Classes</TableHead>
                <TableHead>Contact</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((teacher) => (
                <TableRow key={teacher.id}>
                  <TableCell className="font-medium">{teacher.name}</TableCell>
                  <TableCell>
                    {teacher.classes.map(c => `Class ${c}`).join(', ')}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-1 text-sm">
                        <Mail className="h-3 w-3" />
                        {teacher.email}
                      </div>
                      <div className="flex items-center gap-1 text-sm">
                        <Phone className="h-3 w-3" />
                        {teacher.phone}
                      </div>
                    </div>
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