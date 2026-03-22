# 🎵 MeloDash — Smart Contract

> Plataforma de streaming musical com cashback em crypto na rede **Monad**

---

## 📐 Arquitetura

```
Usuário paga 20 MON
        │
        ├── 60% → Pool dos Artistas (distribuído por minutos ouvidos)
        ├── 30% → Plataforma
        └── 10% → Cashback do usuário
```

---

## 🗂️ Estrutura do Projeto

```
melodash/
├── contracts/
│   └── MeloDash.sol          # Smart contract principal
├── scripts/
│   └── deploy.ts             # Script de deploy
├── frontend/
│   ├── melodash.abi.ts       # ABI + endereço para o frontend
│   └── useMeloDash.ts        # Funções de integração (viem)
├── hardhat.config.ts
├── package.json
└── .env.example
```

---

## 🚀 Deploy

### 1. Instalar dependências

```bash
npm install
```

### 2. Configurar variáveis de ambiente

```bash
cp .env.example .env
# Edite o .env com sua chave privada
```

### 3. Compilar o contrato

```bash
npm run compile
```

### 4. Deploy na Monad Testnet

```bash
npm run deploy:testnet
```

### 5. Deploy na Monad Mainnet

```bash
npm run deploy:mainnet
```

---

## 🔗 Redes Monad

| Rede      | Chain ID | RPC                              | Explorer                          |
|-----------|----------|----------------------------------|-----------------------------------|
| Testnet   | 10143    | https://testnet-rpc.monad.xyz    | https://testnet.monadexplorer.com |
| Mainnet   | 143      | https://rpc.monad.xyz            | https://monadexplorer.com         |

---

## 📋 Funções do Contrato

### Para Usuários
| Função              | Descrição                        | Payable |
|---------------------|----------------------------------|---------|
| `subscribe()`       | Assinar pela primeira vez        | ✅      |
| `renew()`           | Renovar assinatura               | ✅      |
| `withdrawCashback()`| Sacar cashback acumulado         | ❌      |

### Para Artistas
| Função              | Descrição                        |
|---------------------|----------------------------------|
| `withdrawArtist()`  | Sacar saldo do mês fechado       |

### Para o Owner (Backend)
| Função                          | Descrição                              |
|---------------------------------|----------------------------------------|
| `closeMonth()`                  | Fecha o mês e distribui os pools       |
| `registerArtist(address)`       | Cadastrar artista na plataforma        |
| `removeArtist(address)`         | Remover artista                        |
| `recordListening(user, artist, minutes)` | Registrar minutos ouvidos     |
| `withdrawPlatform()`            | Sacar saldo da plataforma              |
| `updateSubscriptionPrice(wei)`  | Atualizar preço da assinatura          |

---

## 🔌 Integração com Frontend

Após o deploy, atualize o endereço em `frontend/melodash.abi.ts`:

```typescript
export const MELODASH_ADDRESS = "0xSEU_ENDERECO_AQUI" as `0x${string}`;
```

Exemplo de uso no React:

```typescript
import { subscribe, checkSubscription, getSubscriberInfo } from "./useMeloDash";

// Verificar assinatura
const ativo = await checkSubscription("0x...");

// Assinar
await subscribe("20"); // 20 MON

// Ver cashback
const info = await getSubscriberInfo("0x...");
console.log(info.cashbackBalance); // ex: "2.0 MON"
```

---

## ⚠️ Segurança

- Nunca comite o arquivo `.env`
- A chave privada do owner deve ficar **apenas no backend**
- O `closeMonth()` deve ser chamado via **cron job** mensal no servidor
- Antes do mainnet, audite o contrato

---

## 🪙 Obter MON Testnet (Faucet)

Acesse: https://faucet.monad.xyz

---

## 📞 Suporte Monad

- Discord: https://discord.gg/monaddev
- Docs: https://docs.monad.xyz
