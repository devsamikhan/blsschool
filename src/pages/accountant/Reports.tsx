// src/pages/accountant/Reports.tsx
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
  { class: 'Nursery', totalStudents: 25, paid: 22, pending: 3, collected: 22000, pendingAmount: 3000 },
  { class: 'KG', totalStudents: 28, paid: 25, pending: 3, collected: 25000, pendingAmount: 3000 },
  { class: '1', totalStudents: 30, paid: 28, pending: 2, collected: 28000, pendingAmount: 2000 },
  { class: '2', totalStudents: 27, paid: 24, pending: 3, collected: 24000, pendingAmount: 3000 },
  { class: '3', totalStudents: 26, paid: 26, pending: 0, collected: 26000, pendingAmount: 0 },
  { class: '4', totalStudents: 24, paid: 22, pending: 2, collected: 22000, pendingAmount: 2000 },
  { class: '5', totalStudents: 25, paid: 23, pending: 2, collected: 23000, pendingAmount: 2000 },
  { class: '6', totalStudents: 23, paid: 21, pending: 2, collected: 21000, pendingAmount: 2000 },
  { class: '7', totalStudents: 22, paid: 20, pending: 2, collected: 20000, pendingAmount: 2000 },
  { class: '8', totalStudents: 20, paid: 19, pending: 1, collected: 19000, pendingAmount: 1000 },
];

// Dummy expense report
const expenseReport = [
  { category: 'Electricity', amount: 15000, percentage: 12 },
  { category: 'Salary', amount: 90000, percentage: 70 },
  { category: 'Stationery', amount: 8000, percentage: 6 },
  { category: 'Maintenance', amount: 10000, percentage: 8 },
  { category: 'Other', amount: 5000, percentage: 4 },
];

export default function Reports() {
  const navigate = useNavigate();

  const totalCollected = feeReport.reduce((sum, row) => sum + row.collected, 0);
  const totalPending = feeReport.reduce((sum, row) => sum + row.pendingAmount, 0);
  const totalExpenses = expenseReport.reduce((sum, row) => sum + row.amount, 0);

  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center gap-4 mb-6">
        <Button variant="outline" onClick={() => navigate('/accountant')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Dashboard
        </Button>
        <h1 className="text-3xl font-bold">Financial Reports</h1>
      </div>

      <Tabs defaultValue="fee" className="space-y-4">
        <TabsList>
          <TabsTrigger value="fee">Fee Report</TabsTrigger>
          <TabsTrigger value="expense">Expense Report</TabsTrigger>
        </TabsList>

        <TabsContent value="fee">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Fee Collection Report - March 2026</CardTitle>
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600 dark:text-slate-300">Total Collected</p>
                  <p className="text-2xl font-bold text-green-600">₹{totalCollected.toLocaleString()}</p>
                </div>
                <div className="bg-red-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600 dark:text-slate-300">Pending</p>
                  <p className="text-2xl font-bold text-red-600">₹{totalPending.toLocaleString()}</p>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600 dark:text-slate-300">Collection %</p>
                  <p className="text-2xl font-bold">
                    {Math.round((totalCollected / (totalCollected + totalPending)) * 100)}%
                  </p>
                </div>
              </div>

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Class</TableHead>
                    <TableHead>Total Students</TableHead>
                    <TableHead>Paid</TableHead>
                    <TableHead>Pending</TableHead>
                    <TableHead>Collected (₹)</TableHead>
                    <TableHead>Pending (₹)</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {feeReport.map((row) => (
                    <TableRow key={row.class}>
                      <TableCell>Class {row.class}</TableCell>
                      <TableCell>{row.totalStudents}</TableCell>
                      <TableCell>{row.paid}</TableCell>
                      <TableCell>{row.pending}</TableCell>
                      <TableCell>₹{row.collected}</TableCell>
                      <TableCell>₹{row.pendingAmount}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="expense">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Expense Report - March 2026</CardTitle>
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div className="bg-orange-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600 dark:text-slate-300">Total Expenses</p>
                  <p className="text-2xl font-bold">₹{totalExpenses.toLocaleString()}</p>
                </div>
                <div className="bg-blue-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600 dark:text-slate-300">Categories</p>
                  <p className="text-2xl font-bold">{expenseReport.length}</p>
                </div>
              </div>

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Category</TableHead>
                    <TableHead>Amount (₹)</TableHead>
                    <TableHead>Percentage</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {expenseReport.map((row) => (
                    <TableRow key={row.category}>
                      <TableCell className="font-medium">{row.category}</TableCell>
                      <TableCell>₹{row.amount}</TableCell>
                      <TableCell>{row.percentage}%</TableCell>
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