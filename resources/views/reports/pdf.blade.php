<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>System Report</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <style>
        body {
            font-family: 'Times New Roman', serif;
        }

        .page-break {
            page-break-after: always;
        }

        @page {
            margin: 1in;
        }
    </style>
</head>

<body class="bg-white text-black p-8">

    <!-- Header -->
    <div class="text-center mb-10 border-b pb-4">
        <h1 class="text-2xl font-bold uppercase tracking-wide">Office of the Lupon Tagapamayapa</h1>
        <p class="text-sm text-gray-600">Barangay Hall, [Barangay Name], [City/Municipality]</p>
        <div class="mt-4">
            <h2 class="text-xl font-semibold">System Report: {{ ucwords($type ?? 'Summary') }}</h2>
            <p class="text-sm text-gray-500">Generated on: {{ date('F d, Y h:i A') }}</p>
        </div>
    </div>

    <!-- Summary Stats -->
    <div class="mb-10">
        <h3 class="text-lg font-bold border-b mb-4 pb-2">Case Statistics Overview</h3>
        <div class="grid grid-cols-2 gap-6">
            <div class="border p-4 rounded bg-gray-50">
                <span class="block text-sm text-gray-500 uppercase">Total Cases</span>
                <span class="block text-3xl font-bold">{{ $stats['total_cases'] }}</span>
            </div>
            <div class="border p-4 rounded bg-gray-50">
                <span class="block text-sm text-gray-500 uppercase">Cases This Month</span>
                <span class="block text-3xl font-bold">{{ $stats['cases_this_month'] }}</span>
            </div>
            <div class="border p-4 rounded bg-gray-50">
                <span class="block text-sm text-gray-500 uppercase">Pending Cases</span>
                <span class="block text-3xl font-bold text-orange-600">{{ $stats['pending_cases'] }}</span>
            </div>
            <div class="border p-4 rounded bg-gray-50">
                <span class="block text-sm text-gray-500 uppercase">Resolved/Settled</span>
                <span class="block text-3xl font-bold text-green-600">{{ $stats['resolved_cases'] }}</span>
            </div>
        </div>
    </div>

    <!-- Case Nature Breakdown -->
    <div class="mb-10">
        <h3 class="text-lg font-bold border-b mb-4 pb-2">Cases by Nature</h3>
        <ul class="list-disc pl-5">
            @foreach($stats['cases_by_nature'] as $nature)
                <li class="mb-1">
                    <span class="font-semibold">{{ $nature->nature_of_case }}:</span> {{ $nature->count }}
                </li>
            @endforeach
        </ul>
    </div>

    <!-- Recent Cases Table -->
    <div>
        <h3 class="text-lg font-bold border-b mb-4 pb-2">Recent Cases</h3>
        <table class="w-full text-left text-sm border-collapse">
            <thead>
                <tr class="bg-gray-100 border-b">
                    <th class="py-2 px-2 border">Case No.</th>
                    <th class="py-2 px-2 border">Title</th>
                    <th class="py-2 px-2 border">Nature</th>
                    <th class="py-2 px-2 border">Status</th>
                    <th class="py-2 px-2 border">Date Filed</th>
                </tr>
            </thead>
            <tbody>
                @forelse($stats['recent_cases'] as $case)
                    <tr class="border-b">
                        <td class="py-2 px-2 border">{{ $case['case_number'] }}</td>
                        <td class="py-2 px-2 border">{{ $case['title'] }}</td>
                        <td class="py-2 px-2 border">{{ $case['nature'] }}</td>
                        <td class="py-2 px-2 border">{{ $case['status'] }}</td>
                        <td class="py-2 px-2 border">{{ $case['date_filed'] }}</td>
                    </tr>
                @empty
                    <tr>
                        <td colspan="5" class="py-4 text-center text-gray-500">No recent cases found.</td>
                    </tr>
                @endforelse
            </tbody>
        </table>
    </div>

    <!-- Footer -->
    <div class="mt-10 pt-4 border-t text-center text-xs text-gray-400">
        <p>This report is system-generated and serves as an official record of the Lupon Tagapamayapa.</p>
    </div>

</body>

</html>