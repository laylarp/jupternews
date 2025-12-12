// Configurações do Supabase
const SUPABASE_URL = 'https://mpbuejsxiltcfwfnqpfe.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1wYnVlanN4aWx0Y2Z3Zm5xcGZlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU1MDYwMzcsImV4cCI6MjA4MTA4MjAzN30.N2802Orv1LLDJ5hOpbn_zO8tKfKHsSY_hPBx68BX42c';

// Exportar configurações
window.supabaseConfig = {
    url: SUPABASE_URL,
    key: SUPABASE_ANON_KEY
};

console.log('Configurações do Supabase carregadas');