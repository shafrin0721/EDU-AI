import React, { useEffect, useState } from "react";
import { Calendar, CreditCard, DollarSign, Download, TrendingUp } from "lucide-react";
import Button from "@/components/atoms/Button";
import Card from "@/components/atoms/Card";
import Badge from "@/components/atoms/Badge";
import Loading from "@/components/ui/Loading";

const Billing = () => {
  const [billingData, setBillingData] = useState(null);
  const [loading, setLoading] = useState(true);

  const handleDownloadInvoice = (invoice) => {
    // Create a simple PDF-like content
    const pdfContent = `
      Invoice: ${invoice.id}
      Date: ${invoice.date}
      Amount: $${invoice.amount}
      Status: ${invoice.status}
      
      Thank you for your business!
    `;
    
    const blob = new Blob([pdfContent], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `invoice-${invoice.id}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
    
    console.log(`Invoice ${invoice.id} downloaded successfully`);
  };

  useEffect(() => {
    const fetchBillingData = async () => {
      try {
        setLoading(true);
        
        // Mock API call - replace with actual service call
        const mockData = {
          currentPlan: {
            name: 'Professional',
            price: 49.99,
            billingCycle: 'month',
            nextBilling: '2024-02-15',
            features: [
              'Unlimited courses',
              'Up to 500 students', 
              'Advanced analytics',
              'Priority support',
              'Custom branding'
            ]
          },
          paymentMethod: {
            type: 'credit_card',
            last4: '4242',
            brand: 'Visa',
            expiryMonth: 12,
            expiryYear: 2025
          },
          invoices: [
            {
              id: 'INV-001',
              date: '2024-01-15',
              amount: 49.99,
              status: 'paid',
              downloadUrl: '#'
            },
            {
              id: 'INV-002',
              date: '2023-12-15',
              amount: 49.99,
              status: 'paid',
              downloadUrl: '#'
            },
            {
              id: 'INV-003',
              date: '2023-11-15',
              amount: 49.99,
              status: 'paid',
              downloadUrl: '#'
            }
          ]
        };
        
        setBillingData(mockData);
      } catch (err) {
        console.error('Failed to load billing data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchBillingData();
  }, []);

  if (loading) return <Loading />;
  if (!billingData) return <div>Error loading billing information</div>;

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Billing & Subscription</h1>
          <p className="text-gray-600">Manage your subscription and payment methods</p>
        </div>
        <Button className="flex items-center gap-2">
          <TrendingUp className="h-4 w-4" />
          Upgrade Plan
        </Button>
      </div>

      {/* Current Plan */}
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <DollarSign className="h-5 w-5 text-gray-600" />
          <h2 className="text-lg font-semibold text-gray-900">Current Plan</h2>
        </div>
        
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="text-2xl font-bold text-gray-900">{billingData.currentPlan.name}</div>
            <div className="text-gray-600">
              ${billingData.currentPlan.price}/{billingData.currentPlan.billingCycle}
            </div>
          </div>
          <Badge variant="success">Active</Badge>
        </div>
        
        <div className="space-y-2 mb-4">
          <div className="text-sm font-medium text-gray-700">Plan Features:</div>
          <ul className="text-sm text-gray-600 space-y-1">
            {billingData.currentPlan.features.map((feature, index) => (
              <li key={index} className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                {feature}
              </li>
            ))}
          </ul>
        </div>
        
        <div className="text-sm text-gray-500">
          Next billing date: {billingData.currentPlan.nextBilling}
        </div>
      </Card>

      {/* Payment Method */}
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <CreditCard className="h-5 w-5 text-gray-600" />
          <h2 className="text-lg font-semibold text-gray-900">Payment Method</h2>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded flex items-center justify-center text-white font-bold text-xs">
              {billingData.paymentMethod.brand.toUpperCase()}
            </div>
            <div>
              <div className="font-medium text-gray-900">
                •••• •••• •••• {billingData.paymentMethod.last4}
              </div>
              <div className="text-sm text-gray-500">
                Expires {billingData.paymentMethod.expiryMonth}/{billingData.paymentMethod.expiryYear}
              </div>
            </div>
          </div>
          <Button variant="outline" size="sm">
            Update
          </Button>
        </div>
      </Card>

      {/* Billing History */}
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <Calendar className="h-5 w-5 text-gray-600" />
          <h2 className="text-lg font-semibold text-gray-900">Billing History</h2>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b border-gray-200">
              <tr>
                <th className="text-left py-3 text-sm font-medium text-gray-500">Invoice</th>
                <th className="text-left py-3 text-sm font-medium text-gray-500">Date</th>
                <th className="text-left py-3 text-sm font-medium text-gray-500">Amount</th>
                <th className="text-left py-3 text-sm font-medium text-gray-500">Status</th>
                <th className="text-right py-3 text-sm font-medium text-gray-500">Download</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
{billingData.invoices.map((invoice) => (
                <tr key={invoice.id} className="hover:bg-gray-50">
                  <td className="py-3 text-sm font-medium text-gray-900">{invoice.id}</td>
                  <td className="py-3 text-sm text-gray-600">{invoice.date}</td>
                  <td className="py-3 text-sm text-gray-900">${invoice.amount}</td>
                  <td className="py-3">
                    <Badge 
                      variant={invoice.status === 'paid' ? 'success' : 'warning'}
                      size="sm"
                    >
                      {invoice.status}
                    </Badge>
                  </td>
                  <td className="py-3 text-right">
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => handleDownloadInvoice(invoice)}
                      title="Download Invoice"
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Usage Statistics */}
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="h-5 w-5 text-gray-600" />
          <h2 className="text-lg font-semibold text-gray-900">Usage This Month</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">127</div>
            <div className="text-sm text-gray-500">Active Students</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">23</div>
            <div className="text-sm text-gray-500">Courses Created</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">1,456</div>
            <div className="text-sm text-gray-500">API Requests</div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default Billing;