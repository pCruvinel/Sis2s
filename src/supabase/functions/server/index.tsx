import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import * as kv from "./kv_store.tsx";
import * as bcrypt from "npm:bcryptjs@2.4.3";

const app = new Hono();

// Enable logger
app.use('*', logger(console.log));

// Enable CORS for all routes and methods
app.use(
  "/*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
  }),
);

// Health check endpoint
app.get("/make-server-6463775c/health", (c) => {
  return c.json({ status: "ok" });
});

/**
 * ╔════════════════════════════════════════════════════════════════╗
 * ║  ENDPOINT: Hash de Senha                                       ║
 * ║  POST /make-server-6463775c/hash-password                      ║
 * ║  Body: { password: string }                                    ║
 * ║  Returns: { hash: string }                                     ║
 * ╚════════════════════════════════════════════════════════════════╝
 */
app.post("/make-server-6463775c/hash-password", async (c) => {
  try {
    const { password } = await c.req.json();
    
    if (!password || typeof password !== 'string') {
      return c.json({ error: 'Senha inválida' }, 400);
    }

    // Gerar hash com salt rounds = 10
    const hash = await bcrypt.hash(password, 10);
    
    return c.json({ hash });
  } catch (error: any) {
    console.error('❌ Erro ao gerar hash de senha:', error);
    return c.json({ error: error.message || 'Erro ao gerar hash' }, 500);
  }
});

/**
 * ╔════════════════════════════════════════════════════════════════╗
 * ║  ENDPOINT: Validar Senha                                       ║
 * ║  POST /make-server-6463775c/verify-password                    ║
 * ║  Body: { password: string, hash: string }                      ║
 * ║  Returns: { valid: boolean }                                   ║
 * ╚════════════════════════════════════════════════════════════════╝
 */
app.post("/make-server-6463775c/verify-password", async (c) => {
  try {
    const { password, hash } = await c.req.json();
    
    if (!password || !hash) {
      return c.json({ error: 'Senha e hash são obrigatórios' }, 400);
    }

    const valid = await bcrypt.compare(password, hash);
    
    return c.json({ valid });
  } catch (error: any) {
    console.error('❌ Erro ao validar senha:', error);
    return c.json({ error: error.message || 'Erro ao validar senha' }, 500);
  }
});

Deno.serve(app.fetch);