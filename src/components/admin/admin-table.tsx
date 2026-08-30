import { ReactNode } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function AdminTable({ title, headers, rows, empty = "No records found." }: { title: string; headers: string[]; rows: ReactNode[][]; empty?: string }) {
  return <Card><CardHeader><CardTitle>{title}</CardTitle></CardHeader><CardContent className="overflow-x-auto">
    <table className="w-full text-sm"><thead><tr className="border-b text-left">{headers.map(h=><th key={h} className="px-3 py-3 font-medium text-muted-foreground">{h}</th>)}</tr></thead>
    <tbody>{rows.length ? rows.map((row,i)=><tr key={i} className="border-b last:border-0">{row.map((cell,j)=><td key={j} className="px-3 py-3 align-top">{cell}</td>)}</tr>) : <tr><td colSpan={headers.length} className="py-12 text-center text-muted-foreground">{empty}</td></tr>}</tbody></table>
  </CardContent></Card>;
}
