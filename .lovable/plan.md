
## Plano de Atualizações - Plataforma Conectados

### 1. Galeria de Fotos Dividida em Álbuns

**Arquivo:** `src/pages/Galeria.tsx`

**Situação atual:**
- A galeria pública exibe todas as fotos em um único grid, sem organização por álbuns
- Os álbuns já existem no banco de dados (Retiro 2026, Level Up 2025)

**Alterações:**
- Adicionar estado para selecionar álbuns
- Exibir lista de álbuns como cards com foto de capa
- Ao clicar em um álbum, mostrar apenas as fotos daquele álbum
- Adicionar navegação para voltar à lista de álbuns
- Mostrar o título e contagem de fotos de cada álbum

**Novo hook necessário em `src/hooks/useGallery.tsx`:**
- Criar `useGalleryPhotosWithAlbum` para buscar fotos com informações do álbum
- Ou criar query que retorna fotos agrupadas por álbum

---

### 2. Fotos Recentes na Página Inicial

**Arquivo:** `src/pages/Index.tsx`

**Situação atual:**
- Página inicial possui apenas logo, texto descritivo, botões e seção de redes sociais
- Existem 3 fotos no banco de dados

**Alterações:**
- Adicionar nova seção "Momentos" ou "Galeria" antes da seção de redes sociais
- Buscar as 4-6 fotos mais recentes do banco usando `useGalleryPhotos`
- Exibir em grid estilizado com efeito de hover
- Adicionar link "Ver todas" que redireciona para `/galeria`
- Design: cards com aspect-ratio 1:1, bordas arredondadas, efeito de scale no hover

**Novo hook em `src/hooks/useGallery.tsx`:**
- `useRecentPhotos(limit: number)` - busca as N fotos mais recentes ordenadas por `created_at DESC`

---

### 3. Adicionar Modo Claro no Sistema

**Arquivos afetados:**

**`src/App.tsx`:**
- Importar `ThemeProvider` de `next-themes`
- Envolver toda a aplicação com `<ThemeProvider attribute="class" defaultTheme="dark">`

**`src/components/AdminLayout.tsx`:**
- Adicionar botão de toggle de tema (Sol/Lua) no header
- Usar hook `useTheme` de `next-themes`

**`src/pages/Index.tsx`:**
- Adicionar botão de toggle no header ou footer para visitantes

**`src/index.css`:**
- As variáveis para modo claro (`.light`) já estão definidas
- Adicionar variáveis de glass para modo claro:
```css
.light {
  --glass-background: hsl(0, 0%, 100%, 0.9);
  --glass-border: hsl(0, 0%, 85%, 0.5);
}
```

**Novo componente sugerido:** `src/components/ThemeToggle.tsx`
- Botão reutilizável com ícones Sol/Lua
- Usa `useTheme()` para alternar entre dark/light

---

### 4. Remover Opção de Criar Conta no /admin/login

**Arquivo:** `src/pages/admin/Login.tsx`

**Situação atual:**
- Existe estado `isSignUp` e botão para alternar entre login e criação de conta
- O texto alterna entre "Já tem conta? Faça login" e "Primeiro acesso? Criar conta"

**Alterações:**
- Remover estado `isSignUp`
- Remover função `signUp` e sua importação do `useAuth`
- Remover o bloco JSX do botão de alternância (linhas 124-132)
- Simplificar o `handleSubmit` para apenas fazer login
- Atualizar texto do botão para sempre mostrar "Entrar"
- Remover referência a `isSubmitting ? 'Criando conta...'`

---

### Resumo das Alterações

| Item | Arquivo(s) | Tipo |
|------|-----------|------|
| Galeria por álbuns | `src/pages/Galeria.tsx`, `src/hooks/useGallery.tsx` | Frontend |
| Fotos na home | `src/pages/Index.tsx`, `src/hooks/useGallery.tsx` | Frontend |
| Modo claro | `src/App.tsx`, `src/index.css`, `src/components/AdminLayout.tsx`, novo `ThemeToggle.tsx` | Frontend |
| Remover signup | `src/pages/admin/Login.tsx` | Frontend |

---

### Ordem de Implementação

1. Primeiro: Remover opção de criar conta (correção rápida)
2. Segundo: Adicionar modo claro com ThemeProvider
3. Terceiro: Criar hook `useRecentPhotos` e integrar fotos na home
4. Quarto: Refatorar página de galeria para exibir álbuns

---

### Detalhes Adicionais

**Estrutura da Galeria por Álbuns:**
```text
/galeria
├── [Lista de Álbuns]     <- View inicial
│   ├── Card Álbum 1 (capa + título + contagem)
│   ├── Card Álbum 2
│   └── ...
└── [Fotos do Álbum]      <- Ao clicar em um álbum
    ├── Botão "Voltar"
    ├── Título do álbum
    └── Grid de fotos
```

**Seção de Fotos na Home:**
```text
[Hero Section]
[Seção "Nossos Momentos"]
  ├── Título "Momentos"
  ├── Grid 2x2 ou 3x2 com fotos recentes
  └── Link "Ver todas →" para /galeria
[Social Links Section]
[Footer]
```
