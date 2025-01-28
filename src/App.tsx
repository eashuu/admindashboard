import React, { useEffect, useState } from 'react';
import { supabase } from './lib/supabase';
import { StatCard } from './components/StatCard';
import { Users, CreditCard, Ticket, Music, School, Calendar } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface DashboardStats {
  totalRecords: number;
  successfulPayments: number;
  passTypes: {
    General: number;
    Hackathon: number;
    Signature: number;
  };
  successfulConcertPayments: number;
  eventsAttended: number;
  collegeDistribution: { name: string; count: number }[];
}

function App() {
  const [stats, setStats] = useState<DashboardStats>({
    totalRecords: 0,
    successfulPayments: 0,
    passTypes: { General: 0, Hackathon: 0, Signature: 0 },
    successfulConcertPayments: 0,
    eventsAttended: 0,
    collegeDistribution: [],
  });

  useEffect(() => {
    async function fetchStats() {
      // Get total records
      const { count: totalRecords } = await supabase
        .from('Participants')
        .select('*', { count: 'exact' });

      // Get successful payments count
      const { count: successfulPayments } = await supabase
        .from('Participants')
        .select('*', { count: 'exact' })
        .eq('Payment', 'Successful');

      // Get pass type distribution
      const { data: passData } = await supabase
        .from('Participants')
        .select('Pass');
      
      const passTypes = {
        General: passData?.filter(p => p.Pass === 'General').length || 0,
        Hackathon: passData?.filter(p => p.Pass === 'Hackathon').length || 0,
        Signature: passData?.filter(p => p.Pass === 'Signature').length || 0,
      };

      // Get successful concert payments
      const { count: successfulConcertPayments } = await supabase
        .from('Participants')
        .select('*', { count: 'exact' })
        .eq('Concert_Payment', 'Successful');

      // Get events attended count
      const { data: eventsData } = await supabase
        .from('Participants')
        .select('Event_1_Day3, Event_2_Day3, Event_3_Day3, Event_4_Day3, Event_1_Day4');
      
      let totalEvents = 0;
      eventsData?.forEach(participant => {
        if (participant.Event_1_Day3) totalEvents++;
        if (participant.Event_2_Day3) totalEvents++;
        if (participant.Event_3_Day3) totalEvents++;
        if (participant.Event_4_Day3) totalEvents++;
        if (participant.Event_1_Day4) totalEvents++;
      });

      // Get college distribution
      const { data: collegeData } = await supabase
        .from('Participants')
        .select('College');
      
      const collegeCount: { [key: string]: number } = {};
      collegeData?.forEach(({ College }) => {
        if (College) {
          collegeCount[College] = (collegeCount[College] || 0) + 1;
        }
      });

      const collegeDistribution = Object.entries(collegeCount)
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10);

      setStats({
        totalRecords: totalRecords || 0,
        successfulPayments: successfulPayments || 0,
        passTypes,
        successfulConcertPayments: successfulConcertPayments || 0,
        eventsAttended: totalEvents,
        collegeDistribution,
      });
    }

    fetchStats();
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Admin Dashboard</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <StatCard
            title="Total Participants"
            value={stats.totalRecords}
            icon={<Users size={24} />}
          />
          <StatCard
            title="Successful Payments"
            value={stats.successfulPayments}
            icon={<CreditCard size={24} />}
          />
          <StatCard
            title="Concert Payments"
            value={stats.successfulConcertPayments}
            icon={<Music size={24} />}
          />
          <StatCard
            title="Total Events Attended"
            value={stats.eventsAttended}
            icon={<Calendar size={24} />}
          />
          <StatCard
            title="Most Common Pass"
            value={Object.entries(stats.passTypes).reduce((a, b) => 
              a[1] > b[1] ? a : b)[0]}
            icon={<Ticket size={24} />}
          />
          <StatCard
            title="Different Colleges"
            value={stats.collegeDistribution.length}
            icon={<School size={24} />}
          />
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Pass Distribution</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={Object.entries(stats.passTypes).map(([name, value]) => ({
                  name,
                  value,
                }))}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#3B82F6" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">College Distribution (Top 10)</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.collegeDistribution}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#3B82F6" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;