import { Head, Link } from '@inertiajs/react';
import { Scale } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { login } from '@/routes';

export default function Welcome() {
    return (
        <>
            <Head title="Welcome" />

            <div className="min-h-screen flex items-center justify-center bg-background p-4 text-foreground relative overflow-hidden">

                <Card className="w-full max-w-4xl border border-border bg-card shadow-2xl relative z-10">
                    <CardContent className="flex flex-col items-center text-center py-20 px-6 space-y-10">

                        {/* Header Section */}
                        <div className="space-y-4">
                            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-foreground drop-shadow-sm">
                                Lupon Tagapamayapa
                            </h1>
                            <div className="w-24 h-1.5 bg-[#dd8b11] mx-auto rounded-full"></div>
                            <h2 className="text-2xl md:text-3xl font-semibold text-muted-foreground">
                                Case Management System
                            </h2>
                            <p className="text-lg text-muted-foreground/80 font-medium tracking-wide uppercase mt-2">
                                Barangay 183, Villamor Air Base, Pasay City
                            </p>
                        </div>

                        {/* Icon Section */}
                        <div className="relative group">
                            <div className="relative bg-card p-8 rounded-full border border-border shadow-lg">
                                <Scale className="w-24 h-24 text-[#dd8b11]" strokeWidth={1.5} />
                            </div>
                        </div>

                        {/* Action Section */}
                        <div className="pt-4">
                            <Button asChild size="lg" className="bg-[#dd8b11] text-white hover:bg-[#c47c0f] border-2 border-transparent text-lg px-12 py-6 rounded-full shadow-xl transition-all duration-300 transform hover:scale-105">
                                <Link href={login()}>
                                    Access System
                                </Link>
                            </Button>
                        </div>

                    </CardContent>
                </Card>

                {/* Footer Copy */}
                <div className="absolute bottom-6 text-xs text-zinc-400 font-medium tracking-widest uppercase opacity-60">
                    Official Official Business
                </div>
            </div>
        </>
    );
}
