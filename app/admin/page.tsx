'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { BarChart3, Tag, ShoppingBag, TrendingUp, Gift, RefreshCw, CheckCircle2, XCircle, List } from 'lucide-react';
import Link from 'next/link';
import type { Order } from '@/types';

interface StatsData {
  currentDiscount: {
    code: string;
    percentage: number;
    isUsed: boolean;
    createdAt: string;
    usedAt?: string;
  } | null;
  orderCount: number;
  n: number;
  nextDiscountAt: number | null;
  totalDiscountsUsed: number;
  totalOrders: number;
  ordersWithDiscount: number;
}

interface OrdersData {
  orders: Order[];
  statistics: {
    totalItemsPurchased: number;
    totalPurchaseAmount: number;
    discountCodesUsed: string[];
    totalDiscountAmount: number;
  };
}

export default function AdminPage() {
  const [stats, setStats] = useState<StatsData | null>(null);
  const [ordersData, setOrdersData] = useState<OrdersData | null>(null);
  const [loading, setLoading] = useState(true);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [showCreateDiscountModal, setShowCreateDiscountModal] = useState(false);
  const [showResultModal, setShowResultModal] = useState<{
    open: boolean;
    type: 'success' | 'error';
    title: string;
    message: string;
    discountCode?: string;
  }>({
    open: false,
    type: 'success',
    title: '',
    message: '',
  });

  const fetchStats = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/stats');
      const data = await response.json();
      if (data.success && data.data) {
        setStats(data.data);
      } else {
        setShowResultModal({
          open: true,
          type: 'error',
          title: 'Error',
          message: data.error?.message || 'Failed to fetch stats',
        });
      }
    } catch (error) {
      setShowResultModal({
        open: true,
        type: 'error',
        title: 'Error',
        message: 'Failed to fetch stats',
      });
      console.error('Failed to fetch stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchOrders = async () => {
    try {
      setOrdersLoading(true);
      const response = await fetch('/api/admin/orders');
      const data = await response.json();
      if (data.success && data.data) {
        setOrdersData(data.data);
      } else {
        console.error('Failed to fetch orders:', data.error);
      }
    } catch (error) {
      console.error('Failed to fetch orders:', error);
    } finally {
      setOrdersLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
    fetchOrders();
  }, []);

  const handleGenerateDiscount = async () => {
    try {
      setGenerating(true);
      const response = await fetch('/api/admin/discount/generate', {
        method: 'POST',
      });
      const data = await response.json();
      
      if (data.success && data.data) {
        setShowCreateDiscountModal(false);
        setShowResultModal({
          open: true,
          type: 'success',
          title: 'Discount Code Generated',
          message: 'A new discount code has been generated successfully!',
          discountCode: data.data.code,
        });
        // Refresh stats after generating
        await fetchStats();
      } else {
        setShowResultModal({
          open: true,
          type: 'error',
          title: 'Error',
          message: data.error?.message || 'Failed to generate discount code',
        });
      }
    } catch (error) {
      setShowResultModal({
        open: true,
        type: 'error',
        title: 'Error',
        message: 'Failed to generate discount code',
      });
      console.error('Failed to generate discount:', error);
    } finally {
      setGenerating(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-sm text-muted-foreground">Loading admin dashboard...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-1 text-gray-900">Admin Dashboard</h1>
            <p className="text-sm text-gray-600">Manage your store statistics and discount codes</p>
          </div>
          <Link href="/">
            <Button variant="outline" size="sm">
              Back to Store
            </Button>
          </Link>
        </div>


        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {/* Total Orders */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Total Orders</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <ShoppingBag className="h-5 w-5 text-blue-600" />
                <span className="text-2xl font-bold text-gray-900">{stats?.totalOrders || 0}</span>
              </div>
            </CardContent>
          </Card>

          {/* Orders with Discount */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Orders with Discount</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Tag className="h-5 w-5 text-purple-600" />
                <span className="text-2xl font-bold text-gray-900">{stats?.ordersWithDiscount || 0}</span>
              </div>
            </CardContent>
          </Card>

          {/* Discount Usage Rate */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Discount Usage Rate</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-green-600" />
                <span className="text-2xl font-bold text-gray-900">
                  {stats?.totalOrders
                    ? Math.round((stats.ordersWithDiscount / stats.totalOrders) * 100)
                    : 0}
                  %
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Next Discount At */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Next Discount In</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Gift className="h-5 w-5 text-orange-600" />
                <span className="text-2xl font-bold text-gray-900">
                  {stats?.nextDiscountAt !== null && stats?.nextDiscountAt !== undefined ? `${stats.nextDiscountAt} orders` : 'Available'}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Discount Code Management */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Tag className="h-5 w-5" />
                Discount Code Management
              </CardTitle>
              <CardDescription>
                Manually generate new discount codes. A discount code is also generated automatically every {stats?.n || 3} orders.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {stats?.currentDiscount ? (
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">Current Discount Code:</span>
                    <span
                      className={`px-2 py-1 rounded text-xs font-semibold ${
                        stats.currentDiscount.isUsed
                          ? 'bg-red-100 text-red-800'
                          : 'bg-green-100 text-green-800'
                      }`}
                    >
                      {stats.currentDiscount.isUsed ? 'Used' : 'Active'}
                    </span>
                  </div>
                  <div className="bg-white border-2 border-blue-200 rounded-md p-3 mb-2">
                    <p className="text-2xl font-bold text-blue-700 text-center">
                      {stats.currentDiscount.code}
                    </p>
                  </div>
                  <div className="text-xs text-gray-600 space-y-1">
                    <p>Percentage: {stats.currentDiscount.percentage}%</p>
                    <p>Created: {new Date(stats.currentDiscount.createdAt).toLocaleString()}</p>
                    {stats.currentDiscount.usedAt && (
                      <p>Used: {new Date(stats.currentDiscount.usedAt).toLocaleString()}</p>
                    )}
                  </div>
                </div>
              ) : (
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-center">
                  <p className="text-sm text-gray-600">No active discount code</p>
                </div>
              )}

              <Button
                onClick={() => setShowCreateDiscountModal(true)}
                className="w-full"
                size="lg"
              >
                <Gift className="h-4 w-4" />
                Create Discount Code
              </Button>
            </CardContent>
          </Card>

          {/* Statistics Overview */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Statistics Overview
              </CardTitle>
              <CardDescription>
                Detailed statistics about orders and discounts
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex justify-between items-center pb-2 border-b">
                  <span className="text-sm text-gray-600">Total Orders</span>
                  <span className="text-lg font-semibold text-gray-900">{stats?.totalOrders || 0}</span>
                </div>
                <div className="flex justify-between items-center pb-2 border-b">
                  <span className="text-sm text-gray-600">Orders with Discount</span>
                  <span className="text-lg font-semibold text-gray-900">
                    {stats?.ordersWithDiscount || 0}
                  </span>
                </div>
                <div className="flex justify-between items-center pb-2 border-b">
                  <span className="text-sm text-gray-600">Total Discounts Used</span>
                  <span className="text-lg font-semibold text-gray-900">
                    {stats?.totalDiscountsUsed || 0}
                  </span>
                </div>
                <div className="flex justify-between items-center pb-2 border-b">
                  <span className="text-sm text-gray-600">Discount Frequency (N)</span>
                  <span className="text-lg font-semibold text-gray-900">
                    Every {stats?.n || 3} orders
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Orders Until Next Discount</span>
                  <span className="text-lg font-semibold text-gray-900">
                    {stats?.nextDiscountAt !== null && stats?.nextDiscountAt !== undefined ? stats.nextDiscountAt : 'Available now'}
                  </span>
                </div>
              </div>

              <Button
                onClick={fetchStats}
                disabled={loading}
                variant="outline"
                className="w-full mt-4"
              >
                <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                Refresh Stats
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Orders Table */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <List className="h-5 w-5" />
                  Orders Overview
                </CardTitle>
                <CardDescription>
                  Complete list of all orders with purchase details and discount information
                </CardDescription>
              </div>
              <Button
                onClick={fetchOrders}
                disabled={ordersLoading}
                variant="outline"
                size="sm"
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${ordersLoading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {ordersLoading ? (
              <div className="text-center py-8 text-sm text-gray-600">Loading orders...</div>
            ) : ordersData ? (
              <div className="space-y-6">
                {/* Summary Statistics */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-lg">
                  <div>
                    <p className="text-xs text-gray-600 mb-1">Total Items Purchased</p>
                    <p className="text-2xl font-bold text-gray-900">{ordersData.statistics.totalItemsPurchased}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 mb-1">Total Purchase Amount</p>
                    <p className="text-2xl font-bold text-gray-900">${ordersData.statistics.totalPurchaseAmount.toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 mb-1">Total Discount Amount</p>
                    <p className="text-2xl font-bold text-green-600">${ordersData.statistics.totalDiscountAmount.toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 mb-1">Discount Codes Used</p>
                    <p className="text-2xl font-bold text-purple-600">{ordersData.statistics.discountCodesUsed.length}</p>
                  </div>
                </div>

                {/* Discount Codes List */}
                {ordersData.statistics.discountCodesUsed.length > 0 && (
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <p className="text-sm font-semibold text-gray-700 mb-2">Discount Codes Used:</p>
                    <div className="flex flex-wrap gap-2">
                      {ordersData.statistics.discountCodesUsed.map((code, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-white border border-blue-200 rounded-md text-sm font-mono font-semibold text-blue-700"
                        >
                          {code}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Orders Table */}
                {ordersData.orders.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="border-b border-gray-200 bg-gray-50">
                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Order ID</th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Items</th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Total Amount</th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Discount Code</th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Discount Amount</th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Date</th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {ordersData.orders.map((order) => {
                          const itemCount = order.items.reduce((sum, item) => sum + item.quantity, 0);
                          return (
                            <tr key={order.id} className="border-b border-gray-100 hover:bg-gray-50">
                              <td className="px-4 py-3 text-sm font-mono text-gray-900">{order.id}</td>
                              <td className="px-4 py-3 text-sm text-gray-700">{itemCount}</td>
                              <td className="px-4 py-3 text-sm font-semibold text-gray-900">${order.total.toFixed(2)}</td>
                              <td className="px-4 py-3 text-sm">
                                {order.discountCode ? (
                                  <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded text-xs font-mono font-semibold">
                                    {order.discountCode}
                                  </span>
                                ) : (
                                  <span className="text-gray-400">—</span>
                                )}
                              </td>
                              <td className="px-4 py-3 text-sm">
                                {order.discountAmount ? (
                                  <span className="text-green-600 font-semibold">-${order.discountAmount.toFixed(2)}</span>
                                ) : (
                                  <span className="text-gray-400">—</span>
                                )}
                              </td>
                              <td className="px-4 py-3 text-sm text-gray-600">
                                {new Date(order.createdAt).toLocaleDateString()}
                              </td>
                              <td className="px-4 py-3 text-sm">
                                <span
                                  className={`px-2 py-1 rounded text-xs font-semibold ${
                                    order.status === 'completed'
                                      ? 'bg-green-100 text-green-800'
                                      : order.status === 'processing'
                                      ? 'bg-blue-100 text-blue-800'
                                      : order.status === 'failed'
                                      ? 'bg-red-100 text-red-800'
                                      : 'bg-yellow-100 text-yellow-800'
                                  }`}
                                >
                                  {order.status}
                                </span>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-8 text-sm text-gray-600">No orders found</div>
                )}
              </div>
            ) : (
              <div className="text-center py-8 text-sm text-gray-600">No orders data available</div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Create Discount Code Modal */}
      <Dialog open={showCreateDiscountModal} onOpenChange={setShowCreateDiscountModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Discount Code</DialogTitle>
            <DialogDescription>
              Are you sure you want to generate a new discount code? This will replace any existing active discount code.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowCreateDiscountModal(false)}
              disabled={generating}
            >
              Cancel
            </Button>
            <Button
              onClick={handleGenerateDiscount}
              disabled={generating}
              variant="default"
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              {generating ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Gift className="h-4 w-4 mr-2" />
                  Generate Code
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Result Modal */}
      <Dialog open={showResultModal.open} onOpenChange={(open) => setShowResultModal({ ...showResultModal, open })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {showResultModal.type === 'success' ? (
                <CheckCircle2 className="h-5 w-5 text-green-600" />
              ) : (
                <XCircle className="h-5 w-5 text-red-600" />
              )}
              {showResultModal.title}
            </DialogTitle>
            <DialogDescription>
              {showResultModal.message}
            </DialogDescription>
          </DialogHeader>
          {showResultModal.type === 'success' && showResultModal.discountCode && (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <p className="text-sm font-medium text-gray-700 mb-2">Your discount code:</p>
              <div className="bg-white border-2 border-blue-200 rounded-md p-3">
                <p className="text-2xl font-bold text-blue-700 text-center">
                  {showResultModal.discountCode}
                </p>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button onClick={() => setShowResultModal({ ...showResultModal, open: false })}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
