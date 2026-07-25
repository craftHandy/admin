import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Package,
  ShoppingCart,
  DollarSign,
  Users,
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

// ─── Static Data ────────────────────────────────────────────────────────────

const revenueData = [
  { month: "Jan", revenue: 45000, orders: 120 },
  { month: "Feb", revenue: 52000, orders: 145 },
  { month: "Mar", revenue: 48000, orders: 132 },
  { month: "Apr", revenue: 61000, orders: 168 },
  { month: "May", revenue: 55000, orders: 155 },
  { month: "Jun", revenue: 67000, orders: 180 },
  { month: "Jul", revenue: 72000, orders: 195 },
  { month: "Aug", revenue: 68000, orders: 178 },
  { month: "Sep", revenue: 75000, orders: 210 },
  { month: "Oct", revenue: 82000, orders: 225 },
  { month: "Nov", revenue: 78000, orders: 200 },
  { month: "Dec", revenue: 95000, orders: 260 },
];

const orderStatusData = [
  { name: "Delivered", value: 420, color: "#22c55e" },
  { name: "Processing", value: 85, color: "#3b82f6" },
  { name: "Shipped", value: 62, color: "#f59e0b" },
  { name: "Cancelled", value: 28, color: "#ef4444" },
];

const topProducts = [
  { name: "Handwoven Silk Saree", sales: 234, revenue: 468000 },
  { name: "Brass Decorative Vase", sales: 189, revenue: 283500 },
  { name: "Wooden Carved Elephant", sales: 156, revenue: 187200 },
  { name: "Terracotta Tea Set", sales: 142, revenue: 213000 },
  { name: "Bamboo Wall Hanging", sales: 128, revenue: 115200 },
];

const recentOrders = [
  {
    id: "#ORD-7841",
    customer: "Anita Sharma",
    email: "anita.sharma@email.com",
    product: "Handwoven Silk Saree",
    amount: 2499,
    status: "Delivered",
    date: "2026-07-24",
  },
  {
    id: "#ORD-7840",
    customer: "Rajesh Kumar",
    email: "rajesh.k@email.com",
    product: "Brass Decorative Vase",
    amount: 1899,
    status: "Processing",
    date: "2026-07-24",
  },
  {
    id: "#ORD-7839",
    customer: "Priya Patel",
    email: "priya.p@email.com",
    product: "Wooden Carved Elephant",
    amount: 1499,
    status: "Shipped",
    date: "2026-07-23",
  },
  {
    id: "#ORD-7838",
    customer: "Vikram Singh",
    email: "vikram.s@email.com",
    product: "Terracotta Tea Set",
    amount: 1799,
    status: "Delivered",
    date: "2026-07-23",
  },
  {
    id: "#ORD-7837",
    customer: "Meera Joshi",
    email: "meera.j@email.com",
    product: "Bamboo Wall Hanging",
    amount: 899,
    status: "Cancelled",
    date: "2026-07-22",
  },
  {
    id: "#ORD-7836",
    customer: "Arun Verma",
    email: "arun.v@email.com",
    product: "Handwoven Silk Saree",
    amount: 2499,
    status: "Processing",
    date: "2026-07-22",
  },
  {
    id: "#ORD-7835",
    customer: "Sunita Reddy",
    email: "sunita.r@email.com",
    product: "Brass Decorative Vase",
    amount: 1899,
    status: "Delivered",
    date: "2026-07-21",
  },
];

const statusColorMap: Record<string, "success" | "warning" | "default" | "destructive" | "secondary" | "outline"> = {
  Delivered: "success",
  Processing: "warning",
  Shipped: "default",
  Cancelled: "destructive",
};

// ─── Stat Card ──────────────────────────────────────────────────────────────

interface StatCardProps {
  title: string;
  value: string;
  change: string;
  trend: "up" | "down";
  icon: React.ReactNode;
}

function StatCard({ title, value, change, trend, icon }: StatCardProps) {
  const TrendIcon = trend === "up" ? TrendingUp : TrendingDown;
  const ArrowIcon = trend === "up" ? ArrowUpRight : ArrowDownRight;
  const trendColor = trend === "up" ? "text-emerald-600" : "text-red-600";
  const trendBg = trend === "up" ? "bg-emerald-50 dark:bg-emerald-950/30" : "bg-red-50 dark:bg-red-950/30";

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-3xl font-bold tracking-tight">{value}</p>
            <div className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${trendBg} ${trendColor}`}>
              <TrendIcon className="h-3 w-3" />
              <span>{change}</span>
              <ArrowIcon className="h-3 w-3" />
            </div>
          </div>
          <div className="rounded-lg bg-primary/10 p-3 text-primary">
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Custom Tooltip ─────────────────────────────────────────────────────────

function ChartTooltip({ active, payload, label }: any) {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-lg border bg-background p-3 shadow-md">
        <p className="mb-1 text-sm font-medium">{label}</p>
        {payload.map((entry: any, index: number) => (
          <p key={index} className="text-sm" style={{ color: entry.color }}>
            {entry.name}: <span className="font-semibold">{entry.value.toLocaleString()}</span>
          </p>
        ))}
      </div>
    );
  }
  return null;
}

// ─── Dashboard Component ────────────────────────────────────────────────────

const Dashboard = () => {
  const totalRevenue = revenueData.reduce((sum, d) => sum + d.revenue, 0);
  const totalOrders = revenueData.reduce((sum, d) => sum + d.orders, 0);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Overview of your handicraft store performance
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Revenue"
          value={`₹${(totalRevenue / 100000).toFixed(1)}L`}
          change="12.5% from last month"
          trend="up"
          icon={<DollarSign className="h-5 w-5" />}
        />
        <StatCard
          title="Total Orders"
          value={totalOrders.toLocaleString()}
          change="8.2% from last month"
          trend="up"
          icon={<ShoppingCart className="h-5 w-5" />}
        />
        <StatCard
          title="Total Products"
          value="1,247"
          change="3.1% from last month"
          trend="up"
          icon={<Package className="h-5 w-5" />}
        />
        <StatCard
          title="Active Customers"
          value="3,842"
          change="2.4% from last month"
          trend="down"
          icon={<Users className="h-5 w-5" />}
        />
      </div>

      {/* Charts Row */}
      <div className="grid gap-4 lg:grid-cols-7">
        {/* Revenue Line Chart */}
        <Card className="lg:col-span-4">
          <CardHeader>
            <CardTitle>Revenue Overview</CardTitle>
            <CardDescription>Monthly revenue and order trends for 2026</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={revenueData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis
                    dataKey="month"
                    tick={{ fontSize: 12 }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    yAxisId="left"
                    tick={{ fontSize: 12 }}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}K`}
                  />
                  <YAxis
                    yAxisId="right"
                    orientation="right"
                    tick={{ fontSize: 12 }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <Tooltip content={<ChartTooltip />} />
                  <Line
                    yAxisId="left"
                    type="monotone"
                    dataKey="revenue"
                    name="Revenue"
                    stroke="hsl(var(--chart-1))"
                    strokeWidth={2}
                    dot={{ r: 3 }}
                    activeDot={{ r: 5 }}
                  />
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="orders"
                    name="Orders"
                    stroke="hsl(var(--chart-2))"
                    strokeWidth={2}
                    dot={{ r: 3 }}
                    activeDot={{ r: 5 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Order Status Pie Chart */}
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Order Status</CardTitle>
            <CardDescription>Distribution of order statuses</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={orderStatusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {orderStatusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip content={<ChartTooltip />} />
                  <Legend
                    verticalAlign="bottom"
                    height={36}
                    formatter={(value) => (
                      <span className="text-sm text-muted-foreground">{value}</span>
                    )}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bottom Row: Top Products + Recent Orders */}
      <div className="grid gap-4 lg:grid-cols-7">
        {/* Top Products Bar Chart */}
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Top Selling Products</CardTitle>
            <CardDescription>Best performing products by sales</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={topProducts}
                  layout="vertical"
                  margin={{ left: 20 }}
                >
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" horizontal={false} />
                  <XAxis type="number" tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
                  <YAxis
                    type="category"
                    dataKey="name"
                    tick={{ fontSize: 11 }}
                    tickLine={false}
                    axisLine={false}
                    width={140}
                  />
                  <Tooltip content={<ChartTooltip />} />
                  <Bar dataKey="sales" name="Sales" fill="hsl(var(--chart-3))" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Recent Orders Table */}
        <Card className="lg:col-span-4">
          <CardHeader>
            <CardTitle>Recent Orders</CardTitle>
            <CardDescription>Latest orders from your customers</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Product</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentOrders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell className="font-medium">{order.id}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Avatar className="h-7 w-7">
                          <AvatarFallback className="text-[10px]">
                            {order.customer
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-sm font-medium">{order.customer}</p>
                          <p className="text-xs text-muted-foreground">{order.email}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="max-w-[160px] truncate">
                      {order.product}
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      ₹{order.amount.toLocaleString()}
                    </TableCell>
                    <TableCell>
                      <Badge variant={statusColorMap[order.status] || "outline"}>
                        {order.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;