import AdminLayout from '@/components/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Calendar, Users, Heart, TrendingUp, DollarSign } from 'lucide-react';
import { useEvents } from '@/hooks/useEvents';
import { useRegistrations, useEventRevenue } from '@/hooks/useRegistrations';
import { useDonationStats } from '@/hooks/useDonations';

const Dashboard = () => {
  const { data: events } = useEvents();
  const { data: registrations } = useRegistrations();
  const { data: donationStats } = useDonationStats();
  const { data: eventRevenue, isLoading: loadingRevenue } = useEventRevenue();

  const activeEvents = events?.filter(e => e.is_active).length || 0;
  const totalRegistrations = registrations?.length || 0;
  const checkedInCount = registrations?.filter(r => r.checked_in).length || 0;
  const totalRevenue = eventRevenue?.reduce((sum, row) => sum + row.revenue, 0) ?? 0;

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

      <Card className="glass-card mt-6">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-primary" />
            Arrecadação por evento
          </CardTitle>
          {eventRevenue && eventRevenue.length > 0 && (
            <span className="text-sm font-medium text-muted-foreground">
              Total: R$ {totalRevenue.toFixed(2)}
            </span>
          )}
        </CardHeader>
        <CardContent>
          {loadingRevenue ? (
            <div className="flex justify-center py-8">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            </div>
          ) : !eventRevenue?.length ? (
            <p className="text-center text-muted-foreground py-6">Nenhum evento com arrecadação no momento.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Evento</TableHead>
                  <TableHead className="text-right">Arrecadado</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {eventRevenue.map((row) => (
                  <TableRow key={row.eventId}>
                    <TableCell className="font-medium">{row.eventTitle}</TableCell>
                    <TableCell className="text-right">R$ {row.revenue.toFixed(2)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </AdminLayout>
  );
};

export default Dashboard;
