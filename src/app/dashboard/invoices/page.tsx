import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Receipt, Download, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatDate, formatPrice } from "@/lib/utils";

export const metadata = { title: "Invoices – Dashboard" };

export default async function InvoicesPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/auth/login");

  const orders = await prisma.order.findMany({
    where: { userId: session.user.id, status: "COMPLETED" },
    include: {
      items: { include: { note: { select: { title: true } } } },
      invoice: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <h1 className="font-heading text-2xl font-bold mb-8">Invoices & Orders</h1>

      {orders.length === 0 ? (
        <div className="text-center py-20 border border-dashed border-border rounded-2xl">
          <Receipt className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h2 className="font-heading text-xl font-bold mb-2">No orders yet</h2>
          <p className="text-muted-foreground text-sm mb-6">Your purchase history will appear here.</p>
          <Button asChild><Link href="/notes">Browse Notes</Link></Button>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div key={order.id} className="rounded-2xl border border-border bg-card p-5">
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <Badge className="bg-green-500 text-white border-0">Paid</Badge>
                    {order.invoice && (
                      <span className="text-sm text-muted-foreground font-mono">#{order.invoice.invoiceNumber}</span>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">{formatDate(order.createdAt)}</p>
                  <div className="mt-3 space-y-1">
                    {order.items.map((item) => (
                      <p key={item.id} className="text-sm">• {item.note.title}</p>
                    ))}
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-lg">{formatPrice(order.finalAmount)}</p>
                  {order.couponDiscount > 0 && (
                    <p className="text-xs text-green-600">-{formatPrice(order.couponDiscount)} discount</p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
