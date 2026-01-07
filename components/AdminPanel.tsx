
import React, { useState } from 'react';
import { User, UserRole } from '../types';

interface AdminPanelProps {
  users: User[];
  setUsers: React.Dispatch<React.SetStateAction<User[]>>;
}

const AdminPanel: React.FC<AdminPanelProps> = ({ users, setUsers }) => {
  const [editingUser, setEditingUser] = useState<Partial<User> | null>(null);

  const saveUser = (e: React.FormEvent) => {
    e.preventDefault();
    const data = editingUser as User;
    if (users.find(u => u.id === data.id)) {
      setUsers(prev => prev.map(u => u.id === data.id ? data : u));
    } else {
      setUsers(prev => [...prev, { ...data, id: Math.random().toString(36).substr(2, 9) }]);
    }
    setEditingUser(null);
  };

  const deleteUser = (id: string) => {
    if (confirm("Remover colaborador?")) {
      setUsers(prev => prev.filter(u => u.id !== id));
    }
  };

  return (
    <div className="p-8 h-full overflow-y-auto bg-slate-50">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Equipe</h1>
        <button 
          onClick={() => setEditingUser({ name: '', username: '', password: '', role: UserRole.WAITER })}
          className="bg-indigo-600 text-white px-6 py-2 rounded-xl font-bold"
        >
          + Adicionar
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 text-[10px] font-black text-slate-400 uppercase tracking-widest">
              <th className="px-6 py-4">Nome</th>
              <th className="px-6 py-4">Usuário</th>
              <th className="px-6 py-4">Cargo</th>
              <th className="px-6 py-4 text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-sm">
            {users.map(user => (
              <tr key={user.id} className="hover:bg-slate-50 transition">
                <td className="px-6 py-4 font-bold text-slate-800">{user.name}</td>
                <td className="px-6 py-4 text-slate-500">@{user.username}</td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded text-[9px] font-black uppercase ${
                    user.role === UserRole.ADMIN ? 'bg-indigo-100 text-indigo-700' : 
                    user.role === UserRole.KITCHEN ? 'bg-orange-100 text-orange-700' :
                    'bg-slate-100 text-slate-500'
                  }`}>
                    {user.role}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <button onClick={() => setEditingUser(user)} className="text-indigo-600 mr-4 font-bold text-xs">Editar</button>
                  <button onClick={() => deleteUser(user.id)} className="text-red-400 font-bold text-xs">Excluir</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {editingUser && (
        <div className="fixed inset-0 bg-black/50 z-[200] flex items-center justify-center p-4">
          <form onSubmit={saveUser} className="bg-white rounded-3xl p-8 w-full max-w-md shadow-2xl">
            <h2 className="text-xl font-bold mb-6">Colaborador</h2>
            <div className="space-y-4">
              <input 
                required placeholder="Nome" value={editingUser.name}
                onChange={e => setEditingUser({...editingUser, name: e.target.value})}
                className="w-full px-4 py-3 rounded-xl border border-slate-200"
              />
              <input 
                required placeholder="Usuário" value={editingUser.username}
                onChange={e => setEditingUser({...editingUser, username: e.target.value})}
                className="w-full px-4 py-3 rounded-xl border border-slate-200"
              />
              <input 
                required placeholder="Senha" value={editingUser.password}
                onChange={e => setEditingUser({...editingUser, password: e.target.value})}
                className="w-full px-4 py-3 rounded-xl border border-slate-200"
              />
              <select 
                value={editingUser.role}
                onChange={e => setEditingUser({...editingUser, role: e.target.value as any})}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white"
              >
                <option value={UserRole.WAITER}>Garçom</option>
                <option value={UserRole.CASHIER}>Caixa</option>
                <option value={UserRole.KITCHEN}>Cozinha</option>
                <option value={UserRole.ADMIN}>Administrador</option>
              </select>
            </div>
            <div className="flex gap-4 mt-8">
              <button type="button" onClick={() => setEditingUser(null)} className="flex-1 py-3 text-slate-400">Cancelar</button>
              <button type="submit" className="flex-1 py-3 bg-indigo-600 text-white rounded-xl font-bold">Salvar</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default AdminPanel;
