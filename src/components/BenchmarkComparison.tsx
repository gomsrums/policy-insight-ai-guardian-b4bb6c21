
import { PolicyBenchmark } from "@/lib/chatpdf-types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

interface BenchmarkComparisonProps {
  benchmark: PolicyBenchmark;
  isLoading?: boolean;
}

const BenchmarkComparison = ({ benchmark, isLoading = false }: BenchmarkComparisonProps) => {
  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-8 w-1/3 bg-gray-200 rounded animate-pulse"></div>
        {[1, 2, 3].map((i) => (
          <div key={i} className="space-y-2">
            <div className="h-6 w-1/4 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-20 bg-gray-200 rounded animate-pulse"></div>
          </div>
        ))}
      </div>
    );
  }

  const scoreColor = 
    benchmark.benchmarkScore >= 8 ? "bg-green-500" :
    benchmark.benchmarkScore >= 6 ? "bg-amber-500" : 
    "bg-red-500";

  return (
    <div className="space-y-6">
      <div className="flex flex-col items-center">
        <h3 className="text-xl font-medium mb-2">Benchmark Score</h3>
        <div className="relative w-36 h-36">
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-4xl font-bold">{benchmark.benchmarkScore}</span>
            <span className="text-lg">/10</span>
          </div>
          <svg className="w-full h-full transform -rotate-90">
            <circle
              cx="72"
              cy="72"
              r="60"
              fill="none"
              stroke="#e5e7eb"
              strokeWidth="12"
            />
            <circle
              cx="72"
              cy="72"
              r="60"
              fill="none"
              stroke={
                benchmark.benchmarkScore >= 8 ? "#10b981" :
                benchmark.benchmarkScore >= 6 ? "#f59e0b" : 
                "#ef4444"
              }
              strokeWidth="12"
              strokeDasharray={`${benchmark.benchmarkScore * 37.7} 377`}
            />
          </svg>
        </div>
      </div>

      <Card className="border-blue-200">
        <CardHeader className="bg-blue-50 border-b border-blue-200">
          <CardTitle className="text-blue-700">Coverage Limits</CardTitle>
        </CardHeader>
        <CardContent className="pt-4">
          <p>{benchmark.coverageLimits}</p>
        </CardContent>
      </Card>

      <Card className="border-purple-200">
        <CardHeader className="bg-purple-50 border-b border-purple-200">
          <CardTitle className="text-purple-700">Deductibles</CardTitle>
        </CardHeader>
        <CardContent className="pt-4">
          <p>{benchmark.deductibles}</p>
        </CardContent>
      </Card>

      <Card className="border-red-200">
        <CardHeader className="bg-red-50 border-b border-red-200">
          <CardTitle className="text-red-700">Missing Coverages</CardTitle>
        </CardHeader>
        <CardContent className="pt-4">
          {benchmark.missingCoverages.length > 0 ? (
            <ul className="space-y-2">
              {benchmark.missingCoverages.map((coverage, index) => (
                <li key={index} className="flex gap-2">
                  <span className="text-red-500 font-bold">•</span>
                  <span>{coverage}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500">No missing coverages identified.</p>
          )}
        </CardContent>
      </Card>

      <Card className="border-green-200">
        <CardHeader className="bg-green-50 border-b border-green-200">
          <CardTitle className="text-green-700">Premium Comparison</CardTitle>
        </CardHeader>
        <CardContent className="pt-4">
          <p>{benchmark.premiumComparison}</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default BenchmarkComparison;
