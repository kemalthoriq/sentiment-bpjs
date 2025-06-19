"use client"

import type React from "react"

import { useEffect, useState } from "react"
import Link from "next/link"
import {
  Package2,
  ArrowUp,
  ArrowDown,
  MessageSquare,
  MapPin,
  ThumbsUp,
  ThumbsDown,
  Loader2,
  Info,
  AlertCircle,
  CheckCircle,
} from "lucide-react"
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
} from "recharts"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ChartContainer } from "@/components/ui/chart"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

type ChartData = { name: string; value: number }
type ProvinceData = { location: string; count: number }

// Mock data to use when API is unavailable
const MOCK_SENTIMENT_DATA: ChartData[] = [
  { name: "positive", value: 450 },
  { name: "negative", value: 300 },
  { name: "neutral", value: 250 },
]

const MOCK_SUBTOPIC_DATA: ChartData[] = [
  { name: "pelayanan", value: 320 },
  { name: "kecepatan", value: 280 },
  { name: "keramahan", value: 220 },
  { name: "kemudahan", value: 180 },
]

const MOCK_PROVINCE_DATA: ProvinceData[] = [
  { location: "Jakarta", count: 250 },
  { location: "Jawa Barat", count: 200 },
  { location: "Jawa Timur", count: 180 },
  { location: "Jawa Tengah", count: 150 },
  { location: "Sumatera Utara", count: 120 },
  { location: "Bali", count: 100 },
  { location: "Sulawesi Selatan", count: 90 },
  { location: "Kalimantan Timur", count: 80 },
  { location: "Yogyakarta", count: 70 },
  { location: "Sumatera Selatan", count: 60 },
  { location: "Banten", count: 50 },
  { location: "Riau", count: 40 },
  { location: "Lampung", count: 30 },
  { location: "Aceh", count: 25 },
  { location: "Papua", count: 20 },
]

export default function Dashboard() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    category: "",
    message: "",
  })
  const [sentimentData, setSentimentData] = useState<ChartData[]>([])
  const [subtopicData, setSubtopicData] = useState<ChartData[]>([])
  const [provinceData, setProvinceData] = useState<ProvinceData[]>([])
  const [bpjsUserFilter, setBpjsUserFilter] = useState(false)
  const [loading, setLoading] = useState(true)
  const [apiError, setApiError] = useState(false)
  const [stats, setStats] = useState({
    totalTweets: 0,
    positivePercent: 0,
    negativePercent: 0,
    activeProvinces: 0,
  })

  // New color palette
  const COLORS = ["#2973B2", "#48A6A7", "#9ACBD0", "#F2EFE7", "#48A6A7", "#2973B2"]

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (value: string) => {
    setFormData((prev) => ({ ...prev, category: value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log("Form submitted:", formData)
    alert("Form submitted successfully!")
    setFormData({ name: "", email: "", category: "", message: "" })
  }

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        setApiError(false)

        let sentimentArray: ChartData[] = []
        let subtopicArray: ChartData[] = []
        let provinceArray: ProvinceData[] = []

        // Check if API URL is available
        const apiUrl = process.env.NEXT_PUBLIC_API_URL

        if (!apiUrl) {
          // If no API URL, use mock data
          console.log("No API URL provided, using mock data")
          sentimentArray = MOCK_SENTIMENT_DATA
          subtopicArray = MOCK_SUBTOPIC_DATA
          provinceArray = MOCK_PROVINCE_DATA
        } else {
          try {
            // Fetch sentiment distribution
            const sentimentEndpoint = bpjsUserFilter
              ? `${apiUrl}/api/sentiment-distribution-bpjs-users`
              : `${apiUrl}/api/sentiment-distribution`
            const resSentiment = await fetch(sentimentEndpoint)

            if (!resSentiment.ok) {
              throw new Error(`API returned ${resSentiment.status}`)
            }

            const sentimentJson = await resSentiment.json()
            sentimentArray = Object.keys(sentimentJson).map((key) => ({
              name: key,
              value: sentimentJson[key],
            }))

            // Fetch subtopics
            const resSubtopic = await fetch(`${apiUrl}/api/subtopics`)

            if (!resSubtopic.ok) {
              throw new Error(`API returned ${resSubtopic.status}`)
            }

            const subtopicJson = await resSubtopic.json()
            subtopicArray = subtopicJson.map((item: { subtopic: string; count: number }) => ({
              name: item.subtopic,
              value: item.count,
            }))

            // Fetch tweets per province
            const resProvince = await fetch(`${apiUrl}/api/tweets-per-province`)

            if (!resProvince.ok) {
              throw new Error(`API returned ${resProvince.status}`)
            }

            const provinceJson = await resProvince.json()
            provinceArray = provinceJson.map((item: { location: string; count: number }) => ({
              location: item.location,
              count: item.count,
            }))
          } catch (error) {
            console.error("❌ API request failed:", error)
            // Fall back to mock data on API error
            sentimentArray = MOCK_SENTIMENT_DATA
            subtopicArray = MOCK_SUBTOPIC_DATA
            provinceArray = MOCK_PROVINCE_DATA
            setApiError(true)
          }
        }

        // Calculate stats
        const totalTweets = sentimentArray.reduce((sum, item) => sum + item.value, 0)
        const positivePercent =
          (sentimentArray.find((item) => item.name === "positive")?.value / totalTweets) * 100 || 0
        const negativePercent =
          (sentimentArray.find((item) => item.name === "negative")?.value / totalTweets) * 100 || 0
        const activeProvinces = new Set(provinceArray.map((item) => item.location)).size

        setSentimentData(sentimentArray)
        setSubtopicData(subtopicArray)
        setProvinceData(provinceArray)
        setStats({
          totalTweets,
          positivePercent: Number(positivePercent.toFixed(1)),
          negativePercent: Number(negativePercent.toFixed(1)),
          activeProvinces,
        })
      } catch (error) {
        console.error("❌ Failed fetching data:", error)
        // Set mock data as fallback
        setSentimentData(MOCK_SENTIMENT_DATA)
        setSubtopicData(MOCK_SUBTOPIC_DATA)
        setProvinceData(MOCK_PROVINCE_DATA)

        // Calculate stats from mock data
        const totalTweets = MOCK_SENTIMENT_DATA.reduce((sum, item) => sum + item.value, 0)
        const positivePercent =
          (MOCK_SENTIMENT_DATA.find((item) => item.name === "positive")?.value / totalTweets) * 100 || 0
        const negativePercent =
          (MOCK_SENTIMENT_DATA.find((item) => item.name === "negative")?.value / totalTweets) * 100 || 0
        const activeProvinces = new Set(MOCK_PROVINCE_DATA.map((item) => item.location)).size

        setStats({
          totalTweets,
          positivePercent: Number(positivePercent.toFixed(1)),
          negativePercent: Number(negativePercent.toFixed(1)),
          activeProvinces,
        })

        setApiError(true)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [bpjsUserFilter])

  // Calculate total for percentage in pie chart
  const sentimentTotal = sentimentData.reduce((sum, item) => sum + item.value, 0)
  const subtopicTotal = subtopicData.reduce((sum, item) => sum + item.value, 0)

  return (
    <div className="flex min-h-screen w-full flex-col bg-gradient-to-br from-[#F2EFE7] to-[#9ACBD0]/30 mx-auto">
      {/* Navbar */}
      <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-[#096B68] text-white px-4 md:px-6 shadow-sm mx-auto w-full">
        <Link href="/dashboard" className="flex items-center gap-2 font-semibold">
          <Package2 className="h-6 w-6 text-white" />
          <span className="hidden sm:inline font-bold text-white text-xl tracking-wide">SIBI </span>
          <span className="sm:hidden text-white">Dashboard</span>
        </Link>
        <nav className="hidden md:flex gap-6 ml-6">
          <Link href="#welcome" className="text-sm font-medium transition-colors hover:text-white/80">
            Home
          </Link>
          <Link href="#stats" className="text-sm font-medium transition-colors hover:text-white/80">
            Stats
          </Link>
          <Link href="#charts" className="text-sm font-medium transition-colors hover:text-white/80">
            Charts
          </Link>
          <Link href="#form" className="text-sm font-medium transition-colors hover:text-white/80">
            Contact
          </Link>
        </nav>
        {/* <div className="ml-auto">
          <Badge variant="outline" className="bg-white/20 text-white font-medium border-white/30">
            {bpjsUserFilter ? "BPJS Users Only" : "All Users"}
          </Badge>
        </div> */}
      </header>

      {/* Main Content */}
      <main className="flex-1 mx-auto w-full max-w-7xl">
        {/* API Error Alert */}
        {apiError && (
          <div className="container px-4 md:px-6 mx-auto mt-4">
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>API Connection Error</AlertTitle>
              <AlertDescription>
                Could not connect to the data API. Showing sample data for demonstration purposes.
              </AlertDescription>
            </Alert>
          </div>
        )}

        {/* Welcome Section */}
        <section id="welcome" className="py-12 md:py-16 lg:py-20 border-b relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-[#096B68] via-[#129990] to-[#096B68] opacity-90"></div>
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxkZWZzPjxwYXR0ZXJuIGlkPSJwYXR0ZXJuIiB4PSIwIiB5PSIwIiB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHBhdHRlcm5Vbml0cz0idXNlclNwYWNlT25Vc2UiIHBhdHRlcm5UcmFuc2Zvcm09InJvdGF0ZSgzMCkiPjxyZWN0IHg9IjAiIHk9IjAiIHdpZHRoPSIyMCIgaGVpZ2h0PSIyMCIgZmlsbD0icmdiYSgyNTUsMjU1LDI1NSwwLjAzKSI+PC9yZWN0PjwvcGF0dGVybj48L2RlZnM+PHJlY3QgeD0iMCIgeT0iMCIgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNwYXR0ZXJuKSI+PC9yZWN0Pjwvc3ZnPg==')]"></div>

          <div className="container px-4 md:px-6 text-center mx-auto relative z-10">
            {/* <div className="inline-block mb-6">
              <Badge variant="secondary" className="bg-white/20 text-white border-white/30 backdrop-blur-sm">
                Sentiment Analysis
              </Badge>
            </div> */}

            <div className="max-w-4xl mx-auto backdrop-blur-sm p-6 rounded-xl bg-white/10">
              <h1 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl text-white mb-4 drop-shadow-md">
                Sentimen Informasi BPJS Indonesia
              </h1>
              <div className="h-1 w-24 bg-gradient-to-r from-[#9ACBD0] to-[#F2EFE7] mx-auto rounded-full mb-4"></div>
              <p className="max-w-[700px] mx-auto text-white/90 md:text-lg">
                Analyze public sentiment towards BPJS services across Indonesia with real-time data visualization.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-8 justify-center">
              <Button className="text-lg py-2 px-4 bg-[#FFFBDE] text-[#096B68] hover:bg-white/90 shadow-lg">
                Explore Data
              </Button>
              <Button
                variant="outline"
                className="text-lg py-2 px-4 text-white border-white hover:bg-[#096B68] backdrop-blur-sm"
              >
                Documentation
              </Button>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section id="stats" className="py-12 md:py-16">
          <div className="container px-4 md:px-6 mx-auto">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h2 className="text-2xl font-bold tracking-tight">Key Metrics</h2>
                <p className="text-muted-foreground">Overview of sentiment analysis results</p>
              </div>
              <Button
                variant={bpjsUserFilter ? "default" : "outline"}
                onClick={() => setBpjsUserFilter(!bpjsUserFilter)}
                className={`flex items-center gap-2 px-4 py-2 bg-[#096B68] !text-white !hover:bg-[#096B68] ${bpjsUserFilter ? "bg-[#096B68] hover:bg-[#096B68]/90" : "text-[#096B68] border-[#096B68] hover:bg-[#096B68]/10"}`}
              >
                {bpjsUserFilter ? (
                  <>
                    <CheckCircle className="h-4 w-4" />
                    Showing BPJS Users
                  </>
                ) : (
                  <>
                    <AlertCircle className="h-4 w-4" />
                    Show BPJS Users Only
                  </>
                )}
              </Button>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 justify-center">
              <Card className="transition-all hover:shadow-md border-[#9ACBD0]/30">
                <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                  <CardTitle className="text-sm font-medium">Total Tweets</CardTitle>
                  <MessageSquare className="h-4 w-4 text-[#2973B2]" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalTweets.toLocaleString()}</div>
                  <p className="text-xs text-muted-foreground flex items-center mt-1">
                    <ArrowUp className="mr-1 h-3 w-3 text-green-500" />
                    {stats.totalTweets > 0 ? "+10% from last week" : "No data"}
                  </p>
                </CardContent>
              </Card>

              <Card className="transition-all hover:shadow-md border-[#9ACBD0]/30">
                <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                  <CardTitle className="text-sm font-medium">Positive Sentiment</CardTitle>
                  <ThumbsUp className="h-4 w-4 text-[#48A6A7]" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.positivePercent}%</div>
                  <p className="text-xs text-muted-foreground flex items-center mt-1">
                    <ArrowUp className="mr-1 h-3 w-3 text-green-500" />
                    {stats.positivePercent > 0 ? "+5% from last week" : "No data"}
                  </p>
                </CardContent>
              </Card>

              <Card className="transition-all hover:shadow-md border-[#9ACBD0]/30">
                <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                  <CardTitle className="text-sm font-medium">Negative Sentiment</CardTitle>
                  <ThumbsDown className="h-4 w-4 text-[#2973B2]" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.negativePercent}%</div>
                  <p className="text-xs text-muted-foreground flex items-center mt-1">
                    <ArrowDown className="mr-1 h-3 w-3 text-red-500" />
                    {stats.negativePercent > 0 ? "-3% from last week" : "No data"}
                  </p>
                </CardContent>
              </Card>

              <Card className="transition-all hover:shadow-md border-[#9ACBD0]/30">
                <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                  <CardTitle className="text-sm font-medium">Active Provinces</CardTitle>
                  <MapPin className="h-4 w-4 text-[#48A6A7]" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.activeProvinces}</div>
                  <p className="text-xs text-muted-foreground flex items-center mt-1">
                    <ArrowUp className="mr-1 h-3 w-3 text-green-500" />
                    {stats.activeProvinces > 0 ? "+2 from last week" : "No data"}
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Process Explanation Section */}
        <section id="process" className="py-12 md:py-16 bg-[#F2EFE7]/30 border-t border-b">
          <div className="container px-4 md:px-6 mx-auto">
            <div className="mx-auto max-w-3xl">
              <div className="flex items-center gap-3 mb-6">
                <Info className="h-6 w-6 text-[#2973B2]" />
                <h2 className="text-2xl font-bold tracking-tight">Methodology</h2>
              </div>

              <Alert className="mb-6 border-[#9ACBD0]">
                <Info className="h-4 w-4" />
                <AlertTitle>Data Collection</AlertTitle>
                <AlertDescription>
                  We collected 10,000 tweets mentioning BPJS Kesehatan from various regions in Indonesia.
                </AlertDescription>
              </Alert>

              <div className="space-y-6">
                <div>
                  <h3 className="font-semibold mb-2">Labeling Process</h3>
                  <p className="text-muted-foreground">
                    A team manually labeled 2,000 tweets for sentiment (positive, negative, neutral) and subtopics
                    (pelayanan, kecepatan, keramahan, kemudahan). An LSTM model was then trained to label the remaining
                    8,000 tweets.
                  </p>
                </div>

                <Separator className="bg-[#9ACBD0]/50" />

                <div>
                  <h3 className="font-semibold mb-2">Example Classifications</h3>
                  <div className="grid gap-4 md:grid-cols-2">
                    <Card className="bg-[#9ACBD0]/10 border-[#48A6A7]/30">
                      <CardHeader className="p-4">
                        <div className="flex items-center gap-2">
                          <ThumbsUp className="h-4 w-4 text-[#48A6A7]" />
                          <CardTitle className="text-sm font-medium">Positive Example</CardTitle>
                        </div>
                      </CardHeader>
                      <CardContent className="p-4 pt-0">
                        <p className="text-sm">&quot;Pegawai BPJS ramah, membantu proses cepat.&quot;</p>
                        <div className="flex gap-2 mt-2">
                          <Badge
                            variant="secondary"
                            className="text-xs bg-[#48A6A7]/10 text-[#48A6A7] border-[#48A6A7]/30"
                          >
                            keramahan
                          </Badge>
                          <Badge
                            variant="secondary"
                            className="text-xs bg-[#48A6A7]/10 text-[#48A6A7] border-[#48A6A7]/30"
                          >
                            kecepatan
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="bg-[#2973B2]/10 border-[#2973B2]/30">
                      <CardHeader className="p-4">
                        <div className="flex items-center gap-2">
                          <ThumbsDown className="h-4 w-4 text-[#2973B2]" />
                          <CardTitle className="text-sm font-medium">Negative Example</CardTitle>
                        </div>
                      </CardHeader>
                      <CardContent className="p-4 pt-0">
                        <p className="text-sm">&quot;Pelayanan BPJS lambat banget!&quot;</p>
                        <div className="flex gap-2 mt-2">
                          <Badge
                            variant="secondary"
                            className="text-xs bg-[#2973B2]/10 text-[#2973B2] border-[#2973B2]/30"
                          >
                            kecepatan
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>

                <Separator className="bg-[#9ACBD0]/50" />

                <div>
                  <h3 className="font-semibold mb-2">Model Performance</h3>
                  <p className="text-muted-foreground">
                    The LSTM model achieved 95% accuracy. However, errors occur due to sarcasm or ambiguous context.
                    Overfitting happens when the model memorizes phrases like &quot;BPJS lambat&quot; but fails on new
                    expressions. Underfitting occurs if the model is too simple to capture nuances.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Charts Section */}
        <section id="charts" className="py-12 md:py-16">
          <div className="container px-4 md:px-6 mx-auto">
            <div className="mb-8 text-center">
              <h2 className="text-2xl font-bold tracking-tight mb-2">Data Visualization</h2>
              <p className="text-muted-foreground">
                Interactive charts showing sentiment distribution and regional data
              </p>
            </div>

            {loading ? (
              <div className="flex flex-col items-center justify-center h-64 gap-4">
                <Loader2 className="h-8 w-8 animate-spin text-[#2973B2]" />
                <p>Loading data visualization...</p>
              </div>
            ) : (
              <div className="grid gap-6 md:grid-cols-2 justify-center">
                {/* Sentiment Distribution (Pie Chart with Percentage) */}
                <Card className="transition-all hover:shadow-md border-[#9ACBD0]/30">
                  <CardHeader>
                    <CardTitle>Sentiment Distribution</CardTitle>
                    <CardDescription>Breakdown of positive, negative, and neutral sentiments</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[300px]">
                      <ChartContainer config={{}}>
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={sentimentData}
                              cx="50%"
                              cy="50%"
                              outerRadius={80}
                              innerRadius={60}
                              paddingAngle={5}
                              dataKey="value"
                              label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                              labelLine={false}
                            >
                              {sentimentData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                              ))}
                            </Pie>
                            <Tooltip
                              formatter={(value, name) => [
                                `${value} (${((Number(value) / sentimentTotal) * 100).toFixed(1)}%)`,
                                name,
                              ]}
                            />
                            <Legend
                              layout="horizontal"
                              verticalAlign="bottom"
                              align="center"
                              wrapperStyle={{ paddingTop: "20px" }}
                            />
                          </PieChart>
                        </ResponsiveContainer>
                      </ChartContainer>
                    </div>
                  </CardContent>
                </Card>

                {/* Subtopics (Pie Chart with Percentage) */}
                <Card className="transition-all hover:shadow-md border-[#9ACBD0]/30">
                  <CardHeader>
                    <CardTitle>Topic Distribution</CardTitle>
                    <CardDescription>Frequency of discussion topics</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[300px]">
                      <ChartContainer config={{}}>
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={subtopicData}
                              cx="50%"
                              cy="50%"
                              outerRadius={80}
                              innerRadius={60}
                              paddingAngle={5}
                              dataKey="value"
                              label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                              labelLine={false}
                            >
                              {subtopicData.map((entry, index) => (
                                <Cell key={`cell-subtopic-${index}`} fill={COLORS[(index + 2) % COLORS.length]} />
                              ))}
                            </Pie>
                            <Tooltip
                              formatter={(value, name) => [
                                `${value} (${((Number(value) / subtopicTotal) * 100).toFixed(1)}%)`,
                                name,
                              ]}
                            />
                            <Legend
                              layout="horizontal"
                              verticalAlign="bottom"
                              align="center"
                              wrapperStyle={{ paddingTop: "20px" }}
                            />
                          </PieChart>
                        </ResponsiveContainer>
                      </ChartContainer>
                    </div>
                  </CardContent>
                </Card>

                {/* Tweets per Province (Bar Chart) */}
                {/* Tweets per Province (Enhanced Bar Chart) */}
                <Card className="col-span-2 transition-all hover:shadow-md border-[#9ACBD0]/30 mx-auto w-full max-w-5xl">
                  <CardHeader className="pb-2 text-center">
                    <CardTitle className="text-lg font-semibold text-gray-800">Regional Engagement</CardTitle>
                    <CardDescription className="text-sm text-gray-500">
                      {provinceData.length} Provinces with BPJS-related discussions
                    </CardDescription>
                  </CardHeader>

                  <CardContent className="p-6">
                    <div className="h-[500px] w-full mx-auto">
                      {provinceData.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart
                            data={[...provinceData].sort((a, b) => b.count - a.count).slice(0, 15)} // Show top 15 provinces for better readability
                            layout="vertical"
                            margin={{
                              top: 20,
                              right: 30,
                              left: 160,
                              bottom: 40, // Increased bottom margin for scroll notice
                            }}
                          >
                            {/* Custom Grid Lines */}
                            <CartesianGrid
                              stroke="#e2e8f0"
                              strokeDasharray="3 3"
                              horizontal={true}
                              strokeOpacity={0.5}
                            />

                            {/* X Axis with improved styling */}
                            <XAxis
                              type="number"
                              tick={{
                                fontSize: 11,
                                fill: "#64748b",
                                fontFamily: "Inter, sans-serif",
                              }}
                              axisLine={{ stroke: "#cbd5e1", strokeWidth: 1 }}
                              tickLine={{ stroke: "#e2e8f0" }}
                              tickMargin={10}
                              label={{
                                value: "Number of Tweets",
                                position: "insideBottomRight",
                                offset: -20,
                                fill: "#64748b",
                                fontSize: 12,
                              }}
                            />

                            {/* Y Axis with better formatting */}
                            <YAxis
                              dataKey="location"
                              type="category"
                              width={150}
                              tick={{
                                fontSize: 12,
                                fill: "#334155",
                                fontWeight: 500,
                                fontFamily: "Inter, sans-serif",
                              }}
                              axisLine={false}
                              tickLine={false}
                              tickMargin={10}
                              tickFormatter={(value) => (value.length > 18 ? `${value.substring(0, 16)}...` : value)}
                            />

                            {/* Enhanced Tooltip */}
                            <Tooltip
                              content={({ active, payload, label }) => {
                                if (active && payload && payload.length) {
                                  return (
                                    <div className="bg-white p-3 rounded-lg shadow-lg border border-gray-200">
                                      <p className="font-semibold text-gray-900">{label}</p>
                                      <p className="text-sm text-gray-700">
                                        <span className="text-[#2973B2] font-medium">{payload[0].value}</span> tweets
                                      </p>
                                      <p className="text-xs text-gray-500 mt-1">
                                        {((payload[0].payload.count / stats.totalTweets) * 100).toFixed(1)}% of total
                                      </p>
                                    </div>
                                  )
                                }
                                return null
                              }}
                              cursor={{
                                fill: "rgba(227, 235, 245, 0.5)",
                                stroke: "#cbd5e1",
                                strokeWidth: 1,
                              }}
                            />

                            {/* Gradient-filled Bars with animation */}
                            <Bar
                              dataKey="count"
                              radius={[0, 4, 4, 0]}
                              barSize={22}
                              animationDuration={1800}
                              animationEasing="ease-out"
                            >
                              {provinceData.map((entry, index) => (
                                <Cell
                                  key={`cell-${index}`}
                                  fill={`url(#provinceGradient${index})`}
                                  stroke={`hsl(213, 94%, ${75 - index * 1.2}%)`}
                                  strokeWidth={0.5}
                                />
                              ))}
                            </Bar>

                            {/* Gradient definitions */}
                            <defs>
                              {provinceData.map((entry, index) => (
                                <linearGradient
                                  key={`gradient-${index}`}
                                  id={`provinceGradient${index}`}
                                  x1="0"
                                  y1="0"
                                  x2="1"
                                  y2="0"
                                >
                                  <stop offset="0%" stopColor="#2973B2" stopOpacity={0.8} />
                                  <stop offset="100%" stopColor="#48A6A7" stopOpacity={0.8} />
                                </linearGradient>
                              ))}
                            </defs>

                            {/* Custom Legend */}
                            <Legend
                              verticalAlign="top"
                              height={40}
                              content={() => (
                                <div className="flex items-center justify-center gap-4 mt-2">
                                  <div className="flex items-center gap-2">
                                    <div className="w-4 h-4 rounded-sm bg-gradient-to-r from-[#2973B2] to-[#48A6A7]" />
                                    <span className="text-xs text-gray-600">Tweet Volume</span>
                                  </div>
                                  <div className="text-xs text-gray-400">
                                    Showing top 15 provinces (hover for details)
                                  </div>
                                </div>
                              )}
                            />
                          </BarChart>
                        </ResponsiveContainer>
                      ) : (
                        <div className="flex flex-col items-center justify-center h-full gap-3 text-gray-400">
                          <AlertCircle className="h-8 w-8 stroke-1" />
                          <p className="text-base font-medium">No province data available</p>
                        </div>
                      )}
                    </div>

                    {provinceData.length > 15 && (
                      <p className="text-xs text-center text-gray-500 mt-2">
                        Scroll horizontally to view more provinces (showing top 15 of {provinceData.length})
                      </p>
                    )}
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </section>

        {/* Contact Form */}
        <section id="form" className="py-20 md:py-24 bg-[#F2EFE7]/30">
          <div className="container px-4 md:px-6 mx-auto">
            <div className="mx-auto max-w-2xl">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold tracking-tight mb-2">Contact Our Team</h2>
                <p className="text-muted-foreground">Have questions or feedback? Send us a message.</p>
              </div>
              <Card className="transition-all hover:shadow-md mx-auto border-[#9ACBD0]/30">
                <CardContent className="pt-6">
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid gap-2">
                      <Label htmlFor="name">Name</Label>
                      <Input
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="Enter your name"
                        required
                        className="border-[#9ACBD0]/50 focus-visible:ring-[#2973B2]"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="Enter your email"
                        required
                        className="border-[#9ACBD0]/50 focus-visible:ring-[#2973B2]"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="category">Inquiry Type</Label>
                      <Select value={formData.category} onValueChange={handleSelectChange}>
                        <SelectTrigger className="border-[#9ACBD0]/50 focus-visible:ring-[#2973B2]">
                          <SelectValue placeholder="Select inquiry type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="general">General Inquiry</SelectItem>
                          <SelectItem value="support">Technical Support</SelectItem>
                          <SelectItem value="billing">Billing Question</SelectItem>
                          <SelectItem value="feedback">Feedback</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="message">Message</Label>
                      <Textarea
                        id="message"
                        name="message"
                        value={formData.message}
                        onChange={handleChange}
                        placeholder="Enter your message"
                        rows={5}
                        required
                        className="border-[#9ACBD0]/50 focus-visible:ring-[#2973B2]"
                      />
                    </div>
                    <Button type="submit" className="w-full bg-[#096B68] hover:bg-[#096B68] text-white font-bold py-2 px-4 border border-[#096B68] rounded text-center">
                      Submit Message
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}
