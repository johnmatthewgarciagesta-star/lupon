import { Head, Link } from '@inertiajs/react';
import { Scale } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { login } from '@/routes';

export default function Welcome() {
    return (
        <>
            <Head title="Welcome" />

            <div className="min-h-screen flex items-center justify-center bg-white p-4 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-50 relative overflow-hidden">

                <Card className="w-full max-w-4xl border-4 border-double border-black bg-white shadow-2xl relative z-10 dark:bg-zinc-900 dark:border-white">
                    <CardContent className="flex flex-col items-center text-center py-20 px-6 space-y-10">

                        {/* Header Section */}
                        <div className="space-y-4">
                            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-zinc-900 dark:text-white drop-shadow-sm">
                                Lupon Tagapamayapa
                            </h1>
                            <div className="w-24 h-1.5 bg-black mx-auto rounded-full dark:bg-white"></div>
                            <h2 className="text-2xl md:text-3xl font-semibold text-zinc-700 dark:text-zinc-300">
                                Case Management System
                            </h2>
                            <p className="text-lg text-zinc-600 dark:text-zinc-400 font-medium tracking-wide uppercase mt-2">
                                Barangay 183, Villamor Air Base, Pasay City
                            </p>
                        </div>

                        {/* Icon Section */}
                        <div className="relative group">
                            <div className="relative bg-white p-8 rounded-full border-4 border-black shadow-lg dark:bg-zinc-900 dark:border-white">
                                <Scale className="w-24 h-24 text-black dark:text-white" strokeWidth={1.5} />
                            </div>
                        </div>

                        {/* Action Section */}
                        <div className="pt-4">
                            <Button asChild size="lg" className="bg-black text-white hover:bg-zinc-800 border-2 border-transparent hover:border-black text-lg px-12 py-6 rounded-full shadow-xl transition-all duration-300 transform hover:scale-105 dark:bg-white dark:text-black dark:hover:bg-zinc-200">
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
