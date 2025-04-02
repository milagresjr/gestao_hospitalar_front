import DemographicCard from '@/components/ecommerce/DemographicCard'
import { EcommerceMetrics } from '@/components/ecommerce/EcommerceMetrics'
import MonthlySalesChart from '@/components/ecommerce/MonthlySalesChart'
import MonthlyTarget from '@/components/ecommerce/MonthlyTarget'
import RecentOrders from '@/components/ecommerce/RecentOrders'
import StatisticsChart from '@/components/ecommerce/StatisticsChart'
import type { Metadata } from 'next'
import React from 'react'
import { withAuth } from '@/hot/withAuth'

export const metadata: Metadata = {
  title: 'SGH | Dashboard',
  description: 'Página de Dashboard',
}

export default function Ecommerce() {
  return (
    <div className="flex flex-col gap-4 w-full">
      {/* <div className="col-span-12 space-y-6 xl:col-span-7"> */}
        <EcommerceMetrics />

        <MonthlySalesChart />
      {/* </div> */}

      {/* <div className="col-span-12 xl:col-span-5">
        <MonthlyTarget />
      </div>

      <div className="col-span-12">
        <StatisticsChart />
      </div> */}
    </div>
  )
}
