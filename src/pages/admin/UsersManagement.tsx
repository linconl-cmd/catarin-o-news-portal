import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { UserPlus, Shield, Trash2, Loader2 } from "lucide-react";

type AppRole = "master" | "tecnico" | "editorial";

interface UserWithRole {
  user_id: string;
  full_name: string | null;
  email: string;
  role: AppRole | null;
  created_at: string;
}

const ROLE_LABELS: Record<AppRole, string> = {
  master: "Admin Master",
  tecnico: "Admin Técnico",
  editorial: "Admin Editorial",
};

const ROLE_COLORS: Record<AppRole, string> = {
  master: "bg-red-100 text-red-800 border-red-200",
  tecnico: "bg-blue-100 text-blue-800 border-blue-200",
  editorial: "bg-green-100 text-green-800 border-green-200",
};

const AdminUsersManagement = () => {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<UserWithRole[]>([]);
  const [loading, setLoading] = useState(true);
  const [createOpen, setCreateOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [newEmail, setNewEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newName, setNewName] = useState("");
  const [newRole, setNewRole] = useState<AppRole>("editorial");
  const [editingUser, setEditingUser] = useState<UserWithRole | null>(null);
  const [editRole, setEditRole] = useState<AppRole>("editorial");
  const [editOpen, setEditOpen] = useState(false);

  const fetchUsers = async () => {
    setLoading(true);

    const { data: profiles, error: profilesError } = await supabase
      .from("profiles")
      .select("user_id, full_name, created_at")
      .order("created_at", { ascending: false });

    if (profilesError) {
      toast.error("Erro ao carregar utilizadores.");
      setLoading(false);
      return;
    }

    const { data: roles, error: rolesError } = await supabase
      .from("user_roles")
      .select("user_id, role");

    if (rolesError) {
      toast.error("Erro ao carregar roles.");
      setLoading(false);
      return;
    }

    const rolesMap = new Map(roles?.map((r) => [r.user_id, r.role as AppRole]));

    const usersWithRoles: UserWithRole[] = (profiles ?? []).map((p) => ({
      user_id: p.user_id,
      full_name: p.full_name,
      email: "",
      role: rolesMap.get(p.user_id) ?? null,
      created_at: p.created_at,
    }));

    setUsers(usersWithRoles);
    setLoading(false);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);

    // Save current admin session before signUp (signUp auto-logs in as new user)
    const { data: { session: adminSession } } = await supabase.auth.getSession();

    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email: newEmail,
      password: newPassword,
      options: {
        data: { full_name: newName },
      },
    });

    if (signUpError) {
      // Restore admin session on error
      if (adminSession) {
        await supabase.auth.setSession({
          access_token: adminSession.access_token,
          refresh_token: adminSession.refresh_token,
        });
      }
      toast.error(`Erro ao criar utilizador: ${signUpError.message}`);
      setCreating(false);
      return;
    }

    const newUserId = signUpData.user?.id;
    if (!newUserId) {
      if (adminSession) {
        await supabase.auth.setSession({
          access_token: adminSession.access_token,
          refresh_token: adminSession.refresh_token,
        });
      }
      toast.error("Erro inesperado: utilizador não retornado.");
      setCreating(false);
      return;
    }

    // Restore admin session immediately so subsequent DB calls use admin's permissions
    if (adminSession) {
      await supabase.auth.setSession({
        access_token: adminSession.access_token,
        refresh_token: adminSession.refresh_token,
      });
    }

    // Check if profile was auto-created by trigger, if not create it
    const { data: existingProfile } = await supabase
      .from("profiles")
      .select("id")
      .eq("user_id", newUserId)
      .maybeSingle();

    if (!existingProfile) {
      const { error: profileError } = await supabase.from("profiles").insert({
        user_id: newUserId,
        full_name: newName,
      });

      if (profileError) {
        toast.error(`Utilizador criado, mas erro no perfil: ${profileError.message}`);
      }
    }

    const { error: roleError } = await supabase.from("user_roles").insert({
      user_id: newUserId,
      role: newRole,
    });

    if (roleError) {
      toast.error(`Utilizador criado, mas erro ao atribuir role: ${roleError.message}`);
    } else {
      toast.success(`Utilizador ${newEmail} criado como ${ROLE_LABELS[newRole]}.`);
    }

    setNewEmail("");
    setNewPassword("");
    setNewName("");
    setNewRole("editorial");
    setCreateOpen(false);
    setCreating(false);
    fetchUsers();
  };

  const handleChangeRole = async () => {
    if (!editingUser) return;

    const { data: existingRole } = await supabase
      .from("user_roles")
      .select("id")
      .eq("user_id", editingUser.user_id)
      .maybeSingle();

    let error;
    if (existingRole) {
      ({ error } = await supabase
        .from("user_roles")
        .update({ role: editRole })
        .eq("user_id", editingUser.user_id));
    } else {
      ({ error } = await supabase.from("user_roles").insert({
        user_id: editingUser.user_id,
        role: editRole,
      }));
    }

    if (error) {
      toast.error(`Erro ao alterar role: ${error.message}`);
    } else {
      toast.success(`Role alterada para ${ROLE_LABELS[editRole]}.`);
    }

    setEditOpen(false);
    setEditingUser(null);
    fetchUsers();
  };

  const handleDeleteUser = async (userToDelete: UserWithRole) => {
    // Remove role
    const { error: roleError } = await supabase
      .from("user_roles")
      .delete()
      .eq("user_id", userToDelete.user_id);

    if (roleError) {
      toast.error(`Erro ao remover role: ${roleError.message}`);
      return;
    }

    // Remove profile
    const { error: profileError } = await supabase
      .from("profiles")
      .delete()
      .eq("user_id", userToDelete.user_id);

    if (profileError) {
      toast.error(`Erro ao remover perfil: ${profileError.message}`);
      return;
    }

    toast.success("Utilizador removido do sistema.");
    fetchUsers();
  };

  const openEditDialog = (u: UserWithRole) => {
    setEditingUser(u);
    setEditRole(u.role ?? "editorial");
    setEditOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold">Gestão de Utilizadores</h1>
          <p className="text-sm text-muted-foreground">
            Crie e gerencie os administradores do portal.
          </p>
        </div>

        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <DialogTrigger asChild>
            <Button>
              <UserPlus className="mr-2 h-4 w-4" />
              Novo Utilizador
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Criar Novo Utilizador</DialogTitle>
              <DialogDescription>
                Preencha os dados para criar um novo administrador.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreateUser} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="new-name">Nome Completo</Label>
                <Input
                  id="new-name"
                  placeholder="Nome do utilizador"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="new-email">Email</Label>
                <Input
                  id="new-email"
                  type="email"
                  placeholder="email@exemplo.com"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="new-password">Senha</Label>
                <Input
                  id="new-password"
                  type="password"
                  placeholder="Mínimo 6 caracteres"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  minLength={6}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="new-role">Nível de Acesso</Label>
                <Select value={newRole} onValueChange={(v) => setNewRole(v as AppRole)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="master">Admin Master</SelectItem>
                    <SelectItem value="tecnico">Admin Técnico</SelectItem>
                    <SelectItem value="editorial">Admin Editorial</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <DialogFooter>
                <Button type="submit" disabled={creating}>
                  {creating ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Criando...
                    </>
                  ) : (
                    "Criar Utilizador"
                  )}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Role Legend */}
      <div className="flex flex-wrap gap-4 rounded-lg border bg-card p-4">
        <div className="text-sm font-medium text-muted-foreground">Níveis de acesso:</div>
        <div className="flex flex-wrap gap-2">
          <Badge variant="outline" className={ROLE_COLORS.master}>
            Admin Master — Acesso total
          </Badge>
          <Badge variant="outline" className={ROLE_COLORS.tecnico}>
            Admin Técnico — Sem gestão de utilizadores
          </Badge>
          <Badge variant="outline" className={ROLE_COLORS.editorial}>
            Admin Editorial — Apenas notícias e categorias
          </Badge>
        </div>
      </div>

      {/* Users Table */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : users.length === 0 ? (
        <div className="rounded-lg border bg-card p-8 text-center text-muted-foreground">
          Nenhum utilizador encontrado. Crie o primeiro utilizador acima.
        </div>
      ) : (
        <div className="rounded-lg border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Nível de Acesso</TableHead>
                <TableHead>Criado em</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((u) => (
                <TableRow key={u.user_id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">
                        {u.full_name || "Sem nome"}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {u.user_id.slice(0, 8)}...
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    {u.role ? (
                      <Badge variant="outline" className={ROLE_COLORS[u.role]}>
                        {ROLE_LABELS[u.role]}
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-muted-foreground">
                        Sem role
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {new Date(u.created_at).toLocaleDateString("pt-BR")}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openEditDialog(u)}
                      >
                        <Shield className="mr-1 h-3 w-3" />
                        Alterar Role
                      </Button>

                      {u.user_id !== currentUser?.id && (
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="destructive" size="sm">
                              <Trash2 className="mr-1 h-3 w-3" />
                              Remover
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Remover utilizador?</AlertDialogTitle>
                              <AlertDialogDescription>
                                Esta ação irá remover o perfil e a role deste utilizador.
                                A conta de autenticação permanecerá no Supabase Auth
                                (remova manualmente no dashboard se necessário).
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancelar</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDeleteUser(u)}>
                                Confirmar Remoção
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Edit Role Dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Alterar Nível de Acesso</DialogTitle>
            <DialogDescription>
              Alterar a role de {editingUser?.full_name || "utilizador"}.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Novo Nível de Acesso</Label>
              <Select value={editRole} onValueChange={(v) => setEditRole(v as AppRole)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="master">Admin Master</SelectItem>
                  <SelectItem value="tecnico">Admin Técnico</SelectItem>
                  <SelectItem value="editorial">Admin Editorial</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleChangeRole}>Salvar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminUsersManagement;
