import { createClient } from '@supabase/supabase-js';
import { hashPassword } from 'better-auth/crypto';
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';

function loadEnv() {
  const envFiles = ['.env.local', '.env'];
  for (const file of envFiles) {
    const fullPath = path.resolve(process.cwd(), file);
    if (fs.existsSync(fullPath)) {
      const content = fs.readFileSync(fullPath, 'utf8');
      content.split('\n').forEach((line) => {
        const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
        if (match) {
          const key = match[1];
          let value = match[2] || '';
          if (value.startsWith('"') && value.endsWith('"')) value = value.slice(1, -1);
          if (value.startsWith("'") && value.endsWith("'")) value = value.slice(1, -1);
          if (!process.env[key]) {
            process.env[key] = value.trim();
          }
        }
      });
    }
  }
}

loadEnv();

async function run() {
  console.log('\n======================================================');
  console.log('🐝 BeeRank — Reset do Banco & Seed do Administrador');
  console.log('======================================================\n');

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_PUBLISHABLE_KEY;
  const secretKey = process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !secretKey) {
    console.error('❌ ERRO: SUPABASE_URL e SUPABASE_SECRET_KEY precisam estar configuradas no .env.local');
    process.exit(1);
  }

  const supabase = createClient(supabaseUrl, secretKey, {
    auth: { persistSession: false },
  });

  console.log('1. Conectando ao Supabase...');
  const { error: testError } = await supabase.from('polls').select('id').limit(1);
  if (testError) {
    console.error('❌ Erro ao conectar ao banco:', testError.message);
    process.exit(1);
  }
  console.log('   ✅ Conexão bem-sucedida!');

  console.log('\n2. Zerando todos os dados existentes no banco (Reset)...');
  
  // Limpar tabelas de enquetes e votos
  const { error: delVoteItems } = await supabase.from('poll_vote_items').delete().gte('score', 0);
  if (delVoteItems) console.warn('   Aviso poll_vote_items:', delVoteItems.message);

  const { error: delVotes } = await supabase.from('poll_votes').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  if (delVotes) console.warn('   Aviso poll_votes:', delVotes.message);

  const { error: delItems } = await supabase.from('poll_items').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  if (delItems) console.warn('   Aviso poll_items:', delItems.message);

  const { error: delPolls } = await supabase.from('polls').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  if (delPolls) console.warn('   Aviso polls:', delPolls.message);

  // Limpar tabelas do Better Auth
  const { error: delSessions } = await supabase.from('session').delete().neq('id', 'temp');
  if (delSessions) console.warn('   Aviso session:', delSessions.message);

  const { error: delAccounts } = await supabase.from('account').delete().neq('id', 'temp');
  if (delAccounts) console.warn('   Aviso account:', delAccounts.message);

  const { error: delUsers } = await supabase.from('user').delete().neq('id', 'temp');
  if (delUsers) console.warn('   Aviso user:', delUsers.message);

  console.log('   ✅ Banco zerado com sucesso! Nenhuma enquete ou voto anterior restante.');

  console.log('\n3. Criando usuário Administrador exclusivo...');
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@beerank.com';
  const adminPassword = process.env.ADMIN_PASSWORD || 'AdminPassword123!';
  const adminName = 'Administrador BeeRank';

  const userId = crypto.randomUUID();
  const accountId = crypto.randomUUID();
  const hashedPassword = await hashPassword(adminPassword);
  const now = new Date().toISOString();

  // 1. Inserir User
  const { error: userError } = await supabase.from('user').insert({
    id: userId,
    name: adminName,
    email: adminEmail.toLowerCase().trim(),
    emailVerified: true,
    image: null,
    createdAt: now,
    updatedAt: now,
  });

  if (userError) {
    console.error('❌ Erro ao criar usuário admin:', userError.message);
    process.exit(1);
  }

  // 2. Inserir Account (credenciais do Better Auth)
  const { error: accError } = await supabase.from('account').insert({
    id: accountId,
    accountId: userId,
    providerId: 'credential',
    userId: userId,
    password: hashedPassword,
    createdAt: now,
    updatedAt: now,
  });

  if (accError) {
    console.error('❌ Erro ao vincular credencial do admin:', accError.message);
    process.exit(1);
  }

  console.log('   ✅ Administrador criado com sucesso!');

  console.log('\n======================================================');
  console.log('🎉 SEED CONCLUÍDO COM SUCESSO! 🐝');
  console.log('======================================================');
  console.log('Credenciais para login no painel de administração:');
  console.log(`   - Painel: http://localhost:3000/admin/login`);
  console.log(`   - E-mail: ${adminEmail}`);
  console.log(`   - Senha:  ${adminPassword}`);
  console.log('======================================================\n');
}

run();
