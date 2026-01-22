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
import {  RefreshCw, CheckCircle2, XCircle, List, Trash2, AlertTriangle } from 'lucide-react';
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
    totalOrders: number;
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
  const [resetting, setResetting] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);
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


  const handleResetStore = async () => {
    try {
      setResetting(true);
      const response = await fetch('/api/admin/reset', {
        method: 'POST',
      });
      const data = await response.json();
      
      if (data.success) {
        setShowResetModal(false);
        setShowResultModal({
          open: true,
          type: 'success',
          title: 'Store Reset Successfully',
          message: data.data?.message || 'All orders, carts, and discount codes have been cleared. Products remain unchanged.',
        });
        // Refresh stats and orders after reset
        await fetchStats();
        await fetchOrders();
      } else {
        setShowResultModal({
          open: true,
          type: 'error',
          title: 'Error',
          message: data.error?.message || 'Failed to reset store',
        });
      }
    } catch (error) {
      setShowResultModal({
        open: true,
        type: 'error',
        title: 'Error',
        message: 'Failed to reset store',
      });
      console.error('Failed to reset store:', error);
    } finally {
      setResetting(false);
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
          <div className="flex items-center gap-2">
            <Button
              variant="destructive"
              size="sm"
              onClick={() => setShowResetModal(true)}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Reset Store
            </Button>
            <Link href="/">
              <Button variant="outline" size="sm">
                Back to Store
              </Button>
            </Link>
          </div>
        </div>
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
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4 p-4 bg-gray-50 rounded-lg">
                  <div>
                    <p className="text-xs text-gray-600 mb-1">Total Orders</p>
                    <p className="text-2xl font-bold text-gray-900">{ordersData.statistics.totalOrders}</p>
                  </div>
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

      {/* Result Modal */}
      <Dialog open={showResultModal.open} onOpenChange={(open) => setShowResultModal({ ...showResultModal, open })}>
        <DialogContent className="bg-gray-50">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {showResultModal.type === 'success' ? (
                <CheckCircle2 className="h-5 w-5 text-green-600" />
              ) : (
                <XCircle className="h-5 w-5 text-destructive" />
              )}
              {showResultModal.title}
            </DialogTitle>
            <DialogDescription>
              {showResultModal.message}
            </DialogDescription>
          </DialogHeader>
          {showResultModal.type === 'success' && showResultModal.discountCode && (
            <div className="rounded-lg border bg-muted p-4">
              <p className="text-sm font-medium text-foreground mb-2">Your discount code:</p>
              <div className="rounded-md border-2 border-primary bg-background p-3">
                <p className="text-2xl font-bold text-primary text-center">
                  {showResultModal.discountCode}
                </p>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button onClick={() => setShowResultModal({ ...showResultModal, open: false })} variant="outline">
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reset Store Confirmation Modal */}
      <Dialog open={showResetModal} onOpenChange={setShowResetModal}>
        <DialogContent className="bg-gray-50">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              Reset Store
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to reset the store?
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="rounded-lg border border-destructive/20 bg-destructive/5 p-4">
              <p className="text-sm font-semibold text-foreground mb-2">
                This action will permanently delete:
              </p>
              <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1 ml-2">
                <li>All orders</li>
                <li>All shopping carts</li>
                <li>All discount codes</li>
              </ul>
            </div>

            <div className="rounded-lg border border-green-200 bg-green-50 p-4">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0" />
                <p className="text-sm font-semibold text-green-900">
                  Products will remain unchanged
                </p>
              </div>
            </div>

            <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-3">
              <div className="flex items-center justify-center gap-2">
                <AlertTriangle className="h-4 w-4 text-yellow-600" />
                <p className="text-sm font-semibold text-yellow-900">
                  This action cannot be undone!
                </p>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowResetModal(false)}
              disabled={resetting}
            >
              Cancel
            </Button>
            <Button
              onClick={handleResetStore}
              disabled={resetting}
              variant="destructive"
            >
              {resetting ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Resetting...
                </>
              ) : (
                <>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Reset Store
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
