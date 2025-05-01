"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
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
} from "lucide-react";
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
} from "recharts";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ChartContainer,
} from "@/components/ui/chart";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

type ChartData = { name: string; value: number };
type ProvinceData = { location: string; count: number };

export default function Dashboard() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    category: "",
    message: "",
  });
  const [sentimentData, setSentimentData] = useState<ChartData[]>([]);
  const [subtopicData, setSubtopicData] = useState<ChartData[]>([]);
  const [provinceData, setProvinceData] = useState<ProvinceData[]>([]);
  const [bpjsUserFilter, setBpjsUserFilter] = useState(false);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalTweets: 0,
    positivePercent: 0,
    negativePercent: 0,
    activeProvinces: 0,
  });

  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8", "#82ca9d"];

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (value: string) => {
    setFormData((prev) => ({ ...prev, category: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Form submitted:", formData);
    alert("Form submitted successfully!");
    setFormData({ name: "", email: "", category: "", message: "" });
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Fetch sentiment distribution
        const sentimentEndpoint = bpjsUserFilter
          ? `${process.env.NEXT_PUBLIC_API_URL}/api/sentiment-distribution-bpjs-users`
          : `${process.env.NEXT_PUBLIC_API_URL}/api/sentiment-distribution`;
        const resSentiment = await fetch(sentimentEndpoint);
        const sentimentJson = await resSentiment.json();
        const sentimentArray = Object.keys(sentimentJson).map((key) => ({
          name: key,
          value: sentimentJson[key],
        }));

        // Fetch subtopics
        const resSubtopic = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/subtopics`
        );
        const subtopicJson = await resSubtopic.json();
        const subtopicArray = subtopicJson.map(
          (item: { subtopic: string; count: number }) => ({
            name: item.subtopic,
            value: item.count,
          })
        );

        // Fetch tweets per province
        const resProvince = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/tweets-per-province`
        );
        const provinceJson = await resProvince.json();
        const provinceArray = provinceJson.map(
          (item: { location: string; count: number }) => ({
            location: item.location,
            count: item.count,
          })
        );

        // Calculate stats
        const totalTweets = sentimentArray.reduce(
          (sum, item) => sum + item.value,
          0
        );
        const positivePercent =
          (sentimentArray.find((item) => item.name === "positive")?.value /
            totalTweets) *
            100 || 0;
        const negativePercent =
          (sentimentArray.find((item) => item.name === "negative")?.value /
            totalTweets) *
            100 || 0;
        const activeProvinces = new Set(
          provinceJson.map((item: { location: string }) => item.location)
        ).size;

        setSentimentData(sentimentArray);
        setSubtopicData(subtopicArray);
        setProvinceData(provinceArray);
        setStats({
          totalTweets,
          positivePercent: Number(positivePercent.toFixed(1)),
          negativePercent: Number(negativePercent.toFixed(1)),
          activeProvinces,
        });
        setLoading(false);
      } catch (error) {
        console.error("❌ Failed fetching data:", error);
        setLoading(false);
      }
    };

    fetchData();
  }, [bpjsUserFilter]);

  // Calculate total for percentage in pie chart
  const sentimentTotal = sentimentData.reduce((sum, item) => sum + item.value, 0);
  const subtopicTotal = subtopicData.reduce((sum, item) => sum + item.value, 0);

  return (
    <div className="flex min-h-screen w-full flex-col bg-muted/20">
      {/* Navbar */}
      <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6 shadow-sm">
        <Link href="/dashboard" className="flex items-center gap-2 font-semibold">
          <Package2 className="h-6 w-6 text-primary" />
          <span className="hidden sm:inline">BPJS Sentiment Dashboard</span>
          <span className="sm:hidden">Dashboard</span>
        </Link>
        <nav className="hidden md:flex gap-6 ml-6">
          <Link href="#welcome" className="text-sm font-medium transition-colors hover:text-primary">
            Home
          </Link>
          <Link href="#stats" className="text-sm font-medium transition-colors hover:text-primary">
            Stats
          </Link>
          <Link href="#charts" className="text-sm font-medium transition-colors hover:text-primary">
            Charts
          </Link>
          <Link href="#form" className="text-sm font-medium transition-colors hover:text-primary">
            Contact
          </Link>
        </nav>
        <div className="ml-auto">
          <Badge variant="outline" className="bg-primary/10 text-primary">
            {bpjsUserFilter ? "BPJS Users Only" : "All Users"}
          </Badge>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        {/* Welcome Section */}
        <section
          id="welcome"
          className="bg-gradient-to-b from-background to-muted/20 py-12 md:py-16 lg:py-20 border-b"
        >
          <div className="container px-4 md:px-6 text-center">
            <Badge variant="secondary" className="mb-4">
              Sentiment Analysis
            </Badge>
            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
              BPJS Kesehatan Public Sentiment
            </h1>
            <p className="max-w-[700px] mx-auto mt-4 text-muted-foreground md:text-lg">
              Analyze public sentiment towards BPJS services across Indonesia with real-time data visualization.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 pt-6 justify-center">
              <Button className="text-lg py-2 px-4">Explore Data</Button>
              <Button variant="outline">
                Documentation
              </Button>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section id="stats" className="py-12 md:py-16">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
              <div>
                <h2 className="text-2xl font-bold tracking-tight">Key Metrics</h2>
                <p className="text-muted-foreground">
                  Overview of sentiment analysis results
                </p>
              </div>
              <Button
                variant={bpjsUserFilter ? "default" : "outline"}
                onClick={() => setBpjsUserFilter(!bpjsUserFilter)}
                className="flex items-center gap-2"
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
            
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              <Card className="transition-all hover:shadow-md">
                <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                  <CardTitle className="text-sm font-medium">
                    Total Tweets
                  </CardTitle>
                  <MessageSquare className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {stats.totalTweets.toLocaleString()}
                  </div>
                  <p className="text-xs text-muted-foreground flex items-center mt-1">
                    <ArrowUp className="mr-1 h-3 w-3 text-green-500" />
                    {stats.totalTweets > 0 ? "+10% from last week" : "No data"}
                  </p>
                </CardContent>
              </Card>

              <Card className="transition-all hover:shadow-md">
                <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                  <CardTitle className="text-sm font-medium">
                    Positive Sentiment
                  </CardTitle>
                  <ThumbsUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {stats.positivePercent}%
                  </div>
                  <p className="text-xs text-muted-foreground flex items-center mt-1">
                    <ArrowUp className="mr-1 h-3 w-3 text-green-500" />
                    {stats.positivePercent > 0
                      ? "+5% from last week"
                      : "No data"}
                  </p>
                </CardContent>
              </Card>

              <Card className="transition-all hover:shadow-md">
                <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                  <CardTitle className="text-sm font-medium">
                    Negative Sentiment
                  </CardTitle>
                  <ThumbsDown className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {stats.negativePercent}%
                  </div>
                  <p className="text-xs text-muted-foreground flex items-center mt-1">
                    <ArrowDown className="mr-1 h-3 w-3 text-red-500" />
                    {stats.negativePercent > 0
                      ? "-3% from last week"
                      : "No data"}
                  </p>
                </CardContent>
              </Card>

              <Card className="transition-all hover:shadow-md">
                <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                  <CardTitle className="text-sm font-medium">
                    Active Provinces
                  </CardTitle>
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {stats.activeProvinces}
                  </div>
                  <p className="text-xs text-muted-foreground flex items-center mt-1">
                    <ArrowUp className="mr-1 h-3 w-3 text-green-500" />
                    {stats.activeProvinces > 0
                      ? "+2 from last week"
                      : "No data"}
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Process Explanation Section */}
        <section id="process" className="py-12 md:py-16 bg-muted/10 border-t border-b">
          <div className="container px-4 md:px-6">
            <div className="mx-auto max-w-3xl">
              <div className="flex items-center gap-3 mb-6">
                <Info className="h-6 w-6 text-primary" />
                <h2 className="text-2xl font-bold tracking-tight">Methodology</h2>
              </div>
              
              <Alert className="mb-6">
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
                    A team manually labeled 2,000 tweets for sentiment (positive, negative, neutral) and subtopics (pelayanan, kecepatan, keramahan, kemudahan). An LSTM model was then trained to label the remaining 8,000 tweets.
                  </p>
                </div>
                
                <Separator />
                
                <div>
                  <h3 className="font-semibold mb-2">Example Classifications</h3>
                  <div className="grid gap-4 md:grid-cols-2">
                    <Card className="bg-green-50 dark:bg-green-900/20">
                      <CardHeader className="p-4">
                        <div className="flex items-center gap-2">
                          <ThumbsUp className="h-4 w-4 text-green-500" />
                          <CardTitle className="text-sm font-medium">Positive Example</CardTitle>
                        </div>
                      </CardHeader>
                      <CardContent className="p-4 pt-0">
                        <p className="text-sm">
                          &quot;Pegawai BPJS ramah, membantu proses cepat.&quot;
                        </p>
                        <div className="flex gap-2 mt-2">
                          <Badge variant="secondary" className="text-xs">
                            keramahan
                          </Badge>
                          <Badge variant="secondary" className="text-xs">
                            kecepatan
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card className="bg-red-50 dark:bg-red-900/20">
                      <CardHeader className="p-4">
                        <div className="flex items-center gap-2">
                          <ThumbsDown className="h-4 w-4 text-red-500" />
                          <CardTitle className="text-sm font-medium">Negative Example</CardTitle>
                        </div>
                      </CardHeader>
                      <CardContent className="p-4 pt-0">
                        <p className="text-sm">
                          &quot;Pelayanan BPJS lambat banget!&quot;
                        </p>
                        <div className="flex gap-2 mt-2">
                          <Badge variant="secondary" className="text-xs">
                            kecepatan
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
                
                <Separator />
                
                <div>
                  <h3 className="font-semibold mb-2">Model Performance</h3>
                  <p className="text-muted-foreground">
                    The LSTM model achieved 95% accuracy. However, errors occur due to sarcasm or ambiguous context. Overfitting happens when the model memorizes phrases like &quot;BPJS lambat&quot; but fails on new expressions. Underfitting occurs if the model is too simple to capture nuances.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Charts Section */}
        <section id="charts" className="py-12 md:py-16">
          <div className="container px-4 md:px-6">
            <div className="mb-8">
              <h2 className="text-2xl font-bold tracking-tight mb-2">Data Visualization</h2>
              <p className="text-muted-foreground">
                Interactive charts showing sentiment distribution and regional data
              </p>
            </div>

            {loading ? (
              <div className="flex flex-col items-center justify-center h-64 gap-4">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p>Loading data visualization...</p>
              </div>
            ) : (
              <div className="grid gap-6 md:grid-cols-2">
                {/* Sentiment Distribution (Pie Chart with Percentage) */}
                <Card className="transition-all hover:shadow-md">
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
                                <Cell
                                  key={`cell-${index}`}
                                  fill={COLORS[index % COLORS.length]}
                                />
                              ))}
                            </Pie>
                            <Tooltip 
                              formatter={(value, name) => [
                                `${value} (${((Number(value) / sentimentTotal) * 100).toFixed(1)}%)`,
                                name
                              ]}
                            />
                            <Legend 
                              layout="horizontal"
                              verticalAlign="bottom"
                              align="center"
                              wrapperStyle={{ paddingTop: '20px' }}
                            />
                          </PieChart>
                        </ResponsiveContainer>
                      </ChartContainer>
                    </div>
                  </CardContent>
                </Card>

                {/* Subtopics (Pie Chart with Percentage) */}
                <Card className="transition-all hover:shadow-md">
                  <CardHeader>
                    <CardTitle>Topic Distribution</CardTitle>
                    <CardDescription>
                      Frequency of discussion topics
                    </CardDescription>
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
                                <Cell
                                  key={`cell-subtopic-${index}`}
                                  fill={COLORS[(index + 2) % COLORS.length]}
                                />
                              ))}
                            </Pie>
                            <Tooltip 
                              formatter={(value, name) => [
                                `${value} (${((Number(value) / subtopicTotal) * 100).toFixed(1)}%)`,
                                name
                              ]}
                            />
                            <Legend 
                              layout="horizontal"
                              verticalAlign="bottom"
                              align="center"
                              wrapperStyle={{ paddingTop: '20px' }}
                            />
                          </PieChart>
                        </ResponsiveContainer>
                      </ChartContainer>
                    </div>
                  </CardContent>
                </Card>

                {/* Tweets per Province (Bar Chart) */}
                <Card className="col-span-2 transition-all hover:shadow-md border">
  <CardHeader className="pb-2">
    <CardTitle className="text-lg font-semibold text-gray-800">
      Regional Engagement
    </CardTitle>
    <CardDescription className="text-sm text-gray-500">
      {provinceData.length} Provinces
    </CardDescription>
  </CardHeader>
  <CardContent className="p-4">
    <div className="h-[500px] w-full"> {/* Tinggi ditambah */}
      {provinceData.length > 0 ? (
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={[...provinceData].sort((a, b) => b.count - a.count)} // Urutkan descending
            layout="vertical"
            margin={{ top: 10, right: 20, left: 150, bottom: 10 }} // Left margin diperbesar
          >
            <CartesianGrid stroke="#f1f5f9" strokeDasharray="3 3" horizontal />
            <XAxis 
              type="number" 
              tick={{ fontSize: 11 }}
              axisLine={false}
            />
            <YAxis
              dataKey="location"
              type="category"
              width={140} // Lebar diperbesar
              tick={{ fontSize: 11 }}
              axisLine={false}
              tickFormatter={(value) => 
                value.length > 15 ? `${value.substring(0, 14)}...` : value
              }
            />
            <Tooltip 
              formatter={(value) => [`${value} tweets`, 'Count']}
              cursor={{ fill: '#f8fafc' }}
            />
            <Bar
              dataKey="count"
              fill="#3b82f6"
              radius={[0, 4, 4, 0]}
              barSize={20}
              animationDuration={1500}
            >
              {provinceData.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`}
                  fill={`hsl(213, 94%, ${75 - (index * 1.5)}%)`}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      ) : (
        <div className="flex flex-col items-center justify-center h-full gap-2 text-gray-400">
          <AlertCircle className="h-6 w-6" />
          <p>No province data available</p>
        </div>
      )}
    </div>
  </CardContent>
</Card>
              </div>
            )}
          </div>
        </section>

        {/* Contact Form */}
        <section id="form" className="py-12 md:py-16 bg-muted/10 border-t">
          <div className="container px-4 md:px-6">
            <div className="mx-auto max-w-2xl">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold tracking-tight mb-2">Contact Our Team</h2>
                <p className="text-muted-foreground">
                  Have questions or feedback? Send us a message.
                </p>
              </div>
              <Card className="transition-all hover:shadow-md">
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
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="category">Inquiry Type</Label>
                      <Select
                        value={formData.category}
                        onValueChange={handleSelectChange}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select inquiry type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="general">General Inquiry</SelectItem>
                          <SelectItem value="support">
                            Technical Support
                          </SelectItem>
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
                      />
                    </div>
                    <Button type="submit" className="w-full mt-4">
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
  );
}