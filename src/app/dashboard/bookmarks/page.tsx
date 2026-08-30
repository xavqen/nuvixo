import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
export const metadata={title:"Bookmarks | Studiya",description:"Jump back to saved pages from your purchased notes."};
export default function Page(){return <main className="container py-16"><div className="mx-auto max-w-4xl"><h1 className="text-4xl font-bold">Bookmarks</h1><p className="mt-3 text-lg text-muted-foreground">Jump back to saved pages from your purchased notes.</p><Card className="mt-8"><CardContent className="p-10 text-center"><p className="text-muted-foreground">Everything is ready. Content will appear here as your Studiya account activity grows.</p><Button asChild className="mt-5"><Link href="/notes">Browse notes</Link></Button></CardContent></Card></div></main>}
