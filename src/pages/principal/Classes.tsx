// src/pages/principal/Classes.tsx
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
import { Search, Users, Eye } from 'lucide-react';

// Dummy classes data
const dummyClasses = [
  { id: '1', name: 'Nursery', students: 25, teacher: 'Miss Ayesha' },
  { id: '2', name: 'KG', students: 28, teacher: 'Miss Fatima' },
  { id: '3', name: '1', students: 30, teacher: 'Mr. Ali' },
  { id: '4', name: '2', students: 27, teacher: 'Mr. Raza' },
  { id: '5', name: '3', students: 26, teacher: 'Miss Sana' },
  { id: '6', name: '4', students: 24, teacher: 'Miss Hina' },
  { id: '7', name: '5', students: 25, teacher: 'Mr. Ahmed' },
  { id: '8', name: '6', students: 23, teacher: 'Miss Sara' },
  { id: '9', name: '7', students: 22, teacher: 'Mr. Zain' },
  { id: '10', name: '8', students: 20, teacher: 'Miss Komal' },
];

export default function Classes() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');

  const filtered = dummyClasses.filter(cls =>
    cls.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cls.teacher.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center gap-4 mb-6">
        <Button variant="outline" onClick={() => navigate('/principal')}>
          ← Back to Dashboard
        </Button>
        <h1 className="text-3xl font-bold">All Classes</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Classes (Nursery to 8th)</CardTitle>
          <div className="flex items-center space-x-2">
            <Search className="h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search by class name or teacher..."
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
                <TableHead>Class</TableHead>
                <TableHead>Class Teacher</TableHead>
                <TableHead>Students</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((cls) => (
                <TableRow key={cls.id}>
                  <TableCell className="font-medium">Class {cls.name}</TableCell>
                  <TableCell>{cls.teacher}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      {cls.students} students
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => navigate(`/principal/classes/${cls.id}`)}
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      View Details
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