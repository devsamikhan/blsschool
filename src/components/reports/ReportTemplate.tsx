import React from 'react';
import { Button } from '../ui/button';
import { Printer, ShieldCheck, Award, FileText, CheckCircle2 } from 'lucide-react';
import blsLogo from '../../assets/logo-bls.jpeg';

interface ReportTemplateProps {
  title: string;
  subtitle?: string;
  docRef?: string;
  children: React.ReactNode;
}

export function ReportTemplate({ title, subtitle, docRef, children }: ReportTemplateProps) {
  const handlePrint = () => {
    window.print();
  };

  const currentYear = new Date().getFullYear();
  const dateStr = new Date().toLocaleDateString('en-US', { 
    day: 'numeric', 
    month: 'long', 
    year: 'numeric' 
  });

  return (
    <>
      <style>
        {`
          /* --- GLOBAL RESET FOR COMPONENT --- */
          .report-root-container *, .report-root-container *:before, .report-root-container *:after {
            box-sizing: border-box !important;
          }

          /* --- WEB VIEW STYLES --- */
          @media screen {
            .app-report-container {
              min-height: 100vh;
              background: #f1f5f9;
              padding: 40px 20px;
              display: flex;
              flex-direction: column;
              align-items: center;
            }
            .a4-paper {
              width: 210mm;
              min-height: 297mm;
              background: white;
              box-shadow: 0 0 0 1px rgba(0,0,0,0.05), 0 25px 50px -12px rgba(0, 0, 0, 0.1);
              padding: 20mm;
              position: relative;
              margin: 0 auto;
            }
          }

          /* --- PRINT ENGINE (PIXEL PERFECT ALIGNMENT) --- */
          @media print {
            @page {
              size: A4;
              margin: 20mm;
            }

            body {
              visibility: hidden !important;
              margin: 0 !important;
              padding: 0 !important;
            }

            .printable-zone, .printable-zone * {
              visibility: visible !important;
            }

            .printable-zone {
              width: 100% !important;
              max-width: 180mm !important;
              margin: 0 auto !important;
              padding: 0 !important;
              background: white !important;
            }

            /* Clean UI for print */
            .no-print, .print\\:hidden, button, nav, aside, header {
              display: none !important;
            }

            .a4-paper {
              width: 100% !important;
              padding: 0 !important;
              margin: 0 !important;
              box-shadow: none !important;
            }

            .a4-table { 
              width: 100% !important; 
              display: table !important;
            }
            
            thead { display: table-header-group !important; }
            tfoot { display: table-footer-group !important; }
          }

          .watermark-bg {
            display: none !important;
          }
        `}
      </style>

      <div className="report-root-container app-report-container printable-zone">
        {/* Floating Print Toolbar */}
        <div className="print:hidden w-full max-w-[210mm] flex justify-center mb-10 sticky top-0 py-4 z-[100] backdrop-blur-sm bg-slate-50/10 rounded-b-3xl">
          <Button 
            onClick={handlePrint} 
            size="lg" 
            className="rounded-xl bg-slate-900 border-2 border-slate-800 shadow-xl px-10 h-14 hover:scale-105 transition-transform"
          >
            <Printer className="h-4 w-4 mr-3" />
            <span className="font-bold uppercase tracking-widest text-xs">Print Official Report</span>
          </Button>
        </div>

        <div className="a4-paper font-sans">
          <div className="watermark-bg">BLS SCHOOL</div>
          
          <table className="w-full border-collapse a4-table">
            <thead>
              <tr>
                <td className="p-0">
                  <div className="pb-4 mb-8 border-b-2 border-slate-900 text-center">
                    <div className="flex flex-col items-center gap-2">
                      <img src={blsLogo} alt="Logo" className="h-10 w-auto mb-1" />
                      <h1 className="text-2xl font-bold text-slate-900 tracking-tight uppercase underline underline-offset-8 decoration-slate-900">BLS ISAKHEL</h1>
                      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.4em] mt-1 italic">Knowledge is Power • Established Excellence</p>
                    </div>
                    <div className="mt-8">
                      <h2 className="text-xl font-bold text-slate-900 uppercase leading-none mb-1 tracking-widest">{title}</h2>
                      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest font-mono">
                        {docRef || `ADM-REF: ${currentYear}`} | {dateStr}
                      </p>
                    </div>
                  </div>
                </td>
              </tr>
            </thead>

            <tbody>
              <tr>
                <td className="p-0">
                  <div className="py-1">
                    {subtitle && (
                      <div className="mb-10 pb-4 border-b border-slate-200">
                        <p className="text-sm font-bold text-slate-900 uppercase tracking-tight italic decoration-slate-900">Subject: {subtitle}</p>
                      </div>
                    )}
                    <div className="relative z-10 w-full text-[13px]">
                      {children}
                    </div>
                  </div>
                </td>
              </tr>
            </tbody>

            <tfoot>
              <tr>
                <td className="p-0 pt-20">
                  <table className="w-full border-collapse">
                    <tbody>
                      <tr>
                        <td className="w-1/2 p-4 text-center">
                          <div className="border-b-2 border-slate-900 mb-2 h-10 w-48 mx-auto" />
                          <p className="text-[10px] font-bold text-slate-900 uppercase tracking-widest">Office Signature</p>
                          <p className="text-[8px] font-medium text-slate-400 uppercase mt-1 italic">Verified Registrar Registry</p>
                        </td>
                        <td className="w-1/2 p-4 text-center">
                          <div className="border-b-2 border-slate-900 mb-2 h-10 w-48 mx-auto" />
                          <p className="text-[10px] font-bold text-slate-900 uppercase tracking-widest">Executive Signature</p>
                          <p className="text-[8px] font-medium text-slate-400 uppercase mt-1 italic">School Principal Approval</p>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                  
                  <div className="flex justify-between items-center text-[7px] font-bold text-slate-300 pt-3 border-t border-slate-50 uppercase tracking-tighter">
                    <p>Institutional Record • Mianwali, Punjab, Pakistan • BLS registry • Digital Archive</p>
                    <p className="font-mono">CID: {Math.random().toString(36).substring(8).toUpperCase()}</p>
                  </div>
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </>
  );
}
