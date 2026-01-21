import AdminLayout from '@/components/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, Users, Heart, TrendingUp } from 'lucide-react';
import { useEvents } from '@/hooks/useEvents';
import { useRegistrations } from '@/hooks/useRegistrations';
import { useDonationStats } from '@/hooks/useDonations';

const Dashboard = () => {
  const { data: events } = useEvents();
  const { data: registrations } = useRegistrations();
  const { data: donationStats } = useDonationStats();

  const activeEvents = events?.filter(e => e.is_active).length || 0;
  const totalRegistrations = registrations?.length || 0;
  const checkedInCount = registrations?.filter(r => r.checked_in).length || 0;

  const stats = [
    {
      title: 'Eventos Ativos',
      value: activeEvents,
      icon: Calendar,
      color: 'text-blue-500',
    },
    {
      title: 'Total de Inscritos',
      value: totalRegistrations,
      icon: Users,
      color: 'text-green-500',
    },
    {
      title: 'Doações do Mês',
      value: `R$ ${(donationStats?.monthlyTotal || 0).toFixed(2)}`,
      icon: Heart,
      color: 'text-pink-500',
    },
    {
      title: 'Taxa de Presença',
      value: totalRegistrations > 0 
        ? `${Math.round((checkedInCount / totalRegistrations) * 100)}%`
        : '0%',
      icon: TrendingUp,
      color: 'text-purple-500',
    },
  ];

  return (
    <AdminLayout title="Dashboard">
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title} className="glass-card">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>
    </AdminLayout>
  );
};

export default Dashboard;
