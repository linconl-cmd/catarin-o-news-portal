import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, FolderTree, Users, Eye } from "lucide-react";

const AdminDashboard = () => {
  const { user, roles } = useAuth();

  const stats = [
    { title: "Notícias", value: "—", icon: FileText, description: "Total de artigos" },
    { title: "Categorias", value: "—", icon: FolderTree, description: "Categorias ativas" },
    { title: "Utilizadores", value: "—", icon: Users, description: "Utilizadores registados" },
    { title: "Visualizações", value: "—", icon: Eye, description: "Últimos 30 dias" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">
          Bem-vindo, {user?.email}. Perfil: <strong className="text-primary">{roles.join(", ") || "Sem role"}</strong>
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{stat.title}</CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">{stat.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default AdminDashboard;
