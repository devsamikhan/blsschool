// src/pages/principal/Reports.tsx
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { ArrowLeft, Download } from 'lucide-react';

// Dummy fee report
const feeReport = [
  { class: 'Nursery', totalStudents: 25, paid: 22, pending: 3, amount: 25000 },
  { class: 'KG', totalStudents: 28, paid: 25, pending: 3, amount: 28000 },
  { class: '1', totalStudents: 30, paid: 28, pending: 2, amount: 30000 },
  { class: '2', totalStudents: 27, paid: 24, pending: 3, amount: 27000 },
  { class: '3', totalStudents: 26, paid: 26, pending: 0, amount: 26000 },
  { class: '4', totalStudents: 24, paid: 22, pending: 2, amount: 24000 },
  { class: '5', totalStudents: 25, paid: 23, pending: 2, amount: 25000 },
  { class: '6', totalStudents: 23, paid: 21, pending: 2, amount: 23000 },
  { class: '7', totalStudents: 22, paid: 20, pending: 2, amount: 22000 },
  { class: '8', totalStudents: 20, paid: 19, pending: 1, amount: 20000 },
];

// Dummy homework report
const homeworkReport = [
  { class: '5', subject: 'Math', assigned: '2026-03-10', due: '2026-03-15', submissions: 20, total: 25 },
  { class: '6', subject: 'Science', assigned: '2026-03-12', due: '2026-03-18', submissions: 18, total: 23 },
  { class: '7', subject: 'English', assigned: '2026-03-14', due: '2026-03-20', submissions: 15, total: 22 },
];

export default function Reports() {
  const navigate = useNavigate();

  const totalFee = feeReport.reduce((sum, row) => sum + row.amount, 0);
  const totalPaid = feeReport.reduce((sum, row) => sum + (row.paid * 1000), 0); // approximate

  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center gap-4 mb-6">
        <Button variant="outline" onClick={() => navigate('/principal')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Dashboard
        </Button>
        <h1 className="text-3xl font-bold">Reports</h1>
      </div>

      <Tabs defaultValue="fee" className="space-y-4">
        <TabsList>
          <TabsTrigger value="fee">Fee Reports</TabsTrigger>
          <TabsTrigger value="homework">Homework Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="fee">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Fee Collection Summary - March 2026</CardTitle>
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600 dark:text-slate-300">Total Fee</p>
                  <p className="text-2xl font-bold">₹{totalFee.toLocaleString()}</p>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600 dark:text-slate-300">Collected</p>
                  <p className="text-2xl font-bold text-green-600">₹{totalPaid.toLocaleString()}</p>
                </div>
                <div className="bg-red-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600 dark:text-slate-300">Pending</p>
                  <p className="text-2xl font-bold text-red-600">₹{(totalFee - totalPaid).toLocaleString()}</p>
                </div>
              </div>

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Class</TableHead>
                    <TableHead>Total Students</TableHead>
                    <TableHead>Paid</TableHead>
                    <TableHead>Pending</TableHead>
                    <TableHead>Collection %</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {feeReport.map((row) => (
                    <TableRow key={row.class}>
                      <TableCell>Class {row.class}</TableCell>
                      <TableCell>{row.totalStudents}</TableCell>
                      <TableCell>{row.paid}</TableCell>
                      <TableCell>{row.pending}</TableCell>
                      <TableCell>
                        {Math.round((row.paid / row.totalStudents) * 100)}%
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="homework">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Homework Submission Report</CardTitle>
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Class</TableHead>
                    <TableHead>Subject</TableHead>
                    <TableHead>Assigned Date</TableHead>
                    <TableHead>Due Date</TableHead>
                    <TableHead>Submissions</TableHead>
                    <TableHead>Completion %</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {homeworkReport.map((hw, index) => (
                    <TableRow key={index}>
                      <TableCell>Class {hw.class}</TableCell>
                      <TableCell>{hw.subject}</TableCell>
                      <TableCell>{hw.assigned}</TableCell>
                      <TableCell>{hw.due}</TableCell>
                      <TableCell>{hw.submissions}/{hw.total}</TableCell>
                      <TableCell>
                        {Math.round((hw.submissions / hw.total) * 100)}%
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}